import express from 'express';
import * as NewsletterController from './newsletter.controller.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', validate(schemas.newsletterSubscribe), NewsletterController.subscribe);
router.post('/unsubscribe', validate(schemas.newsletterUnsubscribe), NewsletterController.unsubscribe);

// Admin routes
router.get('/subscribers', authenticate, authorizeRoles('ADMIN'), NewsletterController.listSubscribers);

export default router;
