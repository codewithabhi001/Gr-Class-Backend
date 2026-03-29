import logger from '../utils/logger.js';

const isProd = process.env.NODE_ENV === 'production';

function sanitizeBody(body) {
    if (!body) return undefined;
    const sanitized = { ...body };
    ['password', 'password_hash', 'token', 'secret', 'apiKey', 'refreshToken'].forEach((field) => {
        if (sanitized[field]) sanitized[field] = '***REDACTED***';
    });
    return sanitized;
}

/**
 * API request/response logging — structured (Winston), no raw body in production.
 */
export const apiLogger = (req, res, next) => {
    const startTime = Date.now();

    const originalSend = res.send;
    const originalJson = res.json;

    const logOnce = () => {
        if (res._logged) return;
        res._logged = true;
        const duration = Date.now() - startTime;
        const line = {
            event: 'api_request',
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration,
            user: req.user?.id || null,
            ip: req.ip || req.connection?.remoteAddress,
        };
        if (!isProd && req.method !== 'GET' && req.body && Object.keys(req.body).length) {
            line.requestBody = sanitizeBody(req.body);
        }
        if (res.statusCode >= 500) {
            logger.error('API', line);
        } else {
            logger.info('API', line);
        }
    };

    res.send = function (data) {
        if (!res.headersSent) logOnce();
        originalSend.call(this, data);
    };

    res.json = function (data) {
        if (!res.headersSent) logOnce();
        originalJson.call(this, data);
    };

    next();
};

/**
 * Error Logger Middleware — forwards to global error handler after structured log.
 */
export const errorLogger = (err, req, res, next) => {
    logger.error('API route error', {
        event: 'api_error',
        method: req.method,
        path: req.originalUrl,
        message: err.message,
        name: err.name,
        user: req.user?.email || null,
        ip: req.ip || req.connection?.remoteAddress,
        stack: isProd ? undefined : err.stack,
        sql: err.sql,
    });
    next(err);
};
