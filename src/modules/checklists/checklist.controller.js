import * as checklistService from './checklist.service.js';

// GET /checklists/jobs/:jobId?job_certificate_id=<uuid>
export const getChecklist = async (req, res, next) => {
    try {
        const list = await checklistService.getChecklist(
            req.params.jobId,
            req.query,   // includes job_certificate_id if provided
            req.user
        );
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

// PUT /checklists/jobs/:jobId
// Body: { items, job_certificate_id?, signed_checklist_files? }
export const submitChecklist = async (req, res, next) => {
    try {
        const list = await checklistService.submitChecklist(
            req.params.jobId,
            req.body.items,
            req.user,
            req.body.signed_checklist_files,
            req.body.job_certificate_id || req.query.job_certificate_id
        );
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

// PUT /checklists/jobs/:jobId/signed-checklist-files
export const updateSignedChecklistFiles = async (req, res, next) => {
    try {
        const list = await checklistService.updateSignedChecklistFiles(
            req.params.jobId,
            req.body.signed_checklist_files,
            req.user,
            req.body.job_certificate_id || req.query.job_certificate_id
        );
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

// GET /checklists/jobs/:jobId/get-upload-url?job_certificate_id=<uuid>
export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType, job_certificate_id } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required query parameters.' });
        }
        const result = await checklistService.getSignedUploadUrl(
            req.params.jobId, fileName, contentType, req.user.id, job_certificate_id
        );
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

// GET /checklists/jobs/:jobId/signed-checklist-upload-url?job_certificate_id=<uuid>
export const getSignedChecklistUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType, job_certificate_id } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required query parameters.' });
        }
        const result = await checklistService.getSignedChecklistUploadUrl(
            req.params.jobId, fileName, contentType, req.user.id, job_certificate_id
        );
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const reviewChecklistItem = async (req, res, next) => {
    try {
        const result = await checklistService.reviewChecklistItem(
            req.params.jobId, req.params.itemId, req.body, req.user
        );
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const reviewSignedDocument = async (req, res, next) => {
    try {
        const result = await checklistService.reviewSignedDocument(
            req.params.jobId, req.params.fileIndex, req.body, req.user
        );
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};
