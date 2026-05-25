import express from 'express';
import * as checklistController from './checklist.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authenticate);

// View checklist + signed-checklist scan URLs for a job
router.get(
    '/jobs/:jobId',
    authorizeRoles('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'),
    checklistController.getChecklist
);

// Submit checklist answers + (optionally) attach signed-checklist scan keys
router.put(
    '/jobs/:jobId',
    authorizeRoles('SURVEYOR'),
    validate(schemas.submitChecklist),
    checklistController.submitChecklist
);

// Update ONLY signed-checklist scan keys (separate screen after answers)
router.put(
    '/jobs/:jobId/signed-checklist-files',
    authorizeRoles('SURVEYOR'),
    validate(schemas.updateSignedChecklistFiles),
    checklistController.updateSignedChecklistFiles
);

// Get pre-signed S3 URL to upload a single per-question evidence photo
router.get(
    '/jobs/:jobId/get-upload-url',
    authorizeRoles('SURVEYOR'),
    checklistController.getUploadUrl
);

// Get pre-signed S3 URL to upload the full signed-checklist document scan
router.get(
    '/jobs/:jobId/signed-checklist-upload-url',
    authorizeRoles('SURVEYOR'),
    checklistController.getSignedChecklistUploadUrl
);

// TM/TO Review: Approve/Reject a specific checklist question
router.put(
    '/jobs/:jobId/items/:itemId/review',
    authorizeRoles('TO'),
    validate(schemas.reviewItem),
    checklistController.reviewChecklistItem
);

// TM/TO Review: Approve/Reject a specific signed document scan (by index)
router.put(
    '/jobs/:jobId/signed-files/:fileIndex/review',
    authorizeRoles('TO'),
    validate(schemas.reviewItem), // Reuse reviewItem schema (status, reason)
    checklistController.reviewSignedDocument
);

export default router;
