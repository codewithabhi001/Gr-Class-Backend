import logger from '../utils/logger.js';
import chalk from 'chalk';

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
        
        const statusCode = res.statusCode;
        let scColor;
        if (statusCode >= 500) scColor = chalk.bold.red;
        else if (statusCode >= 400) scColor = chalk.yellow;
        else if (statusCode >= 300) scColor = chalk.cyan;
        else scColor = chalk.green;

        const methodColor = {
            'GET': chalk.blue,
            'POST': chalk.green,
            'PUT': chalk.yellow,
            'DELETE': chalk.red,
            'PATCH': chalk.magenta
        }[req.method] || chalk.white;

        const ip = req.ip || req.connection?.remoteAddress || 'unknown';

        const message = isProd
            ? `${req.method} ${req.originalUrl} - ${statusCode} [${ip}]`
            : `${methodColor(req.method.padEnd(6))} ${chalk.white(req.originalUrl.split('?')[0])} ${scColor(statusCode)} ${chalk.gray(`${duration}ms`)} ${chalk.dim(`(${ip})`)}`;

        const line = {
            event: 'api_request',
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: duration,
            user: req.user?.id || null,
            ip,
        };
        
        if (res.statusCode >= 500) {
            logger.error(message, line);
        } else {
            logger.info(message, line);
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
