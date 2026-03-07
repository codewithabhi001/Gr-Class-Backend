import logger from '../utils/logger.js';

/**
 * Enhanced API Request/Response Logger Middleware
 * Logs every API hit with detailed information and errors
 */
export const apiLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log incoming request
    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        user: req.user ? `${req.user.name} (${req.user.email})` : 'Anonymous',
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
        query: Object.keys(req.query).length > 0 ? req.query : undefined
    };

    console.log('\n' + '='.repeat(80));
    console.log(`📥 INCOMING REQUEST: ${req.method} ${req.originalUrl}`);
    console.log('='.repeat(80));
    console.log('⏰ Time:', new Date().toISOString());
    console.log('👤 User:', requestInfo.user);
    console.log('🌐 IP:', requestInfo.ip);
    if (requestInfo.query) {
        console.log('🔍 Query:', JSON.stringify(requestInfo.query, null, 2));
    }
    if (requestInfo.body) {
        console.log('📦 Body:', JSON.stringify(requestInfo.body, null, 2));
    }
    console.log('='.repeat(80) + '\n');

    // Capture response
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
        if (!res.headersSent && !res._logged) {
            logResponse(req, res, data, startTime);
            res._logged = true;
        }
        originalSend.call(this, data);
    };

    res.json = function (data) {
        if (!res.headersSent && !res._logged) {
            logResponse(req, res, data, startTime);
            res._logged = true;
        }
        originalJson.call(this, data);
    };

    next();
};

function logResponse(req, res, data, startTime) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    console.log('\n' + '='.repeat(80));
    console.log(`${isError ? '❌' : '✅'} RESPONSE: ${req.method} ${req.originalUrl}`);
    console.log('='.repeat(80));
    console.log('⏱️  Duration:', `${duration}ms`);
    console.log('📊 Status:', statusCode, getStatusEmoji(statusCode));

    if (isError) {
        console.log('🔴 ERROR RESPONSE:');
        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            console.log(JSON.stringify(parsedData, null, 2));
        } catch (e) {
            console.log(data);
        }
    } else {
        console.log('🟢 Success');
    }

    console.log('='.repeat(80) + '\n');

    // Log to file as well
    logger.info('API Request', {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration: `${duration}ms`,
        user: req.user?.email || 'Anonymous',
        ip: req.ip
    });
}

function getStatusEmoji(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return '✅ Success';
    if (statusCode >= 300 && statusCode < 400) return '↪️  Redirect';
    if (statusCode === 400) return '❌ Bad Request';
    if (statusCode === 401) return '🔒 Unauthorized';
    if (statusCode === 403) return '🚫 Forbidden';
    if (statusCode === 404) return '🔍 Not Found';
    if (statusCode >= 400 && statusCode < 500) return '❌ Client Error';
    if (statusCode >= 500) return '💥 Server Error';
    return '';
}

function sanitizeBody(body) {
    if (!body) return undefined;

    const sanitized = { ...body };

    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***REDACTED***';
        }
    });

    return sanitized;
}

/**
 * Error Logger Middleware
 * Logs detailed error information
 */
export const errorLogger = (err, req, res, next) => {
    console.log('\n' + '🔥'.repeat(40));
    console.log('💥 ERROR OCCURRED');
    console.log('🔥'.repeat(40));
    console.log('⏰ Time:', new Date().toISOString());
    console.log('📍 Endpoint:', `${req.method} ${req.originalUrl}`);
    console.log('👤 User:', req.user ? `${req.user.name} (${req.user.email})` : 'Anonymous');
    console.log('🌐 IP:', req.ip || req.connection.remoteAddress);
    console.log('\n❌ ERROR DETAILS:');
    console.log('Name:', err.name);
    console.log('Message:', err.message);

    if (err.stack) {
        console.log('\n📚 STACK TRACE:');
        console.log(err.stack);
    }

    if (err.sql) {
        console.log('\n💾 SQL QUERY:');
        console.log(err.sql);
    }

    if (err.errors) {
        console.log('\n📋 VALIDATION ERRORS:');
        console.log(JSON.stringify(err.errors, null, 2));
    }

    console.log('🔥'.repeat(40) + '\n');

    // Log to file
    logger.error('API Error', {
        method: req.method,
        url: req.originalUrl,
        error: err.message,
        stack: err.stack,
        user: req.user?.email || 'Anonymous'
    });

    next(err);
};
