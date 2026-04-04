import express from 'express';
import { videoUpload } from '../../utils/upload.util.js';
import * as websiteController from './website.controller.js';
import siteStaticRoutes from '../site_static/site_static.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const upload = videoUpload;
const router = express.Router();

// Public portfolio CMS (FAQ, terms, about, …) + admin CRUD
router.use('/static-content', siteStaticRoutes);

// Newsletter
router.use('/newsletter', newsletterRoutes);

// Public GET
router.get('/videos', websiteController.getVideos);

// Admin Only Management
router.post('/videos', authenticate, authorizeRoles('ADMIN'), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'thumbnail_url', maxCount: 1 } // Allow thumbnail_url as field name for file too to be safe with user's input
]), websiteController.uploadVideo);
router.put('/videos/:id', authenticate, authorizeRoles('ADMIN'), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'thumbnail_url', maxCount: 1 }
]), websiteController.updateVideo);
router.delete('/videos/:id', authenticate, authorizeRoles('ADMIN'), websiteController.deleteVideo);

export default router;
