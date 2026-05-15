/**
 * Single source of truth for role → permission lists.
 * Keep route middleware (`authorizeRoles`) and service-layer checks aligned with these arrays.
 */

export const RBAC = {
    /** PUT /jobs/:id/authorize-survey — `job.service.authorizeSurvey` */
    AUTHORIZE_SURVEY: ['ADMIN', 'TM'],

    /** PUT /jobs/:id/approve-request */
    APPROVE_JOB_REQUEST: ['ADMIN', 'GM'],

    /** PUT /jobs/:id/verify-documents */
    VERIFY_JOB_DOCUMENTS: ['ADMIN', 'TO', 'GM'],

    /** PUT /jobs/:id/finalize (non-survey path) */
    FINALIZE_JOB: ['ADMIN', 'GM', 'TM'],

    /** PUT /jobs/:id/review */
    REVIEW_JOB: ['ADMIN', 'TO'],

    /** PUT /jobs/:id/send-back */
    SEND_BACK_JOB: ['ADMIN', 'TM', 'TO'],

    /** PUT /jobs/:id/assign */
    ASSIGN_JOB: ['ADMIN', 'GM'],

    /** PUT /jobs/:id/reassign */
    REASSIGN_JOB: ['ADMIN', 'GM', 'TM'],

    /** Certificate generation — `certificate.service.generateCertificate` */
    GENERATE_CERTIFICATE: ['ADMIN', 'GM', 'TM'],
};

/**
 * @param {readonly string[]} allowedRoles
 * @param {string} userRole
 */
export const isRoleAllowed = (allowedRoles, userRole) =>
    Array.isArray(allowedRoles) && allowedRoles.includes(userRole);
