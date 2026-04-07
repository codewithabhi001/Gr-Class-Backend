/**
 * RFC 8058 one-click: token is usually in the query string; some clients vary.
 * @param {import('express').Request} req
 * @returns {string}
 */
export function extractUnsubscribeTokenFromRequest(req) {
    let t = req.query?.token;
    if (typeof t === 'string' && t.length) return t;
    if (Array.isArray(t) && typeof t[0] === 'string') return t[0];

    const bodyTok = req.body?.token;
    if (typeof bodyTok === 'string' && bodyTok.length) return bodyTok;

    try {
        const path = req.originalUrl || req.url || '';
        const q = path.indexOf('?');
        if (q !== -1) {
            const params = new URLSearchParams(path.slice(q + 1));
            const p = params.get('token');
            if (p) return p;
        }
    } catch {
        /* ignore */
    }
    return '';
}
