import express from 'express';
import * as siteStaticController from './site_static.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();

// Public: list + get by slug (optional Bearer token lets ADMIN see drafts in list/detail)
router.get('/', optionalAuthenticate, siteStaticController.list);
router.get('/:slug', optionalAuthenticate, siteStaticController.getOne);

// Admin only
router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    siteStaticController.create
);
router.put(
    '/:slug',
    authenticate,
    authorizeRoles('ADMIN'),
    siteStaticController.update
);
router.delete(
    '/:slug',
    authenticate,
    authorizeRoles('ADMIN'),
    siteStaticController.remove
);

export default router;
