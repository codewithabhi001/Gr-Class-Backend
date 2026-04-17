import crypto from 'crypto';
import env from '../config/env.js';

const getSecret = () => env.newsletterUnsubscribeSecret || process.env.JWT_SECRET || 'fallback-newsletter-secret';

/**
 * Signed token for RFC 8058 one-click unsubscribe (per recipient).
 * @param {string} email
 * @returns {string}
 */
export function createNewsletterUnsubscribeToken(email) {
    const e = String(email).trim().toLowerCase();
    const exp = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const payload = Buffer.from(JSON.stringify({ e, exp }), 'utf8').toString('base64url');
    const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    return `${payload}.${sig}`;
}

/**
 * @param {string} token
 * @returns {string | null} normalized email or null
 */
export function verifyNewsletterUnsubscribeToken(token) {
    if (!token || typeof token !== 'string') return null;
    const i = token.indexOf('.');
    if (i === -1) return null;
    const payload = token.slice(0, i);
    const sig = token.slice(i + 1);
    const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    if (sig.length !== expected.length) return null;
    try {
        if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    } catch {
        return null;
    }
    let data;
    try {
        data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
    if (!data.e || typeof data.exp !== 'number' || Date.now() > data.exp) return null;
    return String(data.e).trim().toLowerCase();
}
