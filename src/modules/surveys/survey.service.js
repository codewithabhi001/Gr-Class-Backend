import crypto from 'crypto';
import db from '../../models/index.js';
import * as s3Service from '../../services/s3.service.js';
import * as notificationService from '../../services/notification.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import { SURVEY_STATUSES } from '../../constants/statuses.js';
import { buildFullStatusCounts } from '../../utils/statusCount.util.js';
import { flatSurveyReportListRow } from '../../utils/listRowFlatten.util.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import logger from '../../utils/logger.js';

const { Survey, JobRequest, GpsTracking, ActivityPlanning, AuditLog, User } = db;

/**
 * Enforces immutability for finalized surveys.
 */
const assertSurveyNotFinalized = (survey) => {
    if (survey.survey_status === 'FINALIZED') {
        throw { statusCode: 400, message: 'Survey is finalized and cannot be modified.' };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ACCESS GUARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that the job exists, is not in a terminal state, and (optionally)
 * the caller is the assigned surveyor.
 */
const assertJobAccessible = async (jobId, userId, { checkSurveyor = true, allowedStatuses = null, jobCertificateId = null } = {}) => {
    const job = await JobRequest.findByPk(jobId, { useMaster: true });
    if (!job) throw { statusCode: 404, message: 'Job not found' };

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    if (allowedStatuses) {
        if (jobCertificateId) {
            const jc = await db.JobCertificate.findByPk(jobCertificateId, { useMaster: true });
            if (jc && !allowedStatuses.includes(jc.status)) {
                throw { statusCode: 400, message: `This action can only be performed when the certificate is in ${allowedStatuses.join(', ')} state.` };
            }
        } else if (!allowedStatuses.includes(job.job_status)) {
            throw { statusCode: 400, message: `This action can only be performed when the job is in ${allowedStatuses.join(', ')} state.` };
        }
    }

    if (checkSurveyor) {
        let isAssigned = false;
        if (jobCertificateId) {
            const jc = await db.JobCertificate.findByPk(jobCertificateId, { useMaster: true });
            if (jc && jc.assigned_surveyor_id === userId) {
                isAssigned = true;
            }
        }
        
        if (!isAssigned) {
            if (job.assigned_surveyor_id === userId) {
                isAssigned = true;
            } else {
                const count = await db.JobCertificate.count({
                    where: { job_request_id: jobId, assigned_surveyor_id: userId },
                    useMaster: true
                });
                if (count > 0) {
                    isAssigned = true;
                }
            }
        }

        if (!isAssigned) {
            throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
        }
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    return job;
};

/**
 * Returns the survey for a job certificate, or throws if not found.
 * Can look up by job_certificate_id directly.
 */
const requireSurvey = async (jobId, jobCertificateId = null) => {
    // jobId here refers to the job_request_id; find via JobCertificate
    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
    if (!jobCerts.length) throw { statusCode: 404, message: 'No certificates found for this job.' };

    if (jobCertificateId) {
        const belongsToJob = jobCerts.some(jc => jc.id === jobCertificateId);
        if (!belongsToJob) throw { statusCode: 400, message: 'Certificate does not belong to this job.' };
        const survey = await Survey.findOne({ where: { job_certificate_id: jobCertificateId }, useMaster: true });
        if (!survey) throw { statusCode: 404, message: 'Survey report not found for this certificate. Please start the survey inspection first.' };
        return survey;
    }

    if (jobCerts.length > 1) {
        throw { statusCode: 400, message: 'This job has multiple certificates. Please specify the job_certificate_id.' };
    }

    const survey = await Survey.findOne({
        where: { job_certificate_id: jobCerts[0].id },
        useMaster: true
    });
    if (!survey) throw { statusCode: 404, message: 'Survey report not found. Please start the survey inspection first.' };
    return survey;
};

/**
 * Returns ALL surveys for a job (one per certificate).
 */
const requireAllSurveys = async (jobId) => {
    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
    if (!jobCerts.length) return [];
    // BUG FIX: Must use Op.in for array of IDs
    return Survey.findAll({
        where: { job_certificate_id: { [db.Sequelize.Op.in]: jobCerts.map(jc => jc.id) } },
        useMaster: true
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Check-In / Start Survey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SURVEYOR action.
 * Allowed only when job is SURVEY_AUTHORIZED.
 * Survey must be NOT_STARTED.
 */
export const startSurvey = async (data, userId) => {
    const { job_certificate_id, job_id, latitude, longitude } = data;

    if (!job_certificate_id && !job_id) {
        throw { statusCode: 400, message: 'Either job_certificate_id or job_id is required.' };
    }

    // Resolve job_certificate_id
    let certId = job_certificate_id;
    let resolvedJobId = job_id;
    if (!certId && job_id) {
        // Fallback: pick the first certificate for this job
        const jc = await db.JobCertificate.findOne({ where: { job_request_id: job_id }, useMaster: true });
        if (!jc) throw { statusCode: 404, message: 'No certificate found for this job.' };
        certId = jc.id;
    } else if (certId && !resolvedJobId) {
        const jc = await db.JobCertificate.findByPk(certId, { useMaster: true });
        if (!jc) throw { statusCode: 404, message: 'Certificate not found.' };
        resolvedJobId = jc.job_request_id;
    }

    // Guard: job must be SURVEY_AUTHORIZED or REWORK_REQUESTED
    await assertJobAccessible(resolvedJobId, userId, {
        checkSurveyor: true,
        allowedStatuses: ['SURVEY_AUTHORIZED', 'REWORK_REQUESTED'],
        jobCertificateId: certId
    });

    const txn = await db.sequelize.transaction();
    let surveyResult;
    try {
        const [survey, created] = await Survey.findOrCreate({
            where: { job_certificate_id: certId },
            defaults: { surveyor_id: userId, survey_status: 'NOT_STARTED' },
            transaction: txn
        });

        // Guard: cannot re-start an already-started survey
        if (!created && !['NOT_STARTED', 'REWORK_REQUIRED'].includes(survey.survey_status)) {
            throw { statusCode: 400, message: `This survey has already been started or processed.` };
        }

        if (survey.survey_status !== 'STARTED') {
            await lifecycleService.updateSurveyStatus(survey.id, 'STARTED', userId, 'Surveyor checked in', { transaction: txn });
        }

        await survey.update({
            started_at: new Date(),
            start_latitude: latitude,
            start_longitude: longitude
        }, { transaction: txn });

        await GpsTracking.create({ surveyor_id: userId, job_id: resolvedJobId, job_certificate_id: certId, latitude, longitude }, { transaction: txn });

        await txn.commit();
        surveyResult = { survey_id: survey.id, job_certificate_id: certId, job_id: resolvedJobId };
    } catch (error) {
        if (!txn.finished) await txn.rollback();
        throw error;
    }

    // ── Post-commit notifications (non-transactional, fire-and-forget) ──
    logger.info({ entity: 'SURVEY', event: 'CHECKIN', jobId: resolvedJobId, certId, surveyId: surveyResult.survey_id, triggeredBy: userId });
    try {
        const jobWithVessel = await JobRequest.findByPk(resolvedJobId, { include: ['Vessel'], useMaster: true });
        const actor = await User.findByPk(userId, { useMaster: true });
        notificationService.notifyRoles(['ADMIN', 'TM', 'TO'], 'SURVEY_STARTED', {
            jobId: resolvedJobId, vesselName: jobWithVessel?.Vessel?.vessel_name, surveyorName: actor?.name
        }).catch(() => { });
    } catch (notifErr) {
        logger.error('Non-critical: notification error in startSurvey', notifErr);
    }

    return { message: 'Survey started.', ...surveyResult };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Submit Checklist
// Handled in checklist.service. Guards repeated here for defence-in-depth.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Upload Evidence Proof
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SURVEYOR action.
 * Survey must be CHECKLIST_SUBMITTED (or REWORK_REQUIRED to allow re-upload).
 */
export const uploadProof = async (jobId, file, data, userId) => {
    const certId = data.job_certificate_id;
    const job = await assertJobAccessible(jobId, userId, { checkSurveyor: true, jobCertificateId: certId });
    const survey = await requireSurvey(jobId, certId);
    assertSurveyNotFinalized(survey);

    // Guard: must have submitted checklist first OR already uploaded proof OR rework
    const allowedProofStatuses = ['CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];
    if (!allowedProofStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `Please complete the inspection checklist before uploading evidence proof.` };
    }

    // S3 upload (Moved to background if file provided)
    let url = data.fileKey; // Support pre-signed upload key
    if (file) {
        url = s3Service.generateKey(file.originalname, s3Service.UPLOAD_FOLDERS.SURVEYS_PROOF);
        // Start upload in background
        s3Service.uploadFile(file.buffer, file.originalname, file.mimetype, '', url)
            .catch(err => logger.error('Background S3 upload error (uploadProof):', err));
    }

    if (!url) throw { statusCode: 400, message: 'No file or fileKey provided' };

    const txn = await db.sequelize.transaction();
    try {
        await survey.update({ evidence_proof_url: url }, { transaction: txn });

        // Advance survey status ONLY if it's in a previous state (CHECKLIST_SUBMITTED or REWORK_REQUIRED)
        if (survey.survey_status !== 'PROOF_UPLOADED') {
            await lifecycleService.updateSurveyStatus(survey.id, 'PROOF_UPLOADED', userId, 'Evidence proof uploaded', { transaction: txn });
        }
        await txn.commit();

        // Notify ADMIN/TM/TO
        const jobWithVessel = await JobRequest.findByPk(jobId, { include: ['Vessel'], useMaster: true });
        notificationService.notifyRoles(['ADMIN', 'TM', 'TO'], 'SURVEY_PROOF_UPLOADED', {
            jobId, vesselName: jobWithVessel.Vessel.vessel_name
        }).catch(() => { });

        return await fileAccessService.resolveEntity({ url }, { id: userId });
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Submit Survey Report (Check-Out)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SURVEYOR action.
 * Survey must be PROOF_UPLOADED or REWORK_REQUIRED.
 * Job must not be PAYMENT_DONE or beyond.
 */
export const submitSurveyReport = async (data, files, userId) => {
    const { job_id, job_certificate_id, submit_latitude, submit_longitude, survey_statement, skip_validation } = data;

    // Resolve job details
    let resolvedJobId = job_id;
    let certId = job_certificate_id;
    if (!resolvedJobId && certId) {
        const jc = await db.JobCertificate.findByPk(certId, { useMaster: true });
        if (!jc) throw { statusCode: 404, message: 'Certificate not found.' };
        resolvedJobId = jc.job_request_id;
    }
    if (!certId && resolvedJobId) {
        const jc = await db.JobCertificate.findOne({ where: { job_request_id: resolvedJobId }, useMaster: true });
        if (jc) certId = jc.id;
    }

    const job = await assertJobAccessible(resolvedJobId, userId, { checkSurveyor: true, jobCertificateId: certId });

    // Guard: once payment is done, survey can no longer be submitted
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `Survey report cannot be submitted as the job is already being finalized or certified.` };
    }

    const survey = await requireSurvey(resolvedJobId, certId);
    assertSurveyNotFinalized(survey);

    // Guard: submission requires PROOF_UPLOADED, CHECKLIST_SUBMITTED or REWORK_REQUIRED
    // skip_validation allows ADMIN-authorized bypass for E2E testing
    const allowedStatuses = ['PROOF_UPLOADED', 'CHECKLIST_SUBMITTED', 'REWORK_REQUIRED', 'STARTED'];
    if (!skip_validation && !allowedStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `Please upload all required evidence proofs before submitting the survey report.` };
    }

    // Guard: checklist required (skippable for testing)
    if (!skip_validation) {
        // Check by job_certificate_id if available, fall back to job_id
        const checklistWhere = certId
            ? { job_certificate_id: certId }
            : { job_id: resolvedJobId };
        const checklistCount = await ActivityPlanning.count({ where: checklistWhere, useMaster: true });
        if (checklistCount === 0) {
            throw { statusCode: 400, message: 'Please complete the inspection checklist before submitting the final report.' };
        }

        // Guard: signed checklist document upload required
        if (!survey.signed_checklist_files || !Array.isArray(survey.signed_checklist_files) || survey.signed_checklist_files.length === 0) {
            throw { statusCode: 400, message: 'Please upload the filled and signed checklist document before submitting the survey report.' };
        }

        // Guard: Ensure no items are in REJECTED state
        const rejectedItems = await ActivityPlanning.count({ where: { ...checklistWhere, status: 'REJECTED' }, useMaster: true });
        if (rejectedItems > 0) {
            throw { statusCode: 400, message: `Cannot submit report: ${rejectedItems} checklist items are still marked as REJECTED. Please correct them first.` };
        }

        // Guard: Ensure no signed documents are in REJECTED state
        const rejectedFiles = (survey.signed_checklist_files || []).filter(f => f.status === 'REJECTED');
        if (rejectedFiles.length > 0) {
            throw { statusCode: 400, message: `Cannot submit report: ${rejectedFiles.length} signed documents are still marked as REJECTED. Please re-upload them first.` };
        }
    }

    // ── Compliance Enforcement: GPS & Photo ──
    if (!skip_validation && (!submit_latitude || !submit_longitude)) {
        throw { statusCode: 400, message: "GPS location must be recorded onsite before submission." };
    }

    const photoFile = files?.photo?.[0];
    const signatureFile = files?.signature?.[0];

    let photoUrl = survey.attendance_photo_url;
    if (data.photoKey) {
        photoUrl = data.photoKey;
    } else if (photoFile) {
        photoUrl = s3Service.generateKey(photoFile.originalname, s3Service.UPLOAD_FOLDERS.SURVEYS_PHOTO);
        s3Service.uploadFile(photoFile.buffer, photoFile.originalname, photoFile.mimetype, '', photoUrl)
            .catch(err => logger.error('Background S3 upload error (photo):', err));
    }

    if (!photoUrl && !skip_validation) {
        throw { statusCode: 400, message: "Attendance photo is mandatory before submitting survey." };
    }

    let signatureUrl = survey.signature_url;
    if (data.signatureKey) {
        signatureUrl = data.signatureKey;
    } else if (signatureFile) {
        signatureUrl = s3Service.generateKey(signatureFile.originalname, s3Service.UPLOAD_FOLDERS.SURVEYS_PROOF);
        s3Service.uploadFile(signatureFile.buffer, signatureFile.originalname, signatureFile.mimetype, '', signatureUrl)
            .catch(err => logger.error('Background S3 upload error (signature):', err));
    }

    const txn = await db.sequelize.transaction();
    try {
        // 1. Initial update of report fields
        await survey.update({
            submit_latitude,
            submit_longitude,
            attendance_photo_url: photoUrl,
            signature_url: signatureUrl,
            survey_statement
        }, { transaction: txn });

        // 2. Advance status (updates submission_count, declared_by, declared_at)
        if (skip_validation) {
            // Bypass lifecycle guard — force directly to SUBMITTED for E2E testing
            await survey.update({
                survey_status: 'SUBMITTED',
                submission_count: (survey.submission_count || 0) + 1,
                submitted_at: new Date(),
                declared_by: userId,
                declared_at: new Date()
            }, { transaction: txn });

            // Manually trigger job auto-sync: if ALL certificate surveys are now SUBMITTED, advance job
            const allCerts   = await db.JobCertificate.findAll({ where: { job_request_id: resolvedJobId }, transaction: txn });
            const allSurveys = await Survey.findAll({ where: { job_certificate_id: allCerts.map(c => c.id) }, transaction: txn });
            const allSubmitted = allSurveys.every(s => s.id === survey.id ? true : s.survey_status === 'SUBMITTED');
            if (allSubmitted) {
                const currentJob = await db.JobRequest.findByPk(resolvedJobId, { transaction: txn });
                if (currentJob && currentJob.job_status !== 'SURVEY_DONE') {
                    await lifecycleService.updateJobStatus(resolvedJobId, 'SURVEY_DONE', userId,
                        'Auto-sync: All surveys submitted (skip_validation)', { transaction: txn, _internal: true });
                }
            }
        } else {
            await lifecycleService.updateSurveyStatus(survey.id, 'SUBMITTED', userId, 'Survey report submitted', { transaction: txn });
        }

        // 3. Reload to get updated timestamps and iteration
        await survey.reload({ transaction: txn });

        // 4. Generate Declaration Hash
        const checklistWhere2 = certId
            ? { job_certificate_id: certId }
            : { job_id: resolvedJobId };
        const checklistData = await ActivityPlanning.findAll({
            where: checklistWhere2,
            attributes: ['question_code', 'question_text', 'answer', 'remarks', 'file_url'],
            transaction: txn
        });

        const hashPayload = JSON.stringify({
            survey_statement: survey.survey_statement,
            checklist_data: checklistData,
            evidence_proof_url: survey.evidence_proof_url,
            submit_latitude: survey.submit_latitude,
            submit_longitude: survey.submit_longitude,
            declared_at: survey.declared_at,
            submission_count: survey.submission_count
        });

        const declarationHash = crypto.createHash('sha256').update(hashPayload).digest('hex');
        await survey.update({ declaration_hash: declarationHash }, { transaction: txn });

        // 5. Log final GPS (only when coords provided)
        if (submit_latitude && submit_longitude) {
            await GpsTracking.create({ surveyor_id: userId, job_id: resolvedJobId, job_certificate_id: certId, latitude: submit_latitude, longitude: submit_longitude }, { transaction: txn });
        }

        await txn.commit();
        await survey.reload();
        logger.info({ entity: 'SURVEY', event: 'SUBMITTED', jobId: resolvedJobId, surveyId: survey.id, triggeredBy: userId });

        // Notify ADMIN/TM/TO
        const jobWithVessel = await JobRequest.findByPk(resolvedJobId, { include: ['Vessel'], useMaster: true });
        notificationService.notifyRoles(['ADMIN', 'TM', 'TO'], 'SURVEY_SUBMITTED', {
            jobId: resolvedJobId, vesselName: jobWithVessel.Vessel.vessel_name
        }).catch(() => { });

        return await fileAccessService.resolveEntity(survey, { id: userId });
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE — TM / ADMIN Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TM/ADMIN action.
 * Survey must be SUBMITTED (skippable with skip_validation for E2E testing).
 * No open Non-Conformities (checked inside lifecycle.service).
 */
export const finalizeSurvey = async (jobId, user, { skip_validation = false, job_certificate_id = null } = {}) => {
    if (!['TM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM) or Admins have permission to finalize surveys.' };
    }
    const userId = user.id;
    await assertJobAccessible(jobId, userId, { checkSurveyor: false });

    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
    if (!jobCerts.length) throw { statusCode: 404, message: 'No certificates found for this job.' };

    let surveys = [];
    if (job_certificate_id) {
        const belongsToJob = jobCerts.some(jc => jc.id === job_certificate_id);
        if (!belongsToJob) throw { statusCode: 400, message: 'Certificate does not belong to this job.' };
        const survey = await Survey.findOne({ where: { job_certificate_id: job_certificate_id }, useMaster: true });
        if (!survey) throw { statusCode: 404, message: 'Survey not found for this certificate.' };
        surveys = [survey];
    } else {
        if (jobCerts.length > 1) {
            throw { statusCode: 400, message: 'This job has multiple certificates. Please specify the job_certificate_id to finalize a specific survey.' };
        }
        const survey = await Survey.findOne({ where: { job_certificate_id: jobCerts[0].id }, useMaster: true });
        if (!survey) throw { statusCode: 404, message: 'No survey found for this job.' };
        surveys = [survey];
    }

    if (skip_validation) {
        // Bypass lifecycle guard — force directly to FINALIZED for E2E testing
        for (const survey of surveys) {
            await survey.update({ survey_status: 'FINALIZED', finalized_at: new Date() });
        }
    } else {
        // Filter out surveys that are not SUBMITTED, but ensure at least one is being finalized
        const submittedSurveys = surveys.filter(s => s.survey_status === 'SUBMITTED');
        if (submittedSurveys.length === 0) {
            throw { statusCode: 400, message: 'No submitted surveys found to finalize.' };
        }
        for (const survey of submittedSurveys) {
            await lifecycleService.updateSurveyStatus(survey.id, 'FINALIZED', userId, `Final approval granted by ${user.role}`);
        }
    }

    // Manual job sync when bypassing lifecycle
    if (skip_validation) {
        const currentJob = await JobRequest.findByPk(jobId, { useMaster: true });
        if (currentJob && !['FINALIZED', 'PAYMENT_DONE', 'CERTIFIED'].includes(currentJob.job_status)) {
            const allSurveys = await Survey.findAll({ where: { job_certificate_id: jobCerts.map(c => c.id) }, useMaster: true });
            const allFinalized = allSurveys.every(s => s.survey_status === 'FINALIZED');
            if (allFinalized) {
                await lifecycleService.updateJobStatus(jobId, 'FINALIZED', userId,
                    'Auto-sync: All surveys finalized (skip_validation)', { _internal: true });
            }
        }
    }

    const job = await JobRequest.findByPk(jobId, { include: ['Vessel'], useMaster: true });
    if (job?.assigned_surveyor_id) {
        notificationService.sendNotification(job.assigned_surveyor_id, 'JOB_FINALIZED', {
            vesselName: job.Vessel?.vessel_name
        }).catch(() => { });
    }

    const allSurveys = await Survey.findAll({ where: { job_certificate_id: jobCerts.map(c => c.id) }, useMaster: true });
    const allFinalized = allSurveys.every(s => s.survey_status === 'FINALIZED');

    return {
        message: allFinalized
            ? 'All surveys finalized. Job is now FINALIZED.'
            : 'Survey finalized successfully. Remaining surveys still pending.'
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// REQUEST REWORK — TM / GM Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Allowed only when survey is SUBMITTED and job has not passed FINALIZED.
 */
export const requestRework = async (jobId, reason, userId, jobCertificateId = null) => {
    const job = await assertJobAccessible(jobId, userId, { checkSurveyor: false });

    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `Rework cannot be requested when job is ${job.job_status}.` };
    }

    if (!jobCertificateId) {
        const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
        const hasEligibleCert = jobCerts.some((c) => ['SURVEY_DONE', 'REWORK_REQUESTED'].includes(c.status));
        if (!hasEligibleCert && !['REVIEWED', 'IN_PROGRESS', 'REWORK_REQUESTED'].includes(job.job_status)) {
            throw {
                statusCode: 400,
                message: 'Rework can only be requested after at least one certificate survey has been submitted.',
            };
        }
    }

    // ── Per-Certificate Rework ──────────────────────────────────────────────
    // When job_certificate_id is provided, only THAT certificate's survey goes
    // to REWORK_REQUIRED. The job itself stays in REVIEWED so the surveyor can
    // resubmit just that one certificate without affecting others.
    if (jobCertificateId) {
        const jc = await db.JobCertificate.findOne({
            where: { id: jobCertificateId, job_request_id: jobId },
            useMaster: true
        });
        if (!jc) {
            throw { statusCode: 404, message: 'Certificate not found for this job.' };
        }

        const survey = await Survey.findOne({ where: { job_certificate_id: jobCertificateId }, useMaster: true });
        if (!survey) {
            throw { statusCode: 404, message: 'Survey not found for this certificate.' };
        }
        if (!['SUBMITTED', 'REWORK_REQUIRED'].includes(survey.survey_status)) {
            throw { statusCode: 400, message: `Rework can only be requested for submitted surveys. Current status: ${survey.survey_status}` };
        }

        const rejectedItems = await ActivityPlanning.count({
            where: { job_certificate_id: jobCertificateId, status: 'REJECTED' },
            useMaster: true
        });
        const rejectedFiles = (survey.signed_checklist_files || []).filter(f => f.status === 'REJECTED').length;

        let finalReason = reason;
        if (rejectedItems > 0 || rejectedFiles > 0) {
            finalReason = `Granular Rejection: ${rejectedItems} items and ${rejectedFiles} documents rejected. ${reason || ''}`.trim();
        }

        // Mark JobCertificate with REWORK_REQUESTED status and rework remarks
        await jc.update({ status: 'REWORK_REQUESTED', rework_remarks: finalReason });

        // Set survey to REWORK_REQUIRED — with _skipJobSync so job stays REVIEWED
        // for now; we check below whether ALL certs are in rework.
        await lifecycleService.updateSurveyStatus(survey.id, 'REWORK_REQUIRED', userId, finalReason, { _skipJobSync: true });

        // ── Maritime rule: if ANY survey is now REWORK_REQUIRED, advance job ──
        // The job MUST go to REWORK_REQUESTED so that it becomes visible in the
        // surveyor's mobile app. They cannot see REVIEWED jobs.
        const allJobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
        const allSurveys  = await Survey.findAll({
            where: { job_certificate_id: { [db.Sequelize.Op.in]: allJobCerts.map(c => c.id) } },
            useMaster: true
        });
        const anyNeedRework = allSurveys.length > 0 &&
            allSurveys.some(s => ['REWORK_REQUIRED'].includes(s.survey_status));

        let jobStatusOutcome = 'REVIEWED';
        if (anyNeedRework) {
            // ANY cert needs rework → advance job to REWORK_REQUESTED
            // We pass _skipSurveySync: true so that the other certificates that are fine
            // don't get forced into REWORK_REQUIRED state.
            await lifecycleService.updateJobStatus(jobId, 'REWORK_REQUESTED', userId,
                `Rework required for certificate ${jc.certificate_type_id}. Job moved to REWORK_REQUESTED so surveyor can take action.`,
                { _skipSurveySync: true });
            jobStatusOutcome = 'REWORK_REQUESTED';
        }

        const jobWithVessel = await JobRequest.findByPk(jobId, { include: ['Vessel'], useMaster: true });
        if (job.assigned_surveyor_id) {
            const certType = await db.CertificateType.findByPk(jc.certificate_type_id, { useMaster: true });
            notificationService.sendNotification(job.assigned_surveyor_id, 'SURVEY_REWORK_REQUESTED', {
                jobId, vesselName: jobWithVessel.Vessel.vessel_name,
                reason: finalReason,
                certificate_name: certType?.name || 'Certificate'
            }).catch(() => { });
        }

        const msg = `Rework requested for certificate ${jc.certificate_type_id}. Job moved to REWORK_REQUESTED.`;
        return { message: msg, job_status: jobStatusOutcome };
    }

    // ── Legacy: Global Rework (no specific certificate) ────────────────────
    // Backward-compatible: finds ANY submitted survey and requests rework.
    const surveys = await requireAllSurveys(jobId);
    const submittedSurvey = surveys.find(s => s.survey_status === 'SUBMITTED');
    if (!submittedSurvey) {
        throw { statusCode: 400, message: `Rework can only be requested for submitted survey reports.` };
    }

    // BUG FIX: ActivityPlanning is scoped by job_certificate_id, not job_id
    const rejectedItems = await ActivityPlanning.count({
        where: { job_certificate_id: submittedSurvey.job_certificate_id, status: 'REJECTED' },
        useMaster: true
    });
    const rejectedFiles = (submittedSurvey.signed_checklist_files || []).filter(f => f.status === 'REJECTED').length;

    let finalReason = reason;
    if (rejectedItems > 0 || rejectedFiles > 0) {
        finalReason = `Granular Rejection: ${rejectedItems} items and ${rejectedFiles} documents rejected. ${reason || ''}`.trim();
    }

    await lifecycleService.updateSurveyStatus(submittedSurvey.id, 'REWORK_REQUIRED', userId, finalReason);

    const jobWithVessel = await JobRequest.findByPk(jobId, { include: ['Vessel'], useMaster: true });
    if (job.assigned_surveyor_id) {
        notificationService.sendNotification(job.assigned_surveyor_id, 'SURVEY_REWORK_REQUESTED', {
            jobId, vesselName: jobWithVessel.Vessel.vessel_name, reason
        }).catch(() => { });
    }

    return { message: 'Rework requested.' };
};

import { buildSurveyReportHtml } from './templates/survey-report.template.js';
import * as certificatePdfService from '../../services/certificate-pdf.service.js';

import QRCode from 'qrcode';

/**
 * Internal: Generates a Survey Report PDF and uploads it to S3.
 * Automatically handles watermarking and QR codes.
 */
const generateSurveyReportPdf = async (survey, user) => {
    // Fetch Comprehensive Data via JobCertificate
    const jc = await db.JobCertificate.findByPk(survey.job_certificate_id, {
        include: [
            { 
                model: db.JobRequest, as: 'JobRequest',
                include: [
                    { model: db.Vessel, include: [{ model: db.FlagAdministration, as: 'FlagAdministration' }] },
                    { model: db.User, as: 'requester', attributes: ['name', 'email'] }
                ]
            }
        ],
        useMaster: true
    });
    const job = jc?.JobRequest;
    const surveyor = await User.findByPk(survey.surveyor_id, { attributes: ['name'], useMaster: true });
    // BUG FIX: Checklist scoped by job_certificate_id, not job_id
    const checklist = await ActivityPlanning.findAll({
        where: { job_certificate_id: survey.job_certificate_id },
        attributes: ['question_text', 'answer', 'remarks', 'file_url'],
        useMaster: true
    });

    const isIssued = survey.survey_statement_status === 'ISSUED';
    const resolvedSurvey = await fileAccessService.resolveEntity(survey, user);
    const resolvedChecklist = await fileAccessService.resolveEntity(checklist, user);

    const html = buildSurveyReportHtml({
        job,
        vessel: job?.Vessel,
        surveyor,
        survey: { ...resolvedSurvey, is_draft: !isIssued },
        checklist: resolvedChecklist,
        client: job?.requester
    });

    const fullHtml = certificatePdfService.wrapHtmlForPdf(html);
    const pdfBuffer = await certificatePdfService.htmlToPdfBuffer(fullHtml);

    const prefix = isIssued ? 'survey-report' : 'survey-draft';
    const fileName = `${prefix}-${survey.id.substring(0, 8)}.pdf`;

    const url = await s3Service.uploadFile(
        pdfBuffer,
        fileName,
        'application/pdf',
        s3Service.UPLOAD_FOLDERS.SURVEYS_PROOF
    );
    return url;
};

export const draftSurveyStatement = async (jobId, data, user) => {
    const { job_certificate_id } = data || {};
    await assertJobAccessible(jobId, user.id, { checkSurveyor: user.role === 'SURVEYOR', jobCertificateId: job_certificate_id });
    // Get first survey for this job (or the one matching the certificate if provided)
    const survey = await requireSurvey(jobId, job_certificate_id);
    assertSurveyNotFinalized(survey);

    const isManagement = ['TM', 'ADMIN'].includes(user.role);
    const updateData = {};

    if (data.survey_statement) {
        updateData.survey_statement = data.survey_statement;
        updateData.survey_statement_status = 'DRAFTED';
    } else if (!isManagement) {
        throw { statusCode: 400, message: 'Survey statement text is required.' };
    }

    if (Object.keys(updateData).length > 0) {
        await survey.update(updateData);
    }

    // Role-based PDF generation trigger (NON-BLOCKING)
    if (isManagement) {
        if (!survey.survey_statement && !updateData.survey_statement) {
            throw { statusCode: 400, message: 'No survey statement text found. Surveyor must provide findings first.' };
        }
        
        // FIRE AND FORGET: Start generation in background
        generateSurveyReportPdf(survey, user)
            .then(draftUrl => survey.update({ survey_statement_pdf_url: draftUrl }))
            .catch(err => logger.error('Background Draft PDF generation failed:', err));
    }

    return { 
        message: isManagement ? 'Draft request received. Report is being generated in background.' : 'Survey statement saved.', 
        status: 'DRAFTED'
    };
};

export const issueSurveyStatement = async (jobId, file, data, user) => {
    if (!['TM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM) or Admins have permission to issue survey statements.' };
    }
    const userId = user.id;
    await assertJobAccessible(jobId, userId, { checkSurveyor: false });
    const { job_certificate_id } = data || {};
    const survey = await requireSurvey(jobId, job_certificate_id);
    assertSurveyNotFinalized(survey);

    let finalUrl = null;

    if (file) {
        // A: Custom file upload (Fast)
        finalUrl = s3Service.generateKey(file.originalname, s3Service.UPLOAD_FOLDERS.SURVEYS_PROOF);
        s3Service.uploadFile(file.buffer, file.originalname, file.mimetype, '', finalUrl)
            .catch(err => logger.error('Issue Statement File Upload Failed:', err));
    } else if (survey.survey_statement) {
        // B: Automated promotion (Background)
        const updatedSurveyStatus = { survey_statement_status: 'ISSUED' };
        await survey.update(updatedSurveyStatus);
        
        generateSurveyReportPdf(survey, user)
            .then(url => survey.update({ survey_statement_pdf_url: url }))
            .catch(err => logger.error('Background Official PDF generation failed:', err));
    } else {
        throw { statusCode: 400, message: 'No survey statement has been drafted. Please provide text before issuing.' };
    }

    // Update status immediately so UI changes
    if (finalUrl) {
        await survey.update({
            survey_statement_status: 'ISSUED',
            survey_statement_pdf_url: finalUrl
        });
    }

    return { 
        message: 'Issuance process started. The final report will be available shortly.', 
        status: 'ISSUED'
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// READ-ONLY
// ─────────────────────────────────────────────────────────────────────────────

export const getTimeline = async (id, user) => {
    const job = await JobRequest.findByPk(id);
    if (!job) throw { statusCode: 404, message: 'Job not found' };
    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }


    // Get all surveys for this job via certificates
    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: id } });
    const certIds = jobCerts.map(jc => jc.id);

    // GPS now tracked per certificate survey
    const gps = await GpsTracking.findAll({
        where: certIds.length > 0
            ? { [db.Sequelize.Op.or]: [{ job_id: id }, { job_certificate_id: certIds }] }
            : { job_id: id },
        attributes: ['id', 'job_id', 'job_certificate_id', 'surveyor_id', 'vessel_id', 'latitude', 'longitude', 'timestamp'],
        order: [['timestamp', 'ASC']]
    });

    const surveys = await Survey.findAll({
        where: { job_certificate_id: certIds },
        include: [{
            model: db.SurveyStatusHistory,
            as: 'SurveyStatusHistories',
            attributes: ['id', 'survey_id', 'previous_status', 'new_status', 'changed_by', 'reason', 'submission_iteration', 'createdAt']
        }],
        order: [[{ model: db.SurveyStatusHistory, as: 'SurveyStatusHistories' }, 'created_at', 'ASC']]
    });
    return { job_id: id, gps_trace: gps, survey_details: await fileAccessService.resolveEntity(surveys, { id: user?.id }) };
};

export const getSurveyReports = async (query, user) => {
    const { page = 1, limit = 10, search, ...filters } = query;
    const allowedFilters = {};
    if (filters.survey_status) allowedFilters.survey_status = filters.survey_status;
    if (filters.surveyor_id) allowedFilters.surveyor_id = filters.surveyor_id;

    if (user?.role === 'SURVEYOR') {
        allowedFilters.surveyor_id = user.id;
    }

    const jobRequestWhere = {};
    if (filters.job_id) {
        jobRequestWhere.id = filters.job_id;
    }
    
    if (search || filters.job_number) {
        const term = search || filters.job_number;
        jobRequestWhere.job_request_number = { [db.Sequelize.Op.like]: `%${term}%` };
    }

    const { count, rows } = await Survey.findAndCountAll({
        where: allowedFilters,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        attributes: [
            'id', 'job_certificate_id', 'surveyor_id', 'survey_status', 'submission_count',
            'started_at', 'submitted_at', 'finalized_at', 'survey_statement_status', 'survey_statement_pdf_url'
        ],
        include: [
            {
                model: db.JobCertificate,
                required: true,
                include: [{
                    model: JobRequest,
                    where: jobRequestWhere,
                    required: true,
                    attributes: ['id', 'job_status'],
                    include: [{ model: db.Vessel, attributes: ['vessel_name', 'imo_number'] }]
                }]
            },
            { model: db.User, attributes: ['name', 'email'] }
        ],
        order: [['submitted_at', 'DESC']],
        useReplica: true
    });
    const statusCountWhere = { ...allowedFilters };
    delete statusCountWhere.survey_status;
    const statusCounts = await Survey.findAll({
        where: statusCountWhere,
        include: filters.job_id ? [{
            model: db.JobCertificate,
            required: true,
            include: [{
                model: JobRequest,
                where: { id: filters.job_id },
                required: true
            }]
        }] : [],
        attributes: [
            ['survey_status', 'status'],
            [db.sequelize.fn('COUNT', db.sequelize.col('survey_status')), 'count']
        ],
        group: ['survey_status'],
        raw: true,
        useReplica: true
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        status_counts: buildFullStatusCounts(statusCounts, SURVEY_STATUSES),
        rows: (await fileAccessService.resolveEntity(rows, { id: user?.id })).map(flatSurveyReportListRow),
    };
};

export const getSurveyDetails = async (jobId, user) => {
    // Support fetching by job_certificate_id or job_id
    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId } });
    const surveys = await Survey.findAll({
        where: { job_certificate_id: jobCerts.map(jc => jc.id) },
        include: [
            { model: db.JobCertificate, include: [{ model: db.CertificateType, attributes: ['name'] }] },
            { model: db.User, attributes: ['name', 'email'] },
            { model: db.User, as: 'Declarer', attributes: ['name', 'email'] },
            { model: db.SurveyStatusHistory, attributes: ['previous_status', 'new_status', 'reason', 'createdAt'] }
        ],
        order: [[db.SurveyStatusHistory, 'createdAt', 'ASC']]
    });

    // Return empty array if no surveys yet (job may be newly ASSIGNED/AUTHORIZED)
    if (!surveys.length) return [];

    return await fileAccessService.resolveEntity(surveys, { id: user?.id });
};

// ─────────────────────────────────────────────────────────────────────────────
// STREAM GPS LOCATION — during active survey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records a live GPS ping from the surveyor during an active survey.
 * Can be called repeatedly throughout the inspection.
 */
export const streamLocation = async (jobId, { latitude, longitude, job_certificate_id }, userId) => {
    const job = await JobRequest.findByPk(jobId, { useMaster: true });
    if (!job) throw { statusCode: 404, message: 'Job not found' };

    let isAssigned = false;
    if (job_certificate_id) {
        const jc = await db.JobCertificate.findByPk(job_certificate_id, { useMaster: true });
        if (jc && jc.assigned_surveyor_id === userId) {
            isAssigned = true;
        }
    }
    if (!isAssigned) {
        if (job.assigned_surveyor_id === userId) {
            isAssigned = true;
        } else {
            const count = await db.JobCertificate.count({
                where: { job_request_id: jobId, assigned_surveyor_id: userId },
                useMaster: true
            });
            if (count > 0) {
                isAssigned = true;
            }
        }
    }
    if (!isAssigned) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    // Find any active survey for this job
    const jobCerts = await db.JobCertificate.findAll({ where: { job_request_id: jobId }, useMaster: true });
    const activeStatuses = ['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];
    const survey = await Survey.findOne({
        where: { 
            job_certificate_id: job_certificate_id || { [db.Sequelize.Op.in]: jobCerts.map(jc => jc.id) }, 
            survey_status: { [db.Sequelize.Op.in]: activeStatuses } 
        },
        useMaster: true
    });

    if (!survey) {
        throw { statusCode: 400, message: 'GPS tracking is only available during an active survey inspection.' };
    }

    const record = await GpsTracking.create({ surveyor_id: userId, job_id: jobId, job_certificate_id: survey.job_certificate_id, latitude, longitude });
    return record;
};


// ─────────────────────────────────────────────────────────────────────────────
// HYBRID FLOW — Signed Checklist Uploads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a pre-signed URL for the surveyor to upload a signed checklist scan.
 */
export const getSignedChecklistUploadUrl = async (jobId, fileName, contentType, userId, jobCertificateId = null) => {
    await assertJobAccessible(jobId, userId, { checkSurveyor: true, jobCertificateId });

    // BUG FIX: Scope key to job_certificate_id so concurrent cert uploads don't overwrite each other
    const certSegment = jobCertificateId ? jobCertificateId : jobId;
    const key = `surveys/signed-checklists/${certSegment}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};

/**
 * Saves the array of S3 keys for the signed checklist scans.
 */
export const updateSignedChecklist = async (jobId, fileKeys, userId, jobCertificateId = null) => {
    if (!Array.isArray(fileKeys)) {
        throw { statusCode: 400, message: 'fileKeys must be an array of S3 keys strings.' };
    }

    await assertJobAccessible(jobId, userId, { checkSurveyor: true, jobCertificateId });

    const survey = await requireSurvey(jobId, jobCertificateId);
    assertSurveyNotFinalized(survey);

    const txn = await db.sequelize.transaction();
    try {
        await survey.update({ signed_checklist_files: fileKeys }, { transaction: txn });

        // If survey was in STARTED, move it to CHECKLIST_SUBMITTED (logical equivalent for hybrid)
        if (survey.survey_status === 'STARTED') {
             await lifecycleService.updateSurveyStatus(survey.id, 'CHECKLIST_SUBMITTED', userId, 'Hybrid signed checklist uploaded', { transaction: txn });
        }

        await txn.commit();
        return await fileAccessService.resolveEntity(survey, { id: userId });
    } catch (error) {
        if (!txn.finished) await txn.rollback();
        throw error;
    }
};

export const flagViolation = async (jobId, userId) => {
    await assertJobAccessible(jobId, userId, { checkSurveyor: false });
    notificationService.notifyRoles(['ADMIN', 'TM', 'GM'], 'Survey Violation Flagged',
        `Suspicious behavior flagged for Job ${jobId}.`, 'CRITICAL');
    await AuditLog.create({
        user_id: userId, action: 'FLAG_VIOLATION',
        entity_name: 'JobRequest', entity_id: jobId,
        new_values: { violation_flagged: true }
    });
    return { message: 'Violation flagged and admins notified.' };
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFLINE SYNC — Batch replay field-captured data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SURVEYOR action.
 * Accepts a batched payload captured offline (checklist answers, GPS points).
 * Re-plays all items inside a single transaction for atomicity.
 *
 * Payload shape:
 * {
 *   checklist: [{ question_code, question_text, answer, remarks }],
 *   gps_points: [{ latitude, longitude, captured_at }]
 * }
 */
export const syncOfflineData = async (jobId, { checklist = [], gps_points = [], job_certificate_id = null }, userId) => {
    // Guard: job must be accessible and surveyor must match
    const job = await assertJobAccessible(jobId, userId, {
        checkSurveyor: true,
        allowedStatuses: ['SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE'],
        jobCertificateId: job_certificate_id
    });

    const survey = await requireSurvey(jobId, job_certificate_id);
    assertSurveyNotFinalized(survey);

    const txn = await db.sequelize.transaction();
    try {
        // 1. Upsert checklist answers (ActivityPlanning rows)
        let checklistSynced = 0;
        if (checklist.length > 0) {
            for (const item of checklist) {
                // BUG FIX: ActivityPlanning must be scoped by job_certificate_id (not job_id)
                await ActivityPlanning.upsert({
                    job_id: jobId,
                    job_certificate_id: survey.job_certificate_id,
                    question_code: item.question_code,
                    question_text: item.question_text,
                    answer: item.answer,
                    remarks: item.remarks || null
                }, { transaction: txn });
            }
            checklistSynced = checklist.length;
        }

        // 2. Bulk create GPS points (historical replay)
        let gpsSynced = 0;
        if (gps_points.length > 0) {
            const gpsRows = gps_points.map(p => ({
                surveyor_id: userId,
                job_id: jobId,
                job_certificate_id: survey.job_certificate_id,
                latitude: p.latitude,
                longitude: p.longitude,
                timestamp: p.captured_at ? new Date(p.captured_at) : new Date()
            }));
            await GpsTracking.bulkCreate(gpsRows, { transaction: txn });
            gpsSynced = gps_points.length;
        }

        await txn.commit();

        logger.info({
            entity: 'SURVEY',
            event: 'OFFLINE_SYNC',
            jobId,
            surveyId: survey.id,
            checklistSynced,
            gpsSynced,
            triggeredBy: userId
        });

        return {
            message: 'Offline data synced successfully.',
            synced: {
                checklist_items: checklistSynced,
                gps_points: gpsSynced
            }
        };
    } catch (error) {
        if (!txn.finished) await txn.rollback();
        throw error;
    }
};
