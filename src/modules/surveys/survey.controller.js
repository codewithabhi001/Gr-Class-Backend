import * as surveyService from './survey.service.js';
import db from '../../models/index.js';

// POST /surveys/start
export const startSurvey = async (req, res, next) => {
    try {
        const result = await surveyService.startSurvey(req.body, req.user.id);
        res.status(201).json({ success: true, message: 'Survey started successfully.', data: result });
    } catch (error) { next(error); }
};

// POST /surveys/job-certificates/:jobCertificateId/proof
export const uploadProof = async (req, res, next) => {
    try {
        if (!req.file && !req.body.fileKey) {
            return res.status(400).json({ success: false, message: 'No proof file or fileKey provided.' });
        }
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.uploadProof(jc.job_request_id, req.file, { ...req.body, job_certificate_id: jc.id }, req.user.id);
        res.json({ success: true, message: 'Proof uploaded successfully.', data: result });
    } catch (error) { next(error); }
};

// POST /surveys/job-certificates/:jobCertificateId/location
export const streamLocation = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.streamLocation(jc.job_request_id, { ...req.body, job_certificate_id: jc.id }, req.user.id);
        res.json({ success: true, message: 'Location recorded.', data: result });
    } catch (error) { next(error); }
};

// POST /surveys
export const submitSurveyReport = async (req, res, next) => {
    try {
        const report = await surveyService.submitSurveyReport(req.body, req.files, req.user.id);
        res.status(201).json({ success: true, message: 'Survey report submitted successfully.', data: report });
    } catch (error) { next(error); }
};

// PUT /surveys/job-certificates/:jobCertificateId/finalize
export const finalizeSurvey = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.finalizeSurvey(jc.job_request_id, req.user, {
            skip_validation: req.body?.skip_validation === true,
            job_certificate_id: jc.id
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
};

// PUT /surveys/job-certificates/:jobCertificateId/rework
export const requestRework = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.requestRework(jc.job_request_id, req.body.reason, req.user.id, jc.id);
        res.json({ success: true, message: result.message || 'Rework requested.', data: result });
    } catch (error) { next(error); }
};

// POST /surveys/job-certificates/:jobCertificateId/violation
export const flagViolation = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.flagViolation(jc.job_request_id, req.user.id);
        res.json({ success: true, message: 'Violation flagged and admins notified.', data: result });
    } catch (error) { next(error); }
};

// GET /surveys
export const getSurveyReports = async (req, res, next) => {
    try {
        const reports = await surveyService.getSurveyReports(req.query, req.user);
        res.json({ success: true, message: 'Survey reports fetched successfully.', data: reports });
    } catch (error) { next(error); }
};

// GET /surveys/job-certificates/:jobCertificateId
export const getSurveyDetails = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        let details = await surveyService.getSurveyDetails(jc.job_request_id, req.user);
        details = details.filter(d => d.job_certificate_id === req.params.jobCertificateId);
        res.json({ success: true, message: 'Survey details fetched successfully.', data: details });
    } catch (error) { next(error); }
};

// GET /surveys/job-certificates/:jobCertificateId/timeline
export const getTimeline = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.getTimeline(jc.job_request_id, req.user);
        res.json({ success: true, message: 'Survey timeline fetched successfully.', data: result });
    } catch (error) { next(error); }
};

// POST /surveys/job-certificates/:jobCertificateId/statement/draft
export const draftStatement = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.draftSurveyStatement(jc.job_request_id, { ...req.body, job_certificate_id: jc.id }, req.user);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};

// POST /surveys/job-certificates/:jobCertificateId/statement/issue
export const issueStatement = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.issueSurveyStatement(jc.job_request_id, req.file, { ...req.body, job_certificate_id: jc.id }, req.user);
        res.json({ success: true, data: result });
    } catch (e) { next(e); }
};

// POST /surveys/job-certificates/:jobCertificateId/sync
export const syncOfflineData = async (req, res, next) => {
    try {
        const jc = await db.JobCertificate.findByPk(req.params.jobCertificateId);
        if (!jc) throw { statusCode: 404, message: 'Job Certificate not found.' };

        const result = await surveyService.syncOfflineData(jc.job_request_id, { ...req.body, job_certificate_id: jc.id }, req.user.id);
        res.json({ success: true, ...result });
    } catch (error) { next(error); }
};

// NOTE: Signed-checklist scan upload + persistence has moved to the checklists
// module. See:
//   GET /api/v1/checklists/jobs/:jobId/signed-checklist-upload-url
//   PUT /api/v1/checklists/jobs/:jobId         (body.signed_checklist_files)

