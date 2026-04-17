import express from 'express';
import * as certController from './certificate.controller.js';
import caRoutes from './certificate_authority.routes.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();

// Mount Authority Management
router.use('/authorities', caRoutes);

// Public Verification - No Auth
router.get('/verify/:number', certController.verifyCertificate);

router.use(authenticate);

// Metadata – certificate types
router.get('/types', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificateTypes);
router.post('/types', authorizeRoles('ADMIN'), validate(schemas.createCertificateType), certController.createCertificateType);
router.get('/types/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificateTypeById);
router.put('/types/:id', authorizeRoles('ADMIN', 'TM'), validate(schemas.updateCertificateType), certController.updateCertificateType);

// Required documents per certificate type (ADMIN/TM)
router.get('/types/:id/required-documents', authorizeRoles('ADMIN', 'TM'), certController.getCertificateTypeRequiredDocuments);
router.post('/types/:id/required-documents', authorizeRoles('ADMIN', 'TM'), validate(schemas.addCertificateTypeRequiredDocument), certController.addCertificateTypeRequiredDocument);
router.put('/types/:id/required-documents/:docId', authorizeRoles('ADMIN', 'TM'), validate(schemas.updateCertificateTypeRequiredDocument), certController.updateCertificateTypeRequiredDocument);
router.delete('/types/:id/required-documents/:docId', authorizeRoles('ADMIN', 'TM'), certController.deleteCertificateTypeRequiredDocument);

// List all certificates
router.get('/', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificates);
// Get certificates expiring within a range
router.get('/expiring', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), certController.getExpiringCertificates);

// Get internal/external upload signed URL
router.get('/upload-url', authorizeRoles('ADMIN', 'GM', 'TM'), certController.getCertificateUploadUrl);

// NEW: Upload external cert for vessel
router.post('/vessel/:vesselId/external', authorizeRoles('ADMIN', 'GM', 'TM'), validate(schemas.uploadExternalCertificate), certController.uploadExternalCertificate);

// Get certificates for a specific vessel
router.get('/vessel/:vesselId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificatesByVessel);

// Get certificate for a specific job
router.get('/job/:jobId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificateByJobId);

// Generate a new certificate (Draft)
router.post('/', authorizeRoles('TM', 'GM'), certController.generateCertificate);

// Update draft details
router.put('/:id', authorizeRoles('TM', 'GM'), validate(schemas.updateCertificateDraft), certController.updateDraft);

// Issue certificate (Status -> ISSUED, Generate PDF)
router.post('/:id/issue', authorizeRoles('GM'), validate(schemas.updateCertificateDraft), certController.issueCertificate);

// Get specific certificate details
router.get('/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getCertificateById);

// Download certificate PDF
router.get('/:id/download', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.downloadCertificate);

// Suspend/Revoke/Restore
router.put('/:id/suspend', authorizeRoles('TM'), validate(schemas.certAction), certController.suspendCertificate);
router.put('/:id/revoke', authorizeRoles('TM'), validate(schemas.certAction), certController.revokeCertificate);
router.put('/:id/restore', authorizeRoles('TM'), validate(schemas.certAction), certController.restoreCertificate);

// Renew
router.put('/:id/renew', authorizeRoles('TM'), validate(schemas.renewCert), certController.renewCertificate);
router.post('/bulk-renew', authorizeRoles('TM'), certController.bulkRenew);

// Reissue (Version +1, Revoke Old)
router.post('/:id/reissue', authorizeRoles('TM'), certController.reissueCertificate);

// Preview & Signature
router.get('/:id/preview', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.previewCertificate);
router.post('/:id/sign', authorizeRoles('GM'), certController.signCertificate);
router.get('/:id/signature', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getSignature);

// History
router.get('/:id/history', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR'), certController.getHistory);

// Advanced Management
router.post('/:id/transfer', authorizeRoles('GM'), validate(schemas.certAction), certController.transferCertificate);
router.post('/:id/extend', authorizeRoles('GM'), validate(schemas.certAction), certController.extendCertificate);
router.put('/:id/downgrade', authorizeRoles('GM'), validate(schemas.certAction), certController.downgradeCertificate);

export default router;
