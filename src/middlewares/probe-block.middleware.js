/**
 * Reject automated vulnerability scans early so they do not consume
 * the global API rate-limit bucket (especially when all traffic shares one IP behind nginx).
 */
const ALLOWED_PREFIXES = ['/api/v1', '/docs', '/api-docs'];

export const probeBlockMiddleware = (req, res, next) => {
    const path = req.path || req.url?.split('?')[0] || '/';
    if (ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
        return next();
    }
    res.status(404).end();
};
