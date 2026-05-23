
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong on our end.';
    let errorCode = err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'API_ERROR');
    let errors = err.errors || undefined;
    const traceId = req.traceId || uuidv4();

    // ── Sequelize Validation / Unique Constraint ──────────────────────────────
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed. Please correct the highlighted fields.';
        errors = {};
        (err.errors || []).forEach(e => {
            errors[e.path] = e.message;
        });
    }

    // ── Sequelize Foreign Key Constraint ─────────────────────────────────────
    // Happens when trying to delete a record that is referenced by another table.
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409;
        errorCode = 'FOREIGN_KEY_CONSTRAINT';
        message = 'This record cannot be deleted or modified because it is referenced by other records in the system. Please remove or reassign those records first.';
        errors = undefined;
    }

    // ── Generic Sequelize DB Error (e.g. bad query, column not found) ─────────
    if (err.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
        message = 'A database error occurred. Please try again or contact support.';
        errors = undefined;
    }

    // ── Sequelize Connection Error ────────────────────────────────────────────
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionTimedOutError') {
        statusCode = 503;
        errorCode = 'DATABASE_UNAVAILABLE';
        message = 'Unable to connect to the database. Please try again shortly.';
        errors = undefined;
    }

    // ── Body-parser payload limit ─────────────────────────────────────────────
    if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
        statusCode = 413;
        errorCode = 'PAYLOAD_TOO_LARGE';
        message = 'Payload size exceeds the limit of 25MB.';
    }

    // ── Friendly fallbacks for generic HTTP codes ─────────────────────────────
    if (statusCode === 401 && message === 'Internal Server Error') message = 'Authentication required. Please login again.';
    if (statusCode === 403 && message === 'Internal Server Error') message = 'You do not have permission to perform this action.';
    if (statusCode === 404 && message === 'Internal Server Error') message = 'The requested resource was not found.';

    // Remove quotes from Joi/Sequelize messages if any
    message = message.replace(/"/g, '');

    logger.error(`${statusCode} - [${errorCode}] ${message}`, {
        event: 'api_error',
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        traceId,
        errors,
        // Only log raw DB error for server errors (never expose to client)
        db_error: statusCode >= 500 && err.original ? err.original.message : undefined,
        stack: statusCode >= 500 ? err.stack : undefined
    });

    res.status(statusCode).json({
        success: false,
        error_code: errorCode,
        message,
        errors,
        trace_id: traceId,
        stack: (process.env.NODE_ENV === 'production' || statusCode < 500) ? undefined : err.stack,
    });
};

