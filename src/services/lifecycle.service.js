import db from '../models/index.js';
import logger from '../utils/logger.js';

const { JobRequest, JobStatusHistory, Survey, SurveyStatusHistory, User } = db;

// ─────────────────────────────────────────────────────────────────────────────
// TERMINAL STATE CONSTANTS — Absolute single source of truth.
// Import and use these everywhere. Never hardcode state strings.
// ─────────────────────────────────────────────────────────────────────────────
export const JOB_TERMINAL_STATES = ['CERTIFIED', 'REJECTED'];
export const SURVEY_TERMINAL_STATES = ['FINALIZED'];

// States after which PAYMENT / REWORK / SURVEY actions are permanently blocked.
export const JOB_POST_FINALIZATION_STATES = ['FINALIZED', 'CERTIFIED'];

/**
 * PAYMENT_DONE (MySQL ENUM): May still exist on legacy schemas. The application does **not**
 * drive job lifecycle through PAYMENT_DONE — payment truth is `payments.payment_status` (e.g. PAID).
 * Certification moves the job FINALIZED → CERTIFIED via `updateJobStatus` after payment + compliance guards.
 */

// ─────────────────────────────────────────────────────────────────────────────
// STRICT TRANSITION MAPS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Job status transition map.
 *
 * IMPORTANT: 'FINALIZED' appears in SURVEY_DONE / REVIEWED only to allow
 * the internal auto-sync from updateSurveyStatus. No HTTP endpoint may
 * directly call updateJobStatus(... 'FINALIZED' ...).
 * The extra guard inside updateJobStatus enforces this invariant at runtime.
 */
export const JOB_TRANSITIONS = {
    CREATED: ['DOCUMENT_VERIFIED', 'REJECTED'],
    DOCUMENT_VERIFIED: ['APPROVED', 'REJECTED'],
    APPROVED: ['ASSIGNED', 'REJECTED', 'FINALIZED'],
    ASSIGNED: ['SURVEY_AUTHORIZED', 'REJECTED'],
    SURVEY_AUTHORIZED: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['SURVEY_DONE', 'REWORK_REQUESTED', 'REJECTED'],
    SURVEY_DONE: ['REVIEWED', 'REWORK_REQUESTED', 'FINALIZED', 'REJECTED'],
    REVIEWED: ['REWORK_REQUESTED', 'FINALIZED', 'REJECTED'],
    FINALIZED: ['CERTIFIED'],
    REWORK_REQUESTED: ['IN_PROGRESS', 'SURVEY_DONE', 'REJECTED'],
    CERTIFIED: [],   // terminal
    REJECTED: [],   // terminal
};

/**
 * Survey status transition map.
 * Every allowed edge is explicit. Nothing else is permitted.
 */
