import * as checklistService from './checklist.service.js';

export const getChecklist = async (req, res, next) => {
    try {
        const list = await checklistService.getChecklist(req.params.jobId, req.query, req.user);
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

export const submitChecklist = async (req, res, next) => {
    try {
        const list = await checklistService.submitChecklist(
            req.params.jobId,
            req.body.items,
            req.user,
            req.body.signed_checklist_files
        );
        res.json({ success: true, data: list });
    } catch (error) { next(error); }
};

// GET /checklists/jobs/:jobId/get-upload-url
// Per checklist-item evidence photo (one photo per question).
export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required query parameters.' });
        }
        const result = await checklistService.getSignedUploadUrl(req.params.jobId, fileName, contentType, req.user.id);
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

// GET /checklists/jobs/:jobId/signed-checklist-upload-url
// Full signed-checklist document scan (the whole filled & signed sheet).
export const getSignedChecklistUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType } = req.query;
        if (!fileName || !contentType) {
            return res.status(400).json({ success: false, message: 'fileName and contentType are required query parameters.' });
        }
        const result = await checklistService.getSignedChecklistUploadUrl(
            req.params.jobId, fileName, contentType, req.user.id
        );
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};
