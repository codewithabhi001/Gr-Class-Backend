/**
 * Middleware to check if the user has one of the required roles.
 * @param  {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};

/** Alias for authorizeRoles. Use with applyDataScope for role + data-scoped routes. */
export const requireRoles = authorizeRoles;

/**
 * Attach data-scope filter to req.dataScope by calling scopeFn(req.user).
 * Handlers (or services they call) can use req.dataScope, or compute scope themselves from req.user.
 * @param {(user: object) => Promise<object>} scopeFn - e.g. getCertificateScopeFilter
 */
export const applyDataScope = (scopeFn) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }
            req.dataScope = await scopeFn(req.user);
            next();
        } catch (err) {
            next(err);
        }
    };
};

export const hasRole = authorizeRoles;

/**
 * Middleware to enforce separation of duties.
 * Prevents a user from acting on an entity they previously owned/assigned.
 * @param {string} modelName - The Sequelize model name (e.g., 'JobRequest')
 * @param {string} matchField - The field on the entity to compare against req.user.id (e.g., 'assigned_by_user_id')
 * @param {string} paramNames - Comma separated possible req.params to check for entity ID (default: 'jobId,id')
 */
export const preventSelfApproval = (modelName, matchField, paramNames = 'jobId,id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not authenticated' });
            }

            const db = (await import('../models/index.js')).default;
            const Model = db[modelName];
            
            if (!Model) {
                return next();
            }

            // Find the first matching param
            const possibleParams = paramNames.split(',');
            let entityId = null;
            for (const param of possibleParams) {
                if (req.params[param]) {
                    entityId = req.params[param];
                    break;
                }
            }

            if (!entityId) return next();

            const entity = await Model.findByPk(entityId);
            if (!entity) return next();

            if (entity[matchField] === req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Separation of duties violation: You cannot verify/approve an entity you created or assigned.'
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};
