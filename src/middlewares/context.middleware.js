import { contextStorage } from '../utils/context.util.js';

export const contextMiddleware = (req, res, next) => {
    const data = {
        userId: req.user?.id || null,
        reqId: req.headers['x-request-id'] || Math.random().toString(36).substring(7),
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method
    };

    contextStorage.run(data, () => {
        next();
    });
};

/**
 * Update the context with user ID once authenticated.
 */
export const updateContextUser = (user) => {
    const store = contextStorage.getStore();
    if (store) {
        store.userId = user.id;
        store.userRole = user.role;
    }
};
