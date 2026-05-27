import express from 'express';
import { docUpload } from '../../utils/upload.util.js';
import * as documentController from './document.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const upload = docUpload;
const router = express.Router();
router.use(authenticate);

router.get('/get-upload-url', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'SURVEYOR'), documentController.getUploadUrl);

// POST /get-presigned-url — generate a signed S3 GET URL for viewing any stored file (body: { fileKey })
router.post('/get-presigned-url', authorizeRoles('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT'), documentController.getPresignedReadUrl);

router.post('/upload', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), upload.single('file'), documentController.uploadStandaloneFile);
router.post('/register', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'SURVEYOR'), documentController.registerStandaloneFile);

router.get('/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), documentController.getDocumentById);
router.get('/:entityType/:entityId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), documentController.getDocuments);
router.post('/:entityType/:entityId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'SURVEYOR'), upload.array('files'), documentController.uploadDocument);
router.post('/:entityType/:entityId/register', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'SURVEYOR'), documentController.uploadDocument);
router.delete('/:id', authorizeRoles('ADMIN', 'GM'), documentController.deleteDocument);

export default router;
