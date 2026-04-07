import express from 'express';
import * as NewsletterController from './newsletter.controller.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', validate(schemas.newsletterSubscribe), NewsletterController.subscribe);
router.post('/unsubscribe', validate(schemas.newsletterUnsubscribe), NewsletterController.unsubscribe);
// RFC 8058 one-click (Gmail modal — POST + List-Unsubscribe-Post header on outbound mail)
router.get('/unsubscribe-one-click', NewsletterController.unsubscribeOneClickGet);
router.post('/unsubscribe-one-click', NewsletterController.unsubscribeOneClickPost);

// Admin routes
router.get('/subscribers', authenticate, authorizeRoles('ADMIN'), NewsletterController.listSubscribers);
router.post('/send', authenticate, authorizeRoles('ADMIN'), NewsletterController.broadcast);

export default router;
