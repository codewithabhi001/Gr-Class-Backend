import db from '../../models/index.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as lifecycleService from '../../services/lifecycle.service.js';

const { ActivityPlanning, JobRequest, Survey } = db;

// ─────────────────────────────────────────────────────────────────────────────
// GET CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

export const getChecklist = async (jobId, filters = {}) => {
    const { answer, question_code, search } = filters;
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };
    const where = { job_id: jobId };

    if (answer) where.answer = answer;
    if (question_code) where.question_code = question_code;
    if (search) {
        where[db.Sequelize.Op.or] = [
            { question_text: { [db.Sequelize.Op.like]: `%${search}%` } },
            { remarks: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
    }

    const items = await ActivityPlanning.findAll({
        where,
        attributes: [
            'id',
            'job_id',
            'question_code',
            'question_text',
            'answer',
            'remarks',
            'file_url',
            'created_at',
            'updated_at'
        ]
    });
    return await fileAccessService.resolveEntity(items);
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

export const submitChecklist = async (jobId, items, userId) => {
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    // ── Guard 1: Terminal state ──
    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    // ── Guard 2: Post-finalization (payment / certified) ──
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `The checklist cannot be updated as the job has already moved to ${job.job_status} status.` };
    }

    // ── Guard 3: Only the assigned surveyor ──
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    const survey = await Survey.findOne({ where: { job_id: jobId } });
    if (!survey) throw { statusCode: 400, message: 'The survey has not been started yet. Please check-in first.' };

    // ── Guard 4: Survey must be in an active state (not before, not after) ──
    const activeStatuses = ['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];
    if (!activeStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `The checklist cannot be modified as the survey is in ${survey.survey_status} status.` };
    }

    const txn = await db.sequelize.transaction();
    try {
        // Replace checklist (idempotent re-submission within same phase)
        await ActivityPlanning.destroy({ where: { job_id: jobId }, transaction: txn });

        const entries = items.map(item => ({ job_id: jobId, ...item }));
        const results = await ActivityPlanning.bulkCreate(entries, { transaction: txn });

        // Advance survey status ONLY if it's in a previous state (STARTED or REWORK_REQUIRED)
        // If it's already CHECKLIST_SUBMITTED or PROOF_UPLOADED, we keep the current status.
        if (['STARTED', 'REWORK_REQUIRED'].includes(survey.survey_status)) {
            await lifecycleService.updateSurveyStatus(survey.id, 'CHECKLIST_SUBMITTED', userId,
                'Checklist items submitted', { transaction: txn });
        }

        await txn.commit();
        return await fileAccessService.resolveEntity(results, { id: userId });
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};
