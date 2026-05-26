import express from 'express';
import { docUpload } from '../../utils/upload.util.js';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const router = express.Router();
const upload = docUpload;

router.use(authenticate);

// List payments
router.get('/', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), paymentController.getPayments);

// Financial Summary
router.get('/summary', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), paymentController.getFinancialSummary);

// Get specific payment details by job ID
router.get('/job/:jobId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), paymentController.getPaymentByJobId);

// Get specific payment details
router.get('/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), paymentController.getPaymentById);

// Create a new invoice
router.post('/invoice', authorizeRoles('ADMIN', 'GM', 'TM', 'TO'), paymentController.createInvoice);

// Mark an invoice as paid
router.put('/:id/pay', authorizeRoles('ADMIN', 'GM', 'TM', 'TO'), upload.single('receipt'), paymentController.markPaid);

// Process Refund
router.post('/:id/refund', authorizeRoles('ADMIN', 'GM'), paymentController.refund);

// Record Partial Payment
router.post('/:id/partial', authorizeRoles('ADMIN', 'GM', 'TM', 'TO'), paymentController.recordPartial);

// Financial Compliance / Ledger
router.get('/:id/ledger', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO'), paymentController.getLedger);

// Write off
router.post('/writeoff', authorizeRoles('ADMIN'), paymentController.writeOff);

export default router;
