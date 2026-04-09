import express from 'express';
import multer from 'multer';
import * as surveyorController from './surveyor.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import rateLimit from 'express-rate-limit';

const applyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 8005,
    message: { success: false, message: 'Too many applications, please try again later.' }
});

import { docUpload } from '../../utils/upload.util.js';
const upload = docUpload;
const router = express.Router();

// Public application
router.get('/get-upload-url', applyLimiter, surveyorController.getUploadUrls);

router.post('/apply',
    applyLimiter,
    // Removed multer: now using S3 presigned URLs from frontend
    validate(schemas.applySurveyor),
    surveyorController.applySurveyor
);

router.use(authenticate);

// Admin/Management
router.get('/', authorizeRoles('ADMIN', 'GM', 'TM'), surveyorController.getSurveyors);
router.post('/', authorizeRoles('ADMIN', 'TM'), validate(schemas.createSurveyor), surveyorController.createSurveyor);
router.get('/applications', authorizeRoles('ADMIN', 'TM'), surveyorController.getApplications);
router.put('/applications/:id/review', authorizeRoles('TM', 'ADMIN'), validate(schemas.reviewSurveyor), surveyorController.reviewApplication);

// Status Management (Suspend/Activate)
router.put('/:id/status', authorizeRoles('ADMIN', 'TM'), validate(schemas.updateUserStatus), surveyorController.updateStatus);

// Profile
router.get('/:id/profile', authorizeRoles('ADMIN', 'TM', 'SURVEYOR','GM'), surveyorController.getProfile);
router.put('/:id/profile', authorizeRoles('ADMIN', 'TM'), validate(schemas.updateSurveyorProfile), surveyorController.updateProfile);

// Surveyor self-operations
router.post('/availability', authorizeRoles('SURVEYOR'), surveyorController.updateAvailability);
router.post('/location', authorizeRoles('SURVEYOR'), surveyorController.reportLocation);

// GPS History
router.get('/:id/location-history', authorizeRoles('ADMIN', 'TM','GM'), surveyorController.getGPSHistory);

export default router;
