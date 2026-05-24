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
const assertJobAccessible = async (jobId, userId, { checkSurveyor = true, allowedStatuses = null } = {}) => {
    const job = await JobRequest.findByPk(jobId, { useMaster: true });
    if (!job) throw { statusCode: 404, message: 'Job not found' };

    if (lifecycleService.JOB_TERMINAL_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `This job has already been closed and cannot be modified further.` };
    }

    if (allowedStatuses && !allowedStatuses.includes(job.job_status)) {
        throw { statusCode: 400, message: `This action can only be performed when the job is in ${allowedStatuses.join(', ')} state.` };
    }

    if (checkSurveyor && job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    return job;
};

/**
 * Returns the survey for a job, or throws if not found.
 */
const requireSurvey = async (jobId) => {
    const survey = await Survey.findOne({ where: { job_id: jobId }, useMaster: true });
    if (!survey) throw { statusCode: 404, message: 'Survey report not found. Please start the survey inspection first.' };
    return survey;
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
    const { job_id, latitude, longitude } = data;

    // Guard: job must be SURVEY_AUTHORIZED
    await assertJobAccessible(job_id, userId, {
        checkSurveyor: true,
        allowedStatuses: ['SURVEY_AUTHORIZED']
    });

    const txn = await db.sequelize.transaction();
    let surveyResult;
    try {
        const [survey, created] = await Survey.findOrCreate({
            where: { job_id },
            defaults: { surveyor_id: userId, survey_status: 'NOT_STARTED' },
            transaction: txn
        });

        // Guard: cannot re-start an already-started survey
        if (!created && survey.survey_status !== 'NOT_STARTED') {
            throw { statusCode: 400, message: `This survey has already been started or processed.` };
        }

        await lifecycleService.updateSurveyStatus(survey.id, 'STARTED', userId, 'Surveyor checked in', { transaction: txn });

        await survey.update({
            started_at: new Date(),
            start_latitude: latitude,
            start_longitude: longitude
        }, { transaction: txn });

        await GpsTracking.create({ surveyor_id: userId, job_id, latitude, longitude }, { transaction: txn });

        await txn.commit();
        surveyResult = { survey_id: survey.id, job_id };
    } catch (error) {
        if (!txn.finished) await txn.rollback();
        throw error;
    }

    // ── Post-commit notifications (non-transactional, fire-and-forget) ──
    logger.info({ entity: 'SURVEY', event: 'CHECKIN', jobId: job_id, surveyId: surveyResult.survey_id, triggeredBy: userId });
    try {
        const jobWithVessel = await JobRequest.findByPk(job_id, { include: ['Vessel'], useMaster: true });
        const actor = await User.findByPk(userId, { useMaster: true });
        notificationService.notifyRoles(['ADMIN', 'TM', 'TO'], 'SURVEY_STARTED', {
            jobId: job_id, vesselName: jobWithVessel?.Vessel?.vessel_name, surveyorName: actor?.name
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
    const job = await assertJobAccessible(jobId, userId, { checkSurveyor: true });

    const survey = await requireSurvey(jobId);
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
    const { job_id, submit_latitude, submit_longitude, survey_statement } = data;

    const job = await assertJobAccessible(job_id, userId, { checkSurveyor: true });

    // Guard: once payment is done, survey can no longer be submitted
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `Survey report cannot be submitted as the job is already being finalized or certified.` };
    }

    const survey = await requireSurvey(job_id);
    assertSurveyNotFinalized(survey);

    // Guard: submission requires PROOF_UPLOADED, CHECKLIST_SUBMITTED or REWORK_REQUIRED
    const allowedStatuses = ['PROOF_UPLOADED', 'CHECKLIST_SUBMITTED', 'REWORK_REQUIRED'];
    if (!allowedStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: `Please upload all required evidence proofs before submitting the survey report.` };
    }

    // Guard: checklist required
    const checklistCount = await ActivityPlanning.count({ where: { job_id }, useMaster: true });
    if (checklistCount === 0) {
        throw { statusCode: 400, message: 'Please complete the inspection checklist before submitting the final report.' };
    }

    // Guard: signed checklist document upload required
    if (!survey.signed_checklist_files || !Array.isArray(survey.signed_checklist_files) || survey.signed_checklist_files.length === 0) {
        throw { statusCode: 400, message: 'Please upload the filled and signed checklist document before submitting the survey report.' };
    }

    // Guard: Ensure no items are in REJECTED state
    const rejectedItems = await ActivityPlanning.count({ where: { job_id, status: 'REJECTED' }, useMaster: true });
    if (rejectedItems > 0) {
        throw { statusCode: 400, message: `Cannot submit report: ${rejectedItems} checklist items are still marked as REJECTED. Please correct them first.` };
    }

    // Guard: Ensure no signed documents are in REJECTED state
    const rejectedFiles = (survey.signed_checklist_files || []).filter(f => f.status === 'REJECTED');
    if (rejectedFiles.length > 0) {
        throw { statusCode: 400, message: `Cannot submit report: ${rejectedFiles.length} signed documents are still marked as REJECTED. Please re-upload them first.` };
    }

    // ── Compliance Enforcement: GPS & Photo ──
    if (!submit_latitude || !submit_longitude) {
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

    if (!photoUrl) {
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
        await lifecycleService.updateSurveyStatus(survey.id, 'SUBMITTED', userId, 'Survey report submitted', { transaction: txn });

        // 3. Reload to get updated timestamps and iteration
        await survey.reload({ transaction: txn });

        // 4. Generate Declaration Hash
        const checklistData = await ActivityPlanning.findAll({
            where: { job_id },
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

        // 5. Log final GPS
        await GpsTracking.create({ surveyor_id: userId, job_id, latitude: submit_latitude, longitude: submit_longitude }, { transaction: txn });

        await txn.commit();
        await survey.reload();
        logger.info({ entity: 'SURVEY', event: 'SUBMITTED', jobId: job_id, surveyId: survey.id, triggeredBy: userId });

        // Notify ADMIN/TM/TO
        const jobWithVessel = await JobRequest.findByPk(job_id, { include: ['Vessel'], useMaster: true });
        notificationService.notifyRoles(['ADMIN', 'TM', 'TO'], 'SURVEY_SUBMITTED', {
            jobId: job_id, vesselName: jobWithVessel.Vessel.vessel_name
        }).catch(() => { });

        return await fileAccessService.resolveEntity(survey, { id: userId });
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE — TM Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TM-only action.
 * Survey must be SUBMITTED.
 * No open Non-Conformities (checked inside lifecycle.service).
 */
export const finalizeSurvey = async (jobId, user) => {
    if (!['TM', 'GM', 'ADMIN'].includes(user.role)) {
        throw { statusCode: 403, message: 'Only Technical Managers (TM), General Managers (GM) or Admins have permission to finalize surveys.' };
    }
    const userId = user.id;
    await assertJobAccessible(jobId, userId, { checkSurveyor: false });

    const survey = await requireSurvey(jobId);

    if (survey.survey_status !== 'SUBMITTED') {
        throw { statusCode: 400, message: `Only submitted survey reports can be finalized.` };
    }

    // lifecycle service handles TM role check, NC check, and job sync
    await lifecycleService.updateSurveyStatus(survey.id, 'FINALIZED', userId, `Final approval granted by ${user.role}`);

    const job = await JobRequest.findByPk(jobId, { include: ['Vessel'], useMaster: true });
    if (job?.assigned_surveyor_id) {
        notificationService.sendNotification(job.assigned_surveyor_id, 'JOB_FINALIZED', {
            vesselName: job.Vessel?.vessel_name
        }).catch(() => { }); // non-critical
    }

    return { message: 'Survey finalized. Job is now FINALIZED.' };
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST REWORK — TM / GM Action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Allowed only when survey is SUBMITTED and job has not passed FINALIZED.
 */
export const requestRework = async (jobId, reason, userId) => {
    const job = await assertJobAccessible(jobId, userId, { checkSurveyor: false });

    // Guard: no rework once job is at or past FINALIZED
    if (lifecycleService.JOB_POST_FINALIZATION_STATES.includes(job.job_status)) {
        throw { statusCode: 400, message: `Rework cannot be requested when job is ${job.job_status}.` };
    }

    const survey = await requireSurvey(jobId);

    if (survey.survey_status !== 'SUBMITTED') {
        throw { statusCode: 400, message: `Rework can only be requested for submitted survey reports.` };
    }

    // Check if any granular rejections exist to provide a better reason
    const rejectedItems = await ActivityPlanning.count({ where: { job_id: jobId, status: 'REJECTED' }, useMaster: true });
    const rejectedFiles = (survey.signed_checklist_files || []).filter(f => f.status === 'REJECTED').length;
    
    let finalReason = reason;
    if (rejectedItems > 0 || rejectedFiles > 0) {
        finalReason = `Granular Rejection: ${rejectedItems} items and ${rejectedFiles} documents rejected. ${reason || ''}`.trim();
    }

    await lifecycleService.updateSurveyStatus(survey.id, 'REWORK_REQUIRED', userId, finalReason);

    // Notify Surveyor
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
    // 1. Fetch Comprehensive Data
    const job = await JobRequest.findByPk(survey.job_id, {
        include: [
            { 
                model: db.Vessel, 
                include: [{ model: db.FlagAdministration, as: 'FlagAdministration' }] 
            },
            { model: db.User, as: 'requester', attributes: ['name', 'email'] }
        ],
        useMaster: true
    });
    
    const surveyor = await User.findByPk(survey.surveyor_id, { attributes: ['name'], useMaster: true });
    const checklist = await ActivityPlanning.findAll({
        where: { job_id: survey.job_id },
        attributes: ['question_text', 'answer', 'remarks', 'file_url'],
        useMaster: true
    });

    // 2. Build HTML (QR removed as per user request for SOF)
    const isIssued = survey.survey_statement_status === 'ISSUED';
    
    // Resolve S3 keys into signed URLs for the PDF template
    const resolvedSurvey = await fileAccessService.resolveEntity(survey, user);
    const resolvedChecklist = await fileAccessService.resolveEntity(checklist, user);

    const html = buildSurveyReportHtml({
        job,
        vessel: job.Vessel,
        surveyor,
        survey: { 
            ...resolvedSurvey, 
            is_draft: !isIssued 
        },
        checklist: resolvedChecklist,
        client: job.requester
    });

    // 3. Convert to PDF
    const fullHtml = certificatePdfService.wrapHtmlForPdf(html);
    const pdfBuffer = await certificatePdfService.htmlToPdfBuffer(fullHtml);
    
    // 4. Upload to S3
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
    await assertJobAccessible(jobId, user.id, { checkSurveyor: user.role === 'SURVEYOR' });
    const survey = await requireSurvey(jobId);
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
    const survey = await requireSurvey(jobId);
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

    const gps = await GpsTracking.findAll({
        where: { job_id: id },
        attributes: ['id', 'job_id', 'surveyor_id', 'vessel_id', 'latitude', 'longitude', 'timestamp'],
        order: [['timestamp', 'ASC']]
    });
    const survey = await Survey.findOne({
        where: { job_id: id },
        include: [{
            model: db.SurveyStatusHistory,
            as: 'SurveyStatusHistories',
            attributes: ['id', 'survey_id', 'previous_status', 'new_status', 'changed_by', 'reason', 'submission_iteration', 'createdAt']
        }],
        order: [[{ model: db.SurveyStatusHistory, as: 'SurveyStatusHistories' }, 'created_at', 'ASC']]
    });
    return { job_id: id, gps_trace: gps, survey_details: await fileAccessService.resolveEntity(survey, { id: user?.id }) };
};

export const getSurveyReports = async (query, user) => {
    const { page = 1, limit = 10, ...filters } = query;
    const allowedFilters = {};
    if (filters.survey_status) allowedFilters.survey_status = filters.survey_status;
    if (filters.surveyor_id) allowedFilters.surveyor_id = filters.surveyor_id;
    if (filters.job_id) allowedFilters.job_id = filters.job_id;

    const { count, rows } = await Survey.findAndCountAll({
        where: allowedFilters,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        attributes: [
            'id', 'job_id', 'surveyor_id', 'survey_status', 'submission_count',
            'started_at', 'submitted_at', 'finalized_at', 'survey_statement_status', 'survey_statement_pdf_url'
        ],
        include: [
            { model: JobRequest, attributes: ['id', 'job_status'], include: [{ model: db.Vessel, attributes: ['vessel_name', 'imo_number'] }] },
            { model: db.User, attributes: ['name', 'email'] }
        ],
        order: [['submitted_at', 'DESC']],
        useReplica: true
    });
    const statusCountWhere = { ...allowedFilters };
    delete statusCountWhere.survey_status;
    const statusCounts = await Survey.findAll({
        where: statusCountWhere,
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
    let survey = await Survey.findOne({
        where: { job_id: jobId },
        include: [
            { 
                model: JobRequest, 
                attributes: ['id', 'job_status'],
                include: ['ActivityPlannings']
            },
            { model: db.User, attributes: ['name', 'email'] },
            { model: db.User, as: 'Declarer', attributes: ['name', 'email'] },
            { model: db.SurveyStatusHistory, attributes: ['previous_status', 'new_status', 'reason', 'createdAt'] }
        ],
        order: [[db.SurveyStatusHistory, 'createdAt', 'ASC']]
    });

    if (!survey) throw { statusCode: 404, message: 'Survey report not found for this job.' };

    return await fileAccessService.resolveEntity(survey, { id: user?.id });
};

// ─────────────────────────────────────────────────────────────────────────────
// STREAM GPS LOCATION — during active survey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records a live GPS ping from the surveyor during an active survey.
 * Can be called repeatedly throughout the inspection.
 */
export const streamLocation = async (jobId, { latitude, longitude }, userId) => {
    const job = await JobRequest.findByPk(jobId, { useMaster: true });
    if (!job) throw { statusCode: 404, message: 'Job not found' };
    if (job.assigned_surveyor_id !== userId) {
        throw { statusCode: 403, message: 'You are not the assigned surveyor for this job.' };
    }

    if (job.is_survey_required === false) {
        throw { statusCode: 400, message: "Survey not required for this job." };
    }

    const survey = await Survey.findOne({ where: { job_id: jobId }, useMaster: true });
    const activeStatuses = ['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED'];

    if (!survey || !activeStatuses.includes(survey.survey_status)) {
        throw { statusCode: 400, message: 'GPS tracking is only available during an active survey inspection.' };
    }

    const record = await GpsTracking.create({ surveyor_id: userId, job_id: jobId, latitude, longitude });
    return record;
};


// ─────────────────────────────────────────────────────────────────────────────
// HYBRID FLOW — Signed Checklist Uploads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a pre-signed URL for the surveyor to upload a signed checklist scan.
 */
export const getSignedChecklistUploadUrl = async (jobId, fileName, contentType, userId) => {
    await assertJobAccessible(jobId, userId, { checkSurveyor: true });
    
    const key = `surveys/signed-checklists/${jobId}/${Date.now()}_${fileName}`;
    const signedUrl = await s3Service.getUploadSignedUrl(key, contentType);

    return {
        uploadUrl: signedUrl,
        fileKey: key,
    };
};

/**
 * Saves the array of S3 keys for the signed checklist scans.
 */
export const updateSignedChecklist = async (jobId, fileKeys, userId) => {
    if (!Array.isArray(fileKeys)) {
        throw { statusCode: 400, message: 'fileKeys must be an array of S3 keys strings.' };
    }

    await assertJobAccessible(jobId, userId, { checkSurveyor: true });
    const survey = await requireSurvey(jobId);
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
export const syncOfflineData = async (jobId, { checklist = [], gps_points = [] }, userId) => {
    // Guard: job must be accessible and surveyor must match
    const job = await assertJobAccessible(jobId, userId, {
        checkSurveyor: true,
        allowedStatuses: ['SURVEY_AUTHORIZED', 'IN_PROGRESS', 'SURVEY_DONE']
    });

    const survey = await requireSurvey(jobId);
    assertSurveyNotFinalized(survey);

    const txn = await db.sequelize.transaction();
    try {
        // 1. Upsert checklist answers (ActivityPlanning rows)
        let checklistSynced = 0;
        if (checklist.length > 0) {
            for (const item of checklist) {
                await ActivityPlanning.upsert({
                    job_id: jobId,
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
