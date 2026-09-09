import express from 'express';
import { docUpload } from '../../utils/upload.util.js';
import * as paymentController from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';

const router = express.Router();
const upload = docUpload;

router.use(authenticate);

// List payments
router.get('/', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'ACCOUNTANT'), paymentController.getPayments);

// Financial Summary
router.get('/summary', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'ACCOUNTANT'), paymentController.getFinancialSummary);

// Get specific payment details by job ID
router.get('/job/:jobId', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'ACCOUNTANT'), paymentController.getPaymentByJobId);

// Get specific payment details
router.get('/:id', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'ACCOUNTANT'), paymentController.getPaymentById);

// Create a new invoice
router.post('/invoice', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), paymentController.createInvoice);

// Mark an invoice as paid
router.put('/:id/pay', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), upload.single('receipt'), paymentController.markPaid);

// Associate standalone payment with a job request
router.put('/:id/associate-job', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), paymentController.associateJob);

// Process Refund
router.post('/:id/refund', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), paymentController.refund);

// Record Partial Payment
router.post('/:id/partial', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), paymentController.recordPartial);

// Financial Compliance / Ledger
router.get('/:id/ledger', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'ACCOUNTANT'), paymentController.getLedger);

// Download Invoice PDF
router.get('/:id/pdf', authorizeRoles('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'ACCOUNTANT'), paymentController.downloadInvoicePdf);

// Write off
router.post('/writeoff', authorizeRoles('ADMIN', 'ACCOUNTANT'), paymentController.writeOff);

// Update payment details
router.put('/:id', authorizeRoles('ADMIN', 'GM', 'ACCOUNTANT'), paymentController.updatePayment);

export default router;
