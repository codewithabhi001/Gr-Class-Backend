import { ipKeyGenerator } from 'express-rate-limit';

/** Client IP for rate limiting when the app sits behind nginx / a load balancer. */
export const rateLimitClientKey = (req) => {
    const realIp = req.headers['x-real-ip'];
    if (realIp) return ipKeyGenerator(String(realIp).trim());

    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const first = String(forwarded).split(',')[0]?.trim();
        if (first) return ipKeyGenerator(first);
    }

    return ipKeyGenerator(req.ip);
};

/** Auth routes apply their own stricter limiters in auth.routes.js */
export const isAuthRateLimitedRoute = (req) => {
    if (req.method !== 'POST') return false;
    return /^\/auth\/(login|forgot-password|reset-password)$/.test(req.path);
};