export const SURVEY_TRANSITIONS = {
    NOT_STARTED: ['STARTED'],
    STARTED: ['CHECKLIST_SUBMITTED'],
    CHECKLIST_SUBMITTED: ['PROOF_UPLOADED', 'SUBMITTED'],
    PROOF_UPLOADED: ['SUBMITTED'],
    SUBMITTED: ['REWORK_REQUIRED', 'FINALIZED'],
    REWORK_REQUIRED: ['CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'SUBMITTED'],
    FINALIZED: [],  // terminal
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const validateTransition = (current, next, map) => {
    const allowed = map[current] || [];
    if (!allowed.includes(next)) {
        throw { statusCode: 400, message: `Action not allowed: cannot move from ${current} to ${next} status.` };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB STATUS UPDATE — Centralized, Locked, Audited
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The ONLY function that may change job_status.
 * All routes, services, and controllers must call this.
 * Direct model updates to job_status are forbidden.
 *
 * @param {string}  jobId
 * @param {string}  newStatus
 * @param {string}  userId      - Actor performing the change
 * @param {string}  [reason]
 * @param {object}  [options]   - { transaction, _internal }
 *                                _internal:true means called from survey sync (only path allowed to set FINALIZED)
 */
export const updateJobStatus = async (jobId, newStatus, userId, reason = null, options = {}) => {
    const { transaction: externalTxn, _internal = false } = options;
    const txn = externalTxn || await db.sequelize.transaction();

    try {
        // ── Concurrency: always lock the row ──
        const job = await JobRequest.findByPk(jobId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!job) throw { statusCode: 404, message: 'Job not found' };

        const previousStatus = job.job_status;

        // ── 1. Absolute terminal state guard ──
        if (JOB_TERMINAL_STATES.includes(previousStatus)) {
            throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
        }

        // ── 2. FINALIZED can only be set via the internal survey-sync path (if survey required) ──
        if (newStatus === 'FINALIZED' && !_internal && job.is_survey_required) {
            throw { statusCode: 403, message: 'Job cannot be finalized directly. Please finalize the survey report first.' };
        }

        // ── 3. Idempotency ──
        if (previousStatus === newStatus) {
            if (!externalTxn) await txn.commit();
            return job;
        }

        // ── 4. Transition map validation ──
        validateTransition(previousStatus, newStatus, JOB_TRANSITIONS);

        // ── 5. Apply ──
        await job.update({ job_status: newStatus }, { transaction: txn });

        // ── 6. Audit history (in same transaction) ──
        await JobStatusHistory.create({
            job_id: jobId,
            previous_status: previousStatus,
            new_status: newStatus,
            changed_by: userId,
            reason
        }, { transaction: txn });

        // ── 7. Structured log ──
        logger.info({
            entity: 'JOB', event: 'STATUS_CHANGE',
            jobId, from: previousStatus, to: newStatus,
            triggeredBy: userId, reason: reason ?? undefined,
        });

        // ── 8. Automatic Survey sync & Provisioning (per JobCertificate) ──
        if (job.is_survey_required) {
            const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, transaction: txn });

            if (['ASSIGNED', 'SURVEY_AUTHORIZED', 'IN_PROGRESS'].includes(newStatus) && job.assigned_surveyor_id) {
                // Provision/sync one Survey per JobCertificate
                for (const jc of jobCerts) {
                    const existingSurvey = await Survey.findOne({ where: { job_certificate_id: jc.id }, transaction: txn });
                    if (!existingSurvey) {
                        await Survey.create({
                            job_certificate_id: jc.id,
                            surveyor_id: job.assigned_surveyor_id,
                            survey_status: 'NOT_STARTED',
                        }, { transaction: txn });
                    } else if (existingSurvey.surveyor_id !== job.assigned_surveyor_id) {
                        await existingSurvey.update({ surveyor_id: job.assigned_surveyor_id }, { transaction: txn });
                    }
                    // Also update JobCertificate status to SURVEY_AUTHORIZED if applicable
                    if (newStatus === 'SURVEY_AUTHORIZED' && jc.status === 'DOCUMENT_VERIFIED') {
                        await jc.update({ status: 'SURVEY_AUTHORIZED' }, { transaction: txn });
                    }
                }
            }

            // Sync Status: If Job moves to REWORK, all non-finalized Surveys must follow
            if (newStatus === 'REWORK_REQUESTED') {
                const surveys = await Survey.findAll({ where: { job_certificate_id: jobCerts.map(jc => jc.id) }, transaction: txn });
                for (const survey of surveys) {
                    if (!['FINALIZED', 'REWORK_REQUIRED'].includes(survey.survey_status)) {
                        const prevSurveyStatus = survey.survey_status;
                        await survey.update({ survey_status: 'REWORK_REQUIRED' }, { transaction: txn });
                        await SurveyStatusHistory.create({
                            survey_id: survey.id,
                            previous_status: prevSurveyStatus,
                            new_status: 'REWORK_REQUIRED',
                            changed_by: userId,
                            reason: `Auto-sync: Job → ${newStatus} (Reason: ${reason || 'N/A'})`,
                            submission_iteration: survey.submission_count
                        }, { transaction: txn });
                    }
                }
            }
        }

        if (!externalTxn) await txn.commit();
        return job;
    } catch (error) {
        if (!externalTxn) await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SURVEY STATUS UPDATE — Centralized, Locked, Audited
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The ONLY function that may change survey_status.
 * Automatically syncs Job status for key transitions.
 * Survey → FINALIZED is the ONLY path that ever sets Job → FINALIZED.
 *
 * @param {string}  surveyId
 * @param {string}  newStatus
 * @param {string}  userId      - Actor performing the change
 * @param {string}  [reason]
 * @param {object}  [options]   - { transaction }
 */
export const updateSurveyStatus = async (surveyId, newStatus, userId, reason = null, options = {}) => {
    const { transaction: externalTxn, _skipJobSync = false } = options;
    const txn = externalTxn || await db.sequelize.transaction();

    try {
        // ── Concurrency: always lock the row ──
        const survey = await Survey.findByPk(surveyId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!survey) throw { statusCode: 404, message: 'Survey not found' };

        const previousStatus = survey.survey_status;

        // ── 1. Absolute terminal state guard ──
        if (SURVEY_TERMINAL_STATES.includes(previousStatus)) {
            throw { statusCode: 400, message: 'Survey is finalized and cannot be modified.' };
        }

        // ── 2. Idempotency → 409 (not silent success) ──
        if (previousStatus === newStatus) {
            throw { statusCode: 409, message: `Survey is already in ${newStatus} state.` };
        }

        // ── 3. Transition map validation ──
        validateTransition(previousStatus, newStatus, SURVEY_TRANSITIONS);

        // ── 4. FINALIZED: ALLOW TM ONLY; must be SUBMITTED ──
        if (newStatus === 'FINALIZED') {
            const actor = await User.findByPk(userId, { transaction: txn });
            if (!actor || !['TM'].includes(actor.role)) {
                throw { statusCode: 403, message: 'Only Technical Managers (TM) have permission to finalize surveys.' };
            }
            if (previousStatus !== 'SUBMITTED') {
                throw { statusCode: 400, message: 'Only submitted surveys can be finalized.' };
            }

            // ── 4a. NC guard: no open Non-Conformities ──
            if (db.NonConformity) {
                const jc = await db.JobCertificate.findByPk(survey.job_certificate_id, { transaction: txn });
                if (jc) {
                    const openNCs = await db.NonConformity.count({
                        where: { job_id: jc.job_request_id, status: { [db.Sequelize.Op.notIn]: ['CLOSED', 'RESOLVED'] } },
                        transaction: txn
                    });
                    if (openNCs > 0) {
                        throw { statusCode: 400, message: `Cannot finalize survey: please resolve the ${openNCs} open Non-Conformity report${openNCs > 1 ? 's' : ''} first.` };
                    }
                }
            }
        }

        // ── 5. SUBMITTED guard ──
        if (newStatus === 'SUBMITTED') {
            if (!['PROOF_UPLOADED', 'CHECKLIST_SUBMITTED', 'REWORK_REQUIRED'].includes(previousStatus)) {
                throw { statusCode: 400, message: 'Please upload evidence proof before submitting the survey.' };
            }
            if (!survey.attendance_photo_url) {
                throw { statusCode: 400, message: 'Attendance photo is required before submitting the survey.' };
            }
            if (!survey.submit_latitude || !survey.submit_longitude) {
                throw { statusCode: 400, message: 'GPS coordinates must be recorded on-site before submission.' };
            }
        }

        // ── 6. REWORK_REQUIRED guard: job must not be past FINALIZED ──
        if (newStatus === 'REWORK_REQUIRED') {
            const jc = await db.JobCertificate.findByPk(survey.job_certificate_id, { transaction: txn });
            if (jc) {
                const job = await JobRequest.findByPk(jc.job_request_id, { transaction: txn });
                if (job && JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
                    throw { statusCode: 400, message: `Rework cannot be requested when job is ${job.job_status}.` };
                }
            }
        }

        // ── 7. Apply ──
        const updateData = { survey_status: newStatus };
        if (newStatus === 'STARTED') updateData.started_at = survey.started_at || new Date();
        if (newStatus === 'SUBMITTED') {
            updateData.submitted_at = new Date();
            updateData.submission_count = (survey.submission_count || 0) + 1;
            updateData.declared_by = userId;
            updateData.declared_at = new Date();
        }
        if (newStatus === 'FINALIZED') updateData.finalized_at = new Date();

        await survey.update(updateData, { transaction: txn });

        // ── 8. Audit history (in same transaction) ──
        await SurveyStatusHistory.create({
            survey_id: surveyId,
            previous_status: previousStatus,
            new_status: newStatus,
            changed_by: userId,
            reason,
            submission_iteration: updateData.submission_count || survey.submission_count
        }, { transaction: txn });

        // ── 9. Structured log ──
        const jcForLog = await db.JobCertificate.findByPk(survey.job_certificate_id, { transaction: txn });
        logger.info({
            entity: 'SURVEY', event: 'STATUS_CHANGE',
            surveyId, jobCertificateId: survey.job_certificate_id,
            jobId: jcForLog?.job_request_id,
            from: previousStatus, to: newStatus,
            triggeredBy: userId, reason: reason ?? undefined,
        });

        // ── 9.5 Sync JobCertificate status ──
        if (jcForLog) {
            if (newStatus === 'SUBMITTED' || newStatus === 'FINALIZED') {
                if (!['SURVEY_DONE', 'ISSUED'].includes(jcForLog.status)) {
                    await jcForLog.update({ status: 'SURVEY_DONE' }, { transaction: txn });
                }
            } else if (newStatus === 'REWORK_REQUIRED') {
                if (jcForLog.status !== 'REWORK_REQUESTED') {
                    await jcForLog.update({ status: 'REWORK_REQUESTED' }, { transaction: txn });
                }
            }
        }

        // ── 10. Automatic Job sync ──
        // Maritime rule:
        //   STARTED       → Job IN_PROGRESS     (on first survey start)
        //   SUBMITTED     → Job SURVEY_DONE     (when ALL surveys SUBMITTED or FINALIZED)
        //   REWORK_REQUIRED → Job REWORK_REQUESTED (when ALL surveys REWORK_REQUIRED, skip = individual cert)
        //   FINALIZED     → Job FINALIZED       (when ALL surveys FINALIZED)
        //
        // _skipJobSync=true is used for per-certificate rework so job stays in REVIEWED
        // while other certs can still be processed.
        // After all per-cert rework calls, we do an explicit all-certs check in survey.service.requestRework.
        const jobSyncMap = {
            STARTED:         'IN_PROGRESS',
            SUBMITTED:       'SURVEY_DONE',
            REWORK_REQUIRED: 'REWORK_REQUESTED',
            FINALIZED:       'FINALIZED',
        };
        const jobTarget = jobSyncMap[newStatus];
        if (jobTarget && jcForLog && !_skipJobSync) {
            const jobId = jcForLog.job_request_id;

            // Fetch all certs and their surveys for this job
            const allCerts   = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, transaction: txn });
            const allSurveys = await Survey.findAll({ where: { job_certificate_id: allCerts.map(c => c.id) }, transaction: txn });

            // Check if surveys have reached the target
            let statusReached = false;
            if (newStatus === 'STARTED') {
                // Maritime: job goes IN_PROGRESS the moment the FIRST survey starts
                statusReached = true;
            } else if (newStatus === 'SUBMITTED') {
                // Maritime: job goes SURVEY_DONE when ALL surveys are SUBMITTED or already FINALIZED
                // (FINALIZED certs are "done" and should not block the sync)
                statusReached = allSurveys.every(s =>
                    s.id === surveyId
                        ? true  // the one we just updated
                        : ['SUBMITTED', 'FINALIZED'].includes(s.survey_status)
                );
            } else {
                // FINALIZED, REWORK_REQUIRED: ALL surveys must reach the same state
                statusReached = allSurveys.every(s =>
                    s.id === surveyId ? true : s.survey_status === newStatus
                );
            }

            if (statusReached) {
                // Silently skip if job is already at or past this status (idempotent)
                const currentJob = await db.JobRequest.findByPk(jobId, { transaction: txn });
                const alreadyAdvanced = currentJob && JOB_TERMINAL_STATES.includes(currentJob.job_status);
                if (!alreadyAdvanced && currentJob?.job_status !== jobTarget) {
                    await updateJobStatus(jobId, jobTarget, userId,
                        `Auto-sync: All surveys → ${newStatus}`,
                        { transaction: txn, _internal: true });
                }
            }
        }

        if (!externalTxn) await txn.commit();
        return survey;
    } catch (error) {
        if (!externalTxn) await txn.rollback();
        throw error;
    }
};
