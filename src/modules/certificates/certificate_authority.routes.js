import express from 'express';
import * as caController from './certificate_authority.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authenticate);

// Admin Routes
router.get('/', authorizeRoles('ADMIN', 'GM', 'TM', 'TO'), caController.getAuthorities);
router.post('/', authorizeRoles('ADMIN'), validate(schemas.createCertificateAuthority), caController.createAuthority);
router.get('/upload-logo', authorizeRoles('ADMIN'), caController.getLogoUploadUrl);
router.get('/:id', authorizeRoles('ADMIN', 'GM', 'TM', 'TO'), caController.getAuthorityById);
router.put('/:id', authorizeRoles('ADMIN'), validate(schemas.updateCertificateAuthority), caController.updateAuthority);
router.delete('/:id', authorizeRoles('ADMIN'), caController.deleteAuthority);

export default router;
