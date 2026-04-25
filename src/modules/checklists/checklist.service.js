import db from '../../models/index.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import * as s3Service from '../../services/s3.service.js';

const { ActivityPlanning, JobRequest, Survey } = db;

// ─────────────────────────────────────────────────────────────────────────────
// GET CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns checklist items for a job, plus the signed-checklist scan files
 * attached on the survey row.
 *
 * Response shape:
 *   {
 *     items: [{ id, job_id, question_code, ..., file_url }],
 *     signed_checklist_files: [<full https url>, ...]   // resolved
 *   }
 *
 * All file_url / signed_checklist_files entries are guaranteed to be either
 * fully-qualified HTTPS URLs or null — raw S3 keys are never leaked.
 */
export const getChecklist = async (jobId, filters = {}, user = null) => {
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

    const resolvedItems = await fileAccessService.resolveEntity(items, user);
    await ensureFullFileUrls(resolvedItems);

    // Pull the signed-checklist scan keys from the survey row (if any) and
    // resolve them to full HTTPS URLs.
    const survey = await Survey.findOne({
        where: { job_id: jobId },
        attributes: ['signed_checklist_files']
    });
    const signedFiles = await resolveKeyArray(survey?.signed_checklist_files, user);

    return {
        items: resolvedItems,
        signed_checklist_files: signedFiles
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persists checklist answers and (optionally) the S3 keys of the full
 * signed-checklist scan document(s) on the same call.
 *
 * Returns:
 *   {
 *     items: [...],                         // saved rows, file_url fully resolved
 *     signed_checklist_files: [https, ...]  // resolved URLs (or [])
 *   }
 *
 * Accepts the full `req.user` (or a raw user id string for legacy callers
 * such as test_full_flow.js) so audit log entries are attributed correctly.
 */
export const submitChecklist = async (jobId, items, user, signedChecklistFiles = null) => {
    // Normalise: caller may pass a full req.user object OR just the user id (string).
    const userObj = (typeof user === 'object' && user !== null) ? user : (user ? { id: user } : null);
    const userId = userObj?.id;
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

    if (signedChecklistFiles !== null && signedChecklistFiles !== undefined && !Array.isArray(signedChecklistFiles)) {
        throw { statusCode: 400, message: 'signed_checklist_files must be an array of S3 keys.' };
    }

    const txn = await db.sequelize.transaction();
    try {
        // Replace checklist (idempotent re-submission within same phase)
        await ActivityPlanning.destroy({ where: { job_id: jobId }, transaction: txn });

        const entries = items.map(item => ({ job_id: jobId, ...item }));
        const results = await ActivityPlanning.bulkCreate(entries, { transaction: txn });

        // Persist the signed-checklist scan keys on the same survey row, if provided.
        if (Array.isArray(signedChecklistFiles)) {
            await survey.update({ signed_checklist_files: signedChecklistFiles }, { transaction: txn });
        }

        // Advance survey status ONLY if it's in a previous state (STARTED or REWORK_REQUIRED)
        // If it's already CHECKLIST_SUBMITTED or PROOF_UPLOADED, we keep the current status.
        if (['STARTED', 'REWORK_REQUIRED'].includes(survey.survey_status)) {
            await lifecycleService.updateSurveyStatus(survey.id, 'CHECKLIST_SUBMITTED', userId,
                'Checklist items submitted', { transaction: txn });
        }

        await txn.commit();

        const resolvedItems = await fileAccessService.resolveEntity(results, userObj);
        await ensureFullFileUrls(resolvedItems);

        const persistedFiles = Array.isArray(signedChecklistFiles)
            ? signedChecklistFiles
            : (survey.signed_checklist_files || []);
        const signedFilesResolved = await resolveKeyArray(persistedFiles, userObj);

        return {
            items: resolvedItems,
            signed_checklist_files: signedFilesResolved
        };
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Defence-in-depth: walks an array of checklist rows and guarantees that
 * `file_url` is either a fully-qualified HTTPS URL or null.
 */
const ensureFullFileUrls = async (rows) => {
    if (!rows) return rows;
    const list = Array.isArray(rows) ? rows : [rows];

    await Promise.all(list.map(async (row) => {
        if (!row || typeof row !== 'object') return;
        const value = row.file_url;
        if (!value) {
            row.file_url = null;
            return;
        }
        if (typeof value === 'string' && !value.startsWith('http')) {
            row.file_url = await fileAccessService.resolveUrl(value, null, true);
        }
    }));

    return rows;
};

/**
 * Resolve an array of S3 keys (or already-full URLs) into full HTTPS URLs.
 * Returns [] for null/empty input.
 */
const resolveKeyArray = async (keys, user = null) => {
    if (!Array.isArray(keys) || keys.length === 0) return [];
    return Promise.all(
        keys
            .filter(k => typeof k === 'string' && k.length > 0)
            .map(k => k.startsWith('http')
                ? Promise.resolve(k)
                : fileAccessService.resolveUrl(k, user, true))
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD URL — per checklist-item evidence (one photo per question)
// ─────────────────────────────────────────────────────────────────────────────

export const getSignedUploadUrl = async (jobId, fileName, contentType, userId) => {
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    // Guard: Only assigned surveyor can upload proof for checklist
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    const key = `surveys/checklist-evidence/${jobId}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD URL — full signed-checklist scan (the whole filled & signed sheet)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a pre-signed S3 URL for the surveyor to upload the full signed
 * checklist scan (PDF/image). The returned `fileKey` should then be sent
 * back as part of `signed_checklist_files` on the next
 * PUT /checklists/jobs/:jobId submission.
 */
export const getSignedChecklistUploadUrl = async (jobId, fileName, contentType, userId) => {
    const job = await JobRequest.findByPk(jobId);
    if (!job) throw { statusCode: 404, message: 'The requested job could not be found.' };

    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    const key = `surveys/signed-checklists/${jobId}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};
