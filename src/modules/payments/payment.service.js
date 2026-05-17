import db from '../../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as s3Service from '../../services/s3.service.js';
import * as lifecycleService from '../../services/lifecycle.service.js';
import * as fileAccessService from '../../services/fileAccess.service.js';
import logger from '../../utils/logger.js';

const Payment = db.Payment;
const JobRequest = db.JobRequest;
const FinancialLedger = db.FinancialLedger;
const Vessel = db.Vessel;
const AuditLog = db.AuditLog;

// Ledger types that count towards "amount collected"
const COLLECTION_TYPES = ['ADVANCE', 'PARTIAL_PAYMENT', 'PAYMENT'];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate total collected and refunded from ledger entries for a payment.
 */
const calculateLedgerTotals = (ledgers) => {
    const collected = ledgers
        .filter(l => COLLECTION_TYPES.includes(l.transaction_type))
        .reduce((sum, l) => sum + parseFloat(l.amount), 0);

    const refunded = ledgers
        .filter(l => l.transaction_type === 'REFUND')
        .reduce((sum, l) => sum + Math.abs(parseFloat(l.amount)), 0);

    return { collected, refunded };
};

/**
 * Enrich a plain payment object with ledger-derived financial data.
 */
const enrichPaymentWithLedger = (plain, ledgers) => {
    const { collected, refunded } = calculateLedgerTotals(ledgers);

    plain.amount_collected = collected.toFixed(2);
    plain.refunded_amount = refunded > 0 ? refunded.toFixed(2) : "0.00";
    plain.amount_paid = collected.toFixed(2);
    plain.net_amount = (parseFloat(plain.amount) - refunded).toFixed(2);
    plain.remaining = Math.max(0, parseFloat(plain.amount) - collected + refunded).toFixed(2);

    if (!plain.receipt_url && ledgers && ledgers.length > 0) {
        const latestWithReceipt = [...ledgers].reverse().find(l => {
            const rUrl = (typeof l.get === 'function') ? l.get('receipt_url') : l.receipt_url;
            return !!rUrl;
        });
        if (latestWithReceipt) {
            plain.receipt_url = (typeof latestWithReceipt.get === 'function') ? latestWithReceipt.get('receipt_url') : latestWithReceipt.receipt_url;
        }
    }

    return plain;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE INVOICE
// ─────────────────────────────────────────────────────────────────────────────

export const createInvoice = async (data, userId = null) => {
    const { job_id, amount, currency } = data;

    // Invoice can be created at any active job stage — only block terminal states
    const job = await JobRequest.findByPk(job_id);
    if (!job) throw { statusCode: 404, message: 'Job not found' };
    if (job.job_status === 'REJECTED') {
        throw { statusCode: 400, message: `Cannot create invoice: Job is in a rejected state (${job.job_status}).` };
    }

    // Prevent double-invoice for the same job
    const existing = await Payment.findOne({ where: { job_id, payment_status: ['UNPAID', 'PARTIALLY_PAID', 'PAID'] } });
    if (existing) {
        throw { statusCode: 409, message: 'An invoice already exists for this job.' };
    }

    const payment = await Payment.create({
        job_id,
        invoice_number: `INV-${uuidv4().substring(0, 8).toUpperCase()}`,
        amount,
        currency: currency || 'USD',
        payment_status: 'UNPAID'
    });

    await AuditLog.create({
        user_id: userId, action: 'CREATE_INVOICE',
        entity_name: 'Payment', entity_id: payment.id,
        old_values: null,
        new_values: { job_id, amount, currency: payment.currency, payment_status: 'UNPAID' }
    });

    logger.info({ entity: 'PAYMENT', event: 'INVOICE_CREATED', jobId: job_id, paymentId: payment.id, jobStatus: job.job_status, triggeredBy: userId });

    return payment;
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK PAID (Admin override — marks full payment at once)
// ─────────────────────────────────────────────────────────────────────────────

export const markPaid = async (paymentId, userId, receiptFile = null, data = {}) => {
    const remarks = data.remarks || '';
    const txn = await db.sequelize.transaction();
    try {
        // Lock payment row
        const payment = await Payment.findByPk(paymentId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!payment) throw { statusCode: 404, message: 'Payment record not found' };

        // ── Guard 1: Idempotency — cannot mark paid twice ──
        if (payment.payment_status === 'PAID') {
            throw { statusCode: 409, message: 'Payment has already been marked as paid.' };
        }

        // ── Guard 2: Only block terminal job states ──
        const job = await JobRequest.findByPk(payment.job_id, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!job) throw { statusCode: 404, message: 'Job not found for this payment' };

        if (job.job_status === 'REJECTED') {
            throw { statusCode: 400, message: `Cannot process payment: Job is in a rejected state (${job.job_status}).` };
        }

        // ── Upload receipt (optional) ──
        const oldPaymentStatus = payment.payment_status;
        let receiptUrl = data.receiptKey || payment.receipt_url || null;
        if (receiptFile) {
            receiptUrl = await s3Service.uploadFile(
                receiptFile.buffer, receiptFile.originalname, receiptFile.mimetype,
                `${s3Service.UPLOAD_FOLDERS.DOCUMENTS}/payments`
            );
        }

        // ── Calculate remaining after previous partial/advance collections ──
        const existingLedgers = await FinancialLedger.findAll({
            where: { invoice_id: paymentId },
            transaction: txn
        });
        const { collected } = calculateLedgerTotals(existingLedgers);
        const remainingAmount = Math.max(0, parseFloat(payment.amount) - collected);

        // ── Log full settlement in ledger ──
        if (remainingAmount > 0) {
            await FinancialLedger.create({
                invoice_id: paymentId, job_id: payment.job_id,
                transaction_type: 'PAYMENT', amount: remainingAmount,
                performed_by: userId, remarks: remarks || 'Full payment / settlement',
                balance_after: 0,
                receipt_url: receiptUrl
            }, { transaction: txn });
        }

        // ── Update payment ──
        await payment.update({
            payment_status: 'PAID',
            payment_date: new Date(),
            verified_by_user_id: userId,
            receipt_url: receiptUrl
        }, { transaction: txn });

        await AuditLog.create({
            user_id: userId, action: 'MARK_PAYMENT_PAID',
            entity_name: 'Payment', entity_id: payment.id,
            old_values: { payment_status: oldPaymentStatus, receipt_url: payment.receipt_url || null },
            new_values: { payment_status: 'PAID', receipt_url: receiptUrl, verified_by_user_id: userId }
        }, { transaction: txn });

        logger.info({ entity: 'PAYMENT', event: 'MARKED_PAID', jobId: payment.job_id, paymentId, triggeredBy: userId });

        await txn.commit();
        return payment;
    } catch (error) {
        await txn.rollback();
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export const getPayments = async (query, scopeFilters = {}, user = null) => {
    const { page = 1, limit = 10, ...filters } = query;
    const allowedFilters = {};
    const ALLOWED_KEYS = ['payment_status', 'job_id', 'invoice_number'];
    ALLOWED_KEYS.forEach(key => { if (filters[key]) allowedFilters[key] = filters[key]; });

    const result = await Payment.findAndCountAll({
        where: { ...allowedFilters, ...scopeFilters },
        attributes: [
            'id',
            'job_id',
            'invoice_number',
            'amount',
            'currency',
            'payment_status',
            'payment_date',
            'receipt_url',
            'verified_by_user_id',
            'created_at',
            'updated_at'
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        include: [{
            model: JobRequest,
            attributes: ['id', 'job_status', 'vessel_id'],
            include: [{ model: Vessel, attributes: ['vessel_name'] }]
        }],
        order: [['created_at', 'DESC']]
    });

    const paymentIds = result.rows.map(r => r.id);
    const ledgers = paymentIds.length > 0 ? await FinancialLedger.findAll({ where: { invoice_id: paymentIds } }) : [];

    const enrichedRows = result.rows.map(row => {
        const plain = row.get({ plain: true });
        const pLedgers = ledgers.filter(l => l.invoice_id === plain.id);
        plain.ledgers = pLedgers;
        return enrichPaymentWithLedger(plain, pLedgers);
    });

    const resolvedRows = await fileAccessService.resolveEntity(enrichedRows, user);
    return { count: result.count, rows: resolvedRows };
};

export const getPaymentById = async (id, scopeFilters = {}, user = null) => {
    const payment = await Payment.findOne({
        where: { id, ...scopeFilters },
        include: [{ model: JobRequest, include: [{ model: Vessel, attributes: ['vessel_name'] }] }]
    });
    if (!payment) throw { statusCode: 404, message: 'Payment record not found' };

    const plain = payment.get({ plain: true });
    const ledgers = await FinancialLedger.findAll({ where: { invoice_id: id }, order: [['createdAt', 'ASC']] });
    plain.ledgers = ledgers;

    const enriched = enrichPaymentWithLedger(plain, ledgers);
    return await fileAccessService.resolveEntity(enriched, user);
};


export const getFinancialSummary = async (scopeFilters = {}) => {
    const payments = await Payment.findAll({ where: scopeFilters });
    const paymentIds = payments.map(p => p.id);

    // Use ledger as source of truth for actual collections
    const ledgers = paymentIds.length > 0 ? await FinancialLedger.findAll({ where: { invoice_id: paymentIds } }) : [];

    const totalInvoiced = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    const totalCollected = ledgers
        .filter(l => COLLECTION_TYPES.includes(l.transaction_type))
        .reduce((s, l) => s + parseFloat(l.amount), 0);
    const totalRefunded = ledgers
        .filter(l => l.transaction_type === 'REFUND')
        .reduce((s, l) => s + Math.abs(parseFloat(l.amount)), 0);

    return {
        total_invoiced: totalInvoiced,
        total_collected: totalCollected,
        total_refunded: totalRefunded,
        total_paid: totalCollected - totalRefunded,
        pending_balance: totalInvoiced - totalCollected + totalRefunded,
        currency: 'USD'
    };
};

export const getLedger = async (paymentId) =>
    await FinancialLedger.findAll({ where: { invoice_id: paymentId }, order: [['createdAt', 'ASC']] });

// ─────────────────────────────────────────────────────────────────────────────
// COLLECT PAYMENT (Advance / Partial — each becomes a ledger entry)
// ─────────────────────────────────────────────────────────────────────────────

export const recordPartialPayment = async (paymentId, amount, userId, data = {}) => {
    const txn = await db.sequelize.transaction();
    try {
        const payment = await Payment.findByPk(paymentId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!payment) throw { statusCode: 404, message: 'Payment not found' };

        if (payment.payment_status === 'PAID') {
            throw { statusCode: 409, message: 'Invoice is already fully paid.' };
        }

        const payingNow = parseFloat(amount);
        if (payingNow <= 0) throw { statusCode: 400, message: 'Payment amount must be greater than 0.' };

        // Determine transaction type: ADVANCE or PARTIAL_PAYMENT
        const transactionType = (data.type === 'ADVANCE') ? 'ADVANCE' : 'PARTIAL_PAYMENT';
        const remarks = data.remarks || (transactionType === 'ADVANCE' ? 'Advance payment collected' : 'Partial payment recorded');

        // Calculate total collected so far
        const existingLedgers = await FinancialLedger.findAll({
            where: { invoice_id: paymentId },
            transaction: txn
        });
        const { collected: previouslyCollected } = calculateLedgerTotals(existingLedgers);

        // Create ledger entry
        const totalAfterThis = previouslyCollected + payingNow;
        const remainingAfterThis = Math.max(0, parseFloat(payment.amount) - totalAfterThis);

        await FinancialLedger.create({
            invoice_id: paymentId, job_id: payment.job_id,
            transaction_type: transactionType, amount: payingNow,
            performed_by: userId, remarks,
            receipt_url: data.receiptKey || null,
            balance_after: remainingAfterThis
        }, { transaction: txn });

        // Update payment status based on total collected
        const updatedFields = {
            receipt_url: data.receiptKey || payment.receipt_url || null
        };
        if (remainingAfterThis <= 0 && payment.payment_status !== 'PAID') {
            updatedFields.payment_status = 'PAID';
            updatedFields.payment_date = new Date();
            updatedFields.verified_by_user_id = userId;
        } else if (totalAfterThis > 0 && payment.payment_status === 'UNPAID') {
            updatedFields.payment_status = 'PARTIALLY_PAID';
        }
        await payment.update(updatedFields, { transaction: txn });

        logger.info({
            entity: 'PAYMENT', event: transactionType,
            jobId: payment.job_id, paymentId,
            amount: payingNow, totalCollected: totalAfterThis,
            remaining: remainingAfterThis,
            triggeredBy: userId
        });

        await txn.commit();
        return { id: payment.id, amount_paid: totalAfterThis.toFixed(2), remaining: remainingAfterThis.toFixed(2), payment_status: payment.payment_status };
    } catch (e) {
        await txn.rollback();
        throw e;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEDGER OPS (non-state-changing)
// ─────────────────────────────────────────────────────────────────────────────

export const writeOffPayment = async (paymentId, reason, userId) => {
    const txn = await db.sequelize.transaction();
    try {
        const payment = await Payment.findByPk(paymentId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!payment) throw { statusCode: 404, message: 'Payment not found' };
        await payment.update({ payment_status: 'ON_HOLD' }, { transaction: txn });
        await FinancialLedger.create({
            invoice_id: paymentId, job_id: payment.job_id,
            transaction_type: 'WRITEOFF', amount: payment.amount,
            performed_by: userId, remarks: reason, balance_after: 0
        }, { transaction: txn });
        await txn.commit();
        return payment;
    } catch (e) {
        await txn.rollback();
        throw e;
    }
};

export const processRefund = async (paymentId, amount, reason, userId) => {
    const txn = await db.sequelize.transaction();
    try {
        const payment = await Payment.findByPk(paymentId, { transaction: txn, lock: txn.LOCK.UPDATE });
        if (!payment) throw { statusCode: 404, message: 'Payment not found' };

        const refundAmount = Math.abs(parseFloat(amount)).toFixed(2);

        await FinancialLedger.create({
            invoice_id: paymentId, job_id: payment.job_id,
            transaction_type: 'REFUND', amount: -refundAmount,
            performed_by: userId, remarks: reason, balance_after: 0
        }, { transaction: txn });

        await txn.commit();
        return { id: payment.id, refunded_amount: refundAmount };
    } catch (e) {
        await txn.rollback();
        throw e;
    }
};
