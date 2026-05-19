/** Canonical status values for list endpoints — used to return complete status_counts (including zeros). */

export const JOB_STATUSES = [
    'CREATED', 'DOCUMENT_VERIFIED', 'APPROVED', 'ASSIGNED', 'SURVEY_AUTHORIZED',
    'IN_PROGRESS', 'SURVEY_DONE', 'REVIEWED', 'FINALIZED', 'REWORK_REQUESTED',
    'PAYMENT_DONE', 'CERTIFIED', 'REJECTED',
];

export const CERTIFICATE_STATUSES = [
    'DRAFT', 'ISSUED', 'VALID', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'TRANSFERRED', 'DOWNGRADED',
];

export const INCIDENT_STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

export const NC_STATUSES = ['OPEN', 'CLOSED'];

export const SURVEY_STATUSES = [
    'NOT_STARTED', 'STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED',
    'SUBMITTED', 'REWORK_REQUIRED', 'FINALIZED',
];
