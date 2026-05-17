import express from 'express';
import * as siteStaticController from './site_static.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const router = express.Router();

// Dedicated Explicit Public Endpoints
router.get('/faq', siteStaticController.getFaq);
router.get('/news', siteStaticController.getNews);
router.get('/privacy', siteStaticController.getPrivacy);
router.get('/terms-compliance', siteStaticController.getTerms);
router.get('/terms-and-conditions', siteStaticController.getTerms); // Support alias
router.get('/about-us', siteStaticController.getAboutUs);

// Admin Write Endpoints
router.put('/admin/:key', authenticate, authorizeRoles('ADMIN'), siteStaticController.updateContent);
router.post('/admin', authenticate, authorizeRoles('ADMIN'), siteStaticController.createContent);

export default router;
