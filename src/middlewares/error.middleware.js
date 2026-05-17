
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong on our end.';
    let errorCode = err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'API_ERROR');
    let errors = err.errors || undefined;
    const traceId = req.traceId || uuidv4();

    // Specific handling for Sequelize Errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed. Please correct the highlighted fields.';
        errors = {};
        err.errors.forEach(e => {
            errors[e.path] = e.message;
        });
    }

    // Specific handling for body-parser limit errors (Payload Too Large)
    if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
        statusCode = 413;
        errorCode = 'PAYLOAD_TOO_LARGE';
        message = 'Payload size exceeds the limit of 2MB.';
    }

    // Friendly messages for common status codes if message is generic
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

