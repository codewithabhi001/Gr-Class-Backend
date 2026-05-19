import express from 'express';
import * as activityController from './activity_request.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate, schemas } from '../../middlewares/validate.middleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM'), validate(schemas.createActivityRequest), activityController.createRequest);
router.get('/', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), activityController.getRequests);
router.post(
    '/:id/convert-to-job',
    authorizeRoles('ADMIN', 'GM', 'TM'),
    validate(schemas.convertActivityRequestToJob),
    activityController.convertToJob,
);
router.get('/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), activityController.getRequestById);
router.put(
    '/:id/status',
    authorizeRoles('ADMIN', 'GM', 'TM'),
    validate(schemas.updateActivityRequestStatus),
    activityController.updateStatus,
);

export default router;
