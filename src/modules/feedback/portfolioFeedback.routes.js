import express from 'express';
import * as portfolioFeedbackController from './portfolioFeedback.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();

/**
 * Public Route - View visible feedback for portfolio
 * No authentication required
 */
router.get('/public', portfolioFeedbackController.getPublicFeedback);

/**
 * Portected Routes
 */
router.use(authenticate);

// Client submits or updates their feedback
router.post('/', authorizeRoles('CLIENT'), validate(schemas.upsertPortfolioFeedback), portfolioFeedbackController.submitFeedback);

// Admin gets all feedback
router.get('/', authorizeRoles('ADMIN', 'GM'), portfolioFeedbackController.getAllFeedback);

// Admin toggles visibility
router.patch('/:id/visibility', authorizeRoles('ADMIN'), validate(schemas.togglePortfolioFeedbackVisibility), portfolioFeedbackController.toggleVisibility);

export default router;
