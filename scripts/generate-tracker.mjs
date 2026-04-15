
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// ALL MODULES + APIs (Complete)
// ─────────────────────────────────────────────
const modules = [
  // ─── 1. AUTHENTICATION ───────────────────────────────────────────────────
  {
    name: '🔐 Authentication',
    prefix: '/api/v1/auth',
    apis: [
      { method: 'POST', endpoint: '/api/v1/auth/login',             description: 'User login (returns access + refresh token)',  roles: 'Public',       be: 'Done', fe: 'Done' },
      { method: 'POST', endpoint: '/api/v1/auth/logout',            description: 'Logout (invalidate session)',                   roles: 'All',          be: 'Done', fe: 'Done' },
      { method: 'POST', endpoint: '/api/v1/auth/refresh-token',     description: 'Get new access token via refresh token',        roles: 'All',          be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/auth/forgot-password',   description: 'Send password reset email/OTP',                 roles: 'Public',       be: 'Done', fe: 'Done' },
      { method: 'POST', endpoint: '/api/v1/auth/reset-password',    description: 'Reset password with token',                     roles: 'Public',       be: 'Done', fe: 'Done' },
      { method: 'POST', endpoint: '/api/v1/auth/change-password',   description: 'Change current password (logged in)',           roles: 'All',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 2. USERS ────────────────────────────────────────────────────────────
  {
    name: '👤 Users',
    prefix: '/api/v1/users',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/users/me',              description: 'Get own profile',                              roles: 'All',          be: 'Done', fe: 'Done' },
      { method: 'PUT',    endpoint: '/api/v1/users/profile-pic',     description: 'Update profile picture (multipart)',            roles: 'All',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/users/fcm-token',       description: 'Update Firebase push notification token',       roles: 'All',          be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/users',                 description: 'List all system users',                        roles: 'ADMIN',        be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/users',                 description: 'Create new internal user',                     roles: 'ADMIN',        be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/users/:id',             description: 'Update user details',                          roles: 'ADMIN',        be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/users/:id/status',      description: 'Enable or disable user account',               roles: 'ADMIN',        be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/users/:id',             description: 'Delete user permanently',                      roles: 'ADMIN',        be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 3. CLIENTS ──────────────────────────────────────────────────────────
  {
    name: '🏢 Clients',
    prefix: '/api/v1/clients',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/clients/profile',           description: 'Client: get own profile',                  roles: 'CLIENT',            be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/clients/profile',           description: 'Client: update own profile',               roles: 'CLIENT',            be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/clients/profile/documents', description: 'Client: get own uploaded documents',       roles: 'CLIENT',            be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/clients/dashboard',         description: 'Client: own dashboard & stats',            roles: 'CLIENT',            be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/clients',                   description: 'Create new client account',                roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/clients',                   description: 'List all clients',                         roles: 'ADMIN,GM,TM,TO',    be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/clients/:id',               description: 'Get client by ID',                         roles: 'ADMIN,GM,TM,TO',    be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/clients/:id/documents',     description: 'Get documents uploaded by client',         roles: 'ADMIN,GM,TM,TO',    be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/clients/:id',               description: 'Update client info',                       roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/clients/:id',               description: 'Delete client',                            roles: 'ADMIN',             be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 4. VESSELS ──────────────────────────────────────────────────────────
  {
    name: '🚢 Vessels',
    prefix: '/api/v1/vessels',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/vessels',                   description: 'List all registered vessels',                roles: 'ADMIN,GM,TM,TO,CLIENT', be: 'Done', fe: 'In Progress' },
      { method: 'GET',  endpoint: '/api/v1/vessels/client/:clientId',  description: 'Get vessels belonging to specific client',   roles: 'ADMIN,GM,TM',           be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/vessels',                   description: 'Create / register new vessel',               roles: 'ADMIN,GM,TM',           be: 'Done', fe: 'In Progress' },
      { method: 'GET',  endpoint: '/api/v1/vessels/:id',               description: 'Get vessel details by ID',                   roles: 'ADMIN,GM,TM,TO,SURV,CLIENT', be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/vessels/:id',               description: 'Update vessel information',                  roles: 'ADMIN,GM,TM',           be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 5. SURVEYORS ────────────────────────────────────────────────────────
  {
    name: '🔍 Surveyors',
    prefix: '/api/v1/surveyors',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/surveyors/get-upload-url',           description: 'Get S3 presigned URL for application docs',  roles: 'Public',         be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveyors/apply',                    description: 'Submit surveyor application (public)',        roles: 'Public',         be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveyors',                          description: 'List all approved surveyors',                 roles: 'ADMIN,GM,TM',    be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveyors',                          description: 'Directly create surveyor account',            roles: 'ADMIN,TM',       be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveyors/applications',             description: 'List pending surveyor applications',          roles: 'ADMIN,TM',       be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/surveyors/applications/:id/review',  description: 'Approve or reject application',               roles: 'TM,ADMIN',       be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/surveyors/:id/status',               description: 'Activate or deactivate surveyor',             roles: 'ADMIN,TM',       be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveyors/:id/profile',              description: 'Get full surveyor profile',                   roles: 'ADMIN,TM,SURV,GM',be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/surveyors/:id/profile',              description: 'Update surveyor profile',                     roles: 'ADMIN,TM',       be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveyors/availability',             description: 'Surveyor marks own availability',             roles: 'SURVEYOR',       be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveyors/location',                 description: 'Report live GPS location',                    roles: 'SURVEYOR',       be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveyors/:id/location-history',     description: 'View GPS history of surveyor',                roles: 'ADMIN,TM,GM',    be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 6. JOBS ─────────────────────────────────────────────────────────────
  {
    name: '💼 Jobs',
    prefix: '/api/v1/jobs',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/jobs',                            description: 'List jobs (filtered by role)',               roles: 'All',              be: 'Done', fe: 'In Progress' },
      { method: 'POST', endpoint: '/api/v1/jobs',                            description: 'Create new job/survey request',              roles: 'CLIENT,ADMIN,GM',  be: 'Done', fe: 'In Progress' },
      { method: 'GET',  endpoint: '/api/v1/jobs/:id',                        description: 'Get job full details',                       roles: 'All',              be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/verify-documents',       description: 'TO verifies submitted client documents',     roles: 'ADMIN,TO,GM',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/approve-request',        description: 'GM/ADMIN approves job request',              roles: 'ADMIN,GM',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/finalize',               description: 'TM finalizes job after survey',              roles: 'ADMIN,GM,TM',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/assign',                 description: 'GM assigns surveyor to job',                 roles: 'ADMIN,GM',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/reassign',               description: 'GM reassigns surveyor',                      roles: 'ADMIN,GM',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/reschedule',             description: 'GM reschedules job date/time',               roles: 'ADMIN,GM',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/authorize-survey',       description: 'Authorize surveyor to begin work on-site',   roles: 'ADMIN,GM,TM', be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/review',                 description: 'TO reviews completed survey',                roles: 'ADMIN,TO',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/send-back',              description: 'Send job back for corrections',              roles: 'ADMIN,TM,TO',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/reject',                 description: 'Reject job request',                         roles: 'ADMIN,GM,TM',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/cancel',                 description: 'Cancel job',                                 roles: 'CLIENT,GM,TM,ADMIN',be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/jobs/:id/priority',               description: 'Update job priority level',                  roles: 'ADMIN,GM,TM',      be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/jobs/:id/history',                description: 'Full lifecycle / audit history of job',      roles: 'ADMIN,GM,TM,TO',   be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/jobs/:id/notes',                  description: 'Add internal note (not visible to client)',  roles: 'ADMIN,GM,TM,TO',   be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/jobs/:id/messages/external',      description: 'List external (client-visible) messages',    roles: 'All',              be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/jobs/:id/messages/internal',      description: 'List internal team messages',                roles: 'ADMIN,GM,TM,TO',   be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/jobs/:id/messages',               description: 'Send job message (with optional attachment)',roles: 'All',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 7. SURVEYS ──────────────────────────────────────────────────────────
  {
    name: '📋 Surveys',
    prefix: '/api/v1/surveys',
    apis: [
      { method: 'POST', endpoint: '/api/v1/surveys',                  description: 'Surveyor creates survey record for job',      roles: 'SURVEYOR',         be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveys/submit',           description: 'Surveyor submits final survey',               roles: 'SURVEYOR',         be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveys',                  description: 'List surveys (with filters)',                 roles: 'ADMIN,GM,TM,TO',   be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/surveys/:id',              description: 'Update survey data (draft)',                  roles: 'SURVEYOR',         be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/surveys/:id/findings',     description: 'Add finding/observation to survey',          roles: 'SURVEYOR',         be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/surveys/:id/review',       description: 'TO/TM reviews and approves survey',          roles: 'TO,TM,ADMIN',      be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/surveys/:id',              description: 'Get survey by ID',                           roles: 'ADMIN,GM,TM,TO,SURV', be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 8. CHECKLISTS ───────────────────────────────────────────────────────
  {
    name: '✅ Checklists',
    prefix: '/api/v1/checklists',
    apis: [
      { method: 'GET', endpoint: '/api/v1/checklists/jobs/:jobId',    description: 'Get checklist assigned to a job',            roles: 'All',              be: 'Done', fe: 'Pending' },
      { method: 'PUT', endpoint: '/api/v1/checklists/jobs/:jobId',    description: 'Surveyor submits completed checklist',       roles: 'SURVEYOR',         be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 9. CHECKLIST TEMPLATES ──────────────────────────────────────────────
  {
    name: '📝 Checklist Templates',
    prefix: '/api/v1/checklists/templates',
    apis: [
      { method: 'POST',   endpoint: '/api/v1/checklists/templates',                         description: 'Create new checklist template',            roles: 'ADMIN,TM',      be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/checklists/templates',                         description: 'List all checklist templates',             roles: 'ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/checklists/templates/:id',                     description: 'Get template details',                     roles: 'ADMIN,GM,TM,SURV',be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/checklists/templates/master-file/:id',         description: 'Download/view master template file URL',   roles: 'ADMIN,TM',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/checklists/templates/:id',                     description: 'Update template content/metadata',         roles: 'ADMIN,TM',      be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/checklists/templates/:id/upload-signed',       description: 'Upload signed scan for physical checklist', roles: 'SURVEYOR',      be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/checklists/templates/:id/assign',             description: 'Assign template to vessel type/cert type',roles: 'ADMIN,TM',      be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/checklists/templates/:id',                     description: 'Delete checklist template',                roles: 'ADMIN',         be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 10. CERTIFICATES ────────────────────────────────────────────────────
  {
    name: '🏆 Certificates',
    prefix: '/api/v1/certificates',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/certificates/verify/:number',               description: 'Public: verify certificate by number',          roles: 'Public',            be: 'Done', fe: 'Done' },
      { method: 'GET',    endpoint: '/api/v1/certificates/types',                        description: 'List all certificate types',                     roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/types',                        description: 'Create new certificate type',                    roles: 'ADMIN',             be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/types/:id',                    description: 'Get certificate type by ID',                     roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/types/:id',                    description: 'Update certificate type',                        roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/types/:id/required-documents', description: 'Get required docs for cert type',               roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/types/:id/required-documents', description: 'Add required doc to cert type',                 roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/types/:id/required-documents/:docId', description: 'Update required doc rule',               roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/certificates/types/:id/required-documents/:docId', description: 'Remove required doc rule',               roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates',                              description: 'List all certificates (with filters)',           roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/expiring',                     description: 'List expiring certificates',                     roles: 'CLIENT,ADMIN,GM,TM,TO', be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/upload-url',                   description: 'Get presigned URL to upload certificate file',   roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/vessel/:vesselId/external',    description: 'Upload externally issued certificate',            roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/vessel/:vesselId',             description: 'Get all certificates for a vessel',              roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/job/:jobId',                   description: 'Get certificate generated from a job',           roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates',                              description: 'Generate certificate draft from job',            roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/:id',                          description: 'Update certificate draft fields',                roles: 'ADMIN,GM,TM',       be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/:id/issue',                    description: 'Officially issue certificate',                   roles: 'ADMIN,GM',          be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/:id',                          description: 'Get certificate full details',                   roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/:id/preview',                  description: 'Preview certificate as PDF',                     roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/:id/download',                 description: 'Download certificate PDF',                       roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/:id/sign',                     description: 'Digitally sign the certificate',                 roles: 'ADMIN,GM',          be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/:id/signature',                description: 'Get signature info for certificate',             roles: 'All',               be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/:id/suspend',                  description: 'Suspend an active certificate',                  roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/:id/revoke',                   description: 'Revoke certificate permanently',                 roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/:id/restore',                  description: 'Restore suspended certificate',                  roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/:id/renew',                    description: 'Renew expiring certificate',                     roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/bulk-renew',                   description: 'Bulk renew multiple certificates',               roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/:id/reissue',                  description: 'Reissue certificate (new version)',              roles: 'ADMIN,TM',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 11. CERTIFICATE AUTHORITIES ─────────────────────────────────────────
  {
    name: '🏛️ Certificate Authorities',
    prefix: '/api/v1/certificates/authorities',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/certificates/authorities',              description: 'List certificate authorities',              roles: 'ADMIN,GM',    be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/certificates/authorities',              description: 'Add new certificate authority',             roles: 'ADMIN',       be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/authorities/upload-logo',  description: 'Get presigned URL for CA logo',             roles: 'ADMIN',       be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/certificates/authorities/:id',          description: 'Get certificate authority details',         roles: 'ADMIN,GM',    be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/certificates/authorities/:id',          description: 'Update certificate authority',               roles: 'ADMIN',       be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/certificates/authorities/:id',          description: 'Delete certificate authority',              roles: 'ADMIN',       be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 12. DOCUMENTS ───────────────────────────────────────────────────────
  {
    name: '📄 Documents',
    prefix: '/api/v1/documents',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/documents/get-upload-url',            description: 'Get S3 presigned URL for file upload',       roles: 'CLIENT,ADMIN,GM,TM,SURV', be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/documents/upload',                    description: 'Upload file directly (multipart)',            roles: 'CLIENT,ADMIN,GM,TM,SURV', be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/documents/register',                  description: 'Register file after S3 direct upload',       roles: 'CLIENT,ADMIN,GM,TM,SURV', be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/documents/:id',                       description: 'Get document metadata by ID',                roles: 'All',                     be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/documents/:entityType/:entityId',     description: 'List all docs for an entity (job/vessel)',    roles: 'All',                     be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/documents/:entityType/:entityId',     description: 'Upload document for specific entity',         roles: 'CLIENT,ADMIN,GM,TM,SURV', be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/documents/:entityType/:entityId/register', description: 'Register doc for entity post-S3 upload', roles: 'CLIENT,ADMIN,GM,TM,SURV', be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/documents/:id',                       description: 'Delete a document',                          roles: 'ADMIN,GM',                be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 13. NOTIFICATIONS ───────────────────────────────────────────────────
  {
    name: '🔔 Notifications',
    prefix: '/api/v1/notifications',
    apis: [
      { method: 'GET', endpoint: '/api/v1/notifications',              description: 'Get own notifications list',                 roles: 'All',          be: 'Done', fe: 'Pending' },
      { method: 'PUT', endpoint: '/api/v1/notifications/:id/read',     description: 'Mark single notification as read',           roles: 'All',          be: 'Done', fe: 'Pending' },
      { method: 'PUT', endpoint: '/api/v1/notifications/read-all',     description: 'Mark all notifications as read',             roles: 'All',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 14. APPROVALS ───────────────────────────────────────────────────────
  {
    name: '✔️ Approvals',
    prefix: '/api/v1/approvals',
    apis: [
      { method: 'POST', endpoint: '/api/v1/approvals',                 description: 'Create multi-step approval workflow',        roles: 'ADMIN,GM,TM',  be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/approvals/:id/step',        description: 'Approve / reject a specific step',           roles: 'ADMIN,GM,TM',  be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 15. NON-CONFORMITIES ────────────────────────────────────────────────
  {
    name: '⚠️ Non-Conformities',
    prefix: '/api/v1/non-conformities',
    apis: [
      { method: 'POST', endpoint: '/api/v1/non-conformities',               description: 'Report a non-conformity finding',         roles: 'SURVEYOR,TO',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/non-conformities/:id/close',     description: 'Close / resolve NC after correction',     roles: 'TO,TM',                be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/non-conformities/job/:jobId',    description: 'Get all NCs for a job',                   roles: 'ADMIN,GM,TM,TO,SURV',  be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 16. INCIDENTS ───────────────────────────────────────────────────────
  {
    name: '🚨 Incidents',
    prefix: '/api/v1/incidents',
    apis: [
      { method: 'POST', endpoint: '/api/v1/incidents',                  description: 'Report a new incident',                    roles: 'CLIENT,ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/incidents',                  description: 'List all incidents',                       roles: 'CLIENT,ADMIN,GM,TM,TO', be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/incidents/:id',              description: 'Get incident details',                     roles: 'CLIENT,ADMIN,GM,TM,TO', be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/incidents/:id/status',       description: 'Update incident investigation status',     roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 17. PAYMENTS ────────────────────────────────────────────────────────
  {
    name: '💰 Payments',
    prefix: '/api/v1/payments',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/payments',                   description: 'List all payments',                        roles: 'CLIENT,ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/payments/summary',           description: 'Get financial summary / totals',           roles: 'CLIENT,ADMIN,GM',      be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/payments/:id',               description: 'Get single payment by ID',                 roles: 'CLIENT,ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/payments/invoice',           description: 'Generate invoice for a job',               roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/payments/:id/pay',           description: 'Mark payment as paid (with receipt)',      roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/payments/:id/refund',        description: 'Process full refund',                      roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/payments/:id/partial',       description: 'Record partial payment',                   roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/payments/:id/ledger',        description: 'View full payment ledger/history',         roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/payments/writeoff',          description: 'Write off bad debt',                       roles: 'ADMIN',                be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 18. REPORTS ─────────────────────────────────────────────────────────
  {
    name: '📊 Reports',
    prefix: '/api/v1/reports',
    apis: [
      { method: 'GET', endpoint: '/api/v1/reports/certificates',        description: 'Certificate issuance report',              roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET', endpoint: '/api/v1/reports/surveyors',           description: 'Surveyor performance report',              roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET', endpoint: '/api/v1/reports/non-conformities',    description: 'Non-conformity summary report',            roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'GET', endpoint: '/api/v1/reports/financials',          description: 'Financial & revenue report',               roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 19. ACTIVITY REQUESTS ───────────────────────────────────────────────
  {
    name: '📌 Activity Requests',
    prefix: '/api/v1/activity-requests',
    apis: [
      { method: 'POST', endpoint: '/api/v1/activity-requests',              description: 'Create activity/service request',      roles: 'CLIENT,ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/activity-requests',              description: 'List activity requests',               roles: 'CLIENT,ADMIN,GM,TM,TO', be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/activity-requests/:id',          description: 'Get activity request by ID',           roles: 'CLIENT,ADMIN,GM,TM,TO', be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/activity-requests/:id/status',   description: 'Update activity request status',       roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 20. CHANGE REQUESTS ─────────────────────────────────────────────────
  {
    name: '🔄 Change Requests',
    prefix: '/api/v1/change-requests',
    apis: [
      { method: 'POST', endpoint: '/api/v1/change-requests',               description: 'Submit change request for a job',      roles: 'CLIENT,ADMIN,GM,TM',   be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/change-requests',               description: 'List all change requests',             roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/change-requests/:id/approve',   description: 'Approve a change request',             roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/change-requests/:id/reject',    description: 'Reject a change request',              roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 21. TOCA ────────────────────────────────────────────────────────────
  {
    name: '📅 TOCA',
    prefix: '/api/v1/toca',
    apis: [
      { method: 'POST', endpoint: '/api/v1/toca',                  description: 'Create TOCA (Technical Certificate)',         roles: 'TM',                   be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/toca/:id/status',       description: 'Update TOCA status',                          roles: 'TM,ADMIN',             be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/toca',                  description: 'List all TOCAs',                               roles: 'ADMIN,GM,TM',          be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 22. FLAGS ───────────────────────────────────────────────────────────
  {
    name: '🚩 Flags (Port/Flag States)',
    prefix: '/api/v1/flags',
    apis: [
      { method: 'POST', endpoint: '/api/v1/flags',      description: 'Create flag state record',                             roles: 'ADMIN',                be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/flags',      description: 'List all flag states',                                 roles: 'ADMIN,GM,TM,TO',       be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/flags/:id',  description: 'Get flag state by ID',                                 roles: 'ADMIN,GM,TM,TO',       be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/flags/:id',  description: 'Update flag state',                                    roles: 'ADMIN',                be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 23. FEEDBACK ────────────────────────────────────────────────────────
  {
    name: '⭐ Feedback',
    prefix: '/api/v1/feedback',
    apis: [
      { method: 'POST', endpoint: '/api/v1/feedback',                   description: 'Client submits job feedback/rating',      roles: 'CLIENT',               be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/feedback',                   description: 'List all feedback (management view)',     roles: 'ADMIN,GM',             be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/feedback/job/:jobId',        description: 'Feedback for specific job',               roles: 'ADMIN,GM,CLIENT',      be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 24. PORTFOLIO FEEDBACK ──────────────────────────────────────────────
  {
    name: '🌟 Portfolio Feedback',
    prefix: '/api/v1/portfolio-feedback',
    apis: [
      { method: 'GET',   endpoint: '/api/v1/portfolio-feedback/public',         description: 'Public: get published testimonials',    roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'POST',  endpoint: '/api/v1/portfolio-feedback',                description: 'Submit/update portfolio feedback',       roles: 'CLIENT',             be: 'Done', fe: 'Pending' },
      { method: 'GET',   endpoint: '/api/v1/portfolio-feedback/my-feedback',    description: 'Client: view own portfolio feedback',    roles: 'CLIENT',             be: 'Done', fe: 'Pending' },
      { method: 'GET',   endpoint: '/api/v1/portfolio-feedback',                description: 'Admin: list all portfolio feedback',     roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
      { method: 'PATCH', endpoint: '/api/v1/portfolio-feedback/:id/visibility', description: 'Toggle public visibility of feedback',  roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 25. CONTACT / ENQUIRIES ─────────────────────────────────────────────
  {
    name: '📞 Contact / Enquiries',
    prefix: '/api/v1/contact',
    apis: [
      { method: 'POST',   endpoint: '/api/v1/contact',              description: 'Submit contact/enquiry form (public)',          roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/contact/stats',        description: 'Enquiry statistics dashboard',                  roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/contact',              description: 'List all enquiries',                            roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/contact/:id',          description: 'Get single enquiry by ID',                      roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
      { method: 'PATCH',  endpoint: '/api/v1/contact/:id/status',   description: 'Update enquiry status (read/replied)',           roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/contact/:id',          description: 'Delete enquiry',                                roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 26. SUPPORT TICKETS ─────────────────────────────────────────────────
  {
    name: '🎫 Support Tickets',
    prefix: '/api/v1/support',
    apis: [
      { method: 'POST', endpoint: '/api/v1/support',                 description: 'Submit support ticket',                       roles: 'All',                be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/support',                 description: 'List all support tickets',                    roles: 'All',                be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/support/:id',             description: 'Get support ticket by ID',                    roles: 'All',                be: 'Done', fe: 'Pending' },
      { method: 'PUT',  endpoint: '/api/v1/support/:id/status',      description: 'Update ticket status (open/resolved)',         roles: 'ADMIN,GM',           be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 27. COMPLIANCE ──────────────────────────────────────────────────────
  {
    name: '📜 Compliance (GDPR)',
    prefix: '/api/v1/compliance',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/compliance/export/:id',   description: 'Export user data (GDPR data portability)',     roles: 'ADMIN,CLIENT',       be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/compliance/anonymize/:id',description: 'Anonymize user data (GDPR right to forget)',   roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 28. SEARCH ──────────────────────────────────────────────────────────
  {
    name: '🔎 Global Search',
    prefix: '/api/v1/search',
    apis: [
      { method: 'GET', endpoint: '/api/v1/search',                   description: 'Global search across vessels, jobs, clients',  roles: 'All',                be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 29. DASHBOARD ───────────────────────────────────────────────────────
  {
    name: '📈 Dashboard',
    prefix: '/api/v1/dashboard',
    apis: [
      { method: 'GET', endpoint: '/api/v1/dashboard',                description: 'Role-specific dashboard stats & metrics',      roles: 'All',                be: 'Done', fe: 'In Progress' },
    ]
  },
  // ─── 30. EMAIL TEMPLATES ─────────────────────────────────────────────────
  {
    name: '📧 Email Templates',
    prefix: '/api/v1/templates',
    apis: [
      { method: 'POST',   endpoint: '/api/v1/templates',             description: 'Create email/doc template',                   roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/templates',             description: 'List all templates',                          roles: 'ADMIN,GM,TM',        be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/templates/:id',         description: 'Get template by ID',                          roles: 'ADMIN,GM,TM',        be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/templates/:id',         description: 'Update template content',                     roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/templates/:id',         description: 'Delete template',                             roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 31. SITE STATIC CONTENT ─────────────────────────────────────────────
  {
    name: '🌐 Site Static Content',
    prefix: '/api/v1/site-static',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/site-static',           description: 'List published pages (public)',               roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/site-static/:slug',     description: 'Get page by slug (public)',                   roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/site-static',           description: 'Create new static page',                     roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/site-static/:slug',     description: 'Update page by slug',                        roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/site-static/:slug',     description: 'Delete page by slug',                        roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'GET',    endpoint: '/api/v1/site-static/admin/:id', description: 'Admin: get page by ID (incl. drafts)',       roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/site-static/admin/:id', description: 'Admin: update page by ID',                   roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/site-static/admin/:id', description: 'Admin: delete page by ID',                   roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 32. NEWSLETTER ──────────────────────────────────────────────────────
  {
    name: '📰 Newsletter',
    prefix: '/api/v1/newsletter',
    apis: [
      { method: 'POST', endpoint: '/api/v1/newsletter/subscribe',             description: 'Subscribe to newsletter',            roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/newsletter/unsubscribe',           description: 'Unsubscribe from newsletter',        roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/newsletter/unsubscribe-one-click', description: 'One-click unsubscribe (from email)', roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/newsletter/subscribers',           description: 'List all subscribers',              roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/newsletter/send',                  description: 'Broadcast email to all subscribers',roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 33. WEBSITE / VIDEOS ────────────────────────────────────────────────
  {
    name: '🎥 Website / Videos',
    prefix: '/api/v1/website',
    apis: [
      { method: 'GET',    endpoint: '/api/v1/website/videos',        description: 'List website video gallery (public)',         roles: 'Public',             be: 'Done', fe: 'Pending' },
      { method: 'POST',   endpoint: '/api/v1/website/videos',        description: 'Upload new video with thumbnail',            roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'PUT',    endpoint: '/api/v1/website/videos/:id',    description: 'Update video metadata',                      roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'DELETE', endpoint: '/api/v1/website/videos/:id',    description: 'Delete video',                               roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 34. PUBLIC ENDPOINTS ────────────────────────────────────────────────
  {
    name: '🌍 Public Endpoints',
    prefix: '/api/v1/public',
    apis: [
      { method: 'GET', endpoint: '/api/v1/public/certificate/verify/:number', description: 'Verify certificate (public portal)', roles: 'Public',            be: 'Done', fe: 'Done' },
      { method: 'GET', endpoint: '/api/v1/public/vessel/:imo',                description: 'Verify vessel by IMO number',        roles: 'Public',            be: 'Done', fe: 'Pending' },
      { method: 'GET', endpoint: '/api/v1/public/website/videos',             description: 'Get website video gallery',         roles: 'Public',            be: 'Done', fe: 'Pending' },
    ]
  },
  // ─── 35. SYSTEM / ADMIN OPS ──────────────────────────────────────────────
  {
    name: '⚙️ System / Admin Ops',
    prefix: '/api/v1/system',
    apis: [
      { method: 'GET',  endpoint: '/api/v1/system/health',              description: 'Server health check',                     roles: 'Public',             be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/readiness',           description: 'DB/cache readiness check',                roles: 'Public',             be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/version',             description: 'API version info',                        roles: 'Public',             be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/metrics',             description: 'Server performance metrics',               roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/audit-logs',          description: 'Full system audit logs',                   roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'POST', endpoint: '/api/v1/system/users/:id/logout',    description: 'Force logout a user',                     roles: 'ADMIN',              be: 'Done', fe: 'Pending' },
      { method: 'GET',  endpoint: '/api/v1/system/migrations',          description: 'View DB migration status',                roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/jobs/failed',         description: 'View failed background jobs',             roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'POST', endpoint: '/api/v1/system/jobs/:id/retry',      description: 'Retry failed background job',             roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'POST', endpoint: '/api/v1/system/maintenance/:action', description: 'Trigger maintenance action',              roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/feature-flags',       description: 'View feature flags',                      roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
      { method: 'GET',  endpoint: '/api/v1/system/locales',             description: 'View supported locales',                  roles: 'ADMIN',              be: 'Done', fe: 'N/A' },
    ]
  },
];

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────
const COLORS = {
  navyHeader:     '1B2A4A',
  moduleHeader:   '2C5F8A',
  altRow:         'EEF4FB',
  whiteRow:       'FFFFFF',
  done:           'C6EFCE', doneFont:       '276221',
  inProgress:     'FFEB9C', inProgressFont: '9C6500',
  pending:        'FCE4D6', pendingFont:    '9C3B15',
  na:             'E9ECEF', naFont:         '6C757D',
  methodGet:      'D4EDDA',
  methodPost:     'D1ECF1',
  methodPut:      'FFF3CD',
  methodDelete:   'F8D7DA',
  methodPatch:    'E2D9F3',
};

const getStatusStyle = (status) => {
  const map = {
    'Done':        { fill: COLORS.done,       font: { bold: true, color: { argb: 'FF' + COLORS.doneFont } } },
    'In Progress': { fill: COLORS.inProgress, font: { bold: true, color: { argb: 'FF' + COLORS.inProgressFont } } },
    'Pending':     { fill: COLORS.pending,    font: { bold: true, color: { argb: 'FF' + COLORS.pendingFont } } },
    'N/A':         { fill: COLORS.na,         font: { bold: true, color: { argb: 'FF' + COLORS.naFont } } },
  };
  return map[status] || { fill: COLORS.whiteRow, font: {} };
};

const getMethodFill = (m) => ({ GET: COLORS.methodGet, POST: COLORS.methodPost, PUT: COLORS.methodPut, PATCH: COLORS.methodPatch, DELETE: COLORS.methodDelete }[m] || 'FFFFFF');

// ─────────────────────────────────────────────
// BUILD WORKBOOK
// ─────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
wb.creator = 'GR-Class Backend Team';
wb.created = new Date();

// ══════════════════════════════════════════════════════════════
// SHEET 1 — API Tracker
// ══════════════════════════════════════════════════════════════
const ws = wb.addWorksheet('📡 API Tracker', { views: [{ state: 'frozen', ySplit: 3 }] });
ws.columns = [
  { key: 'sno',    width: 5  },
  { key: 'method', width: 10 },
  { key: 'ep',     width: 54 },
  { key: 'desc',   width: 38 },
  { key: 'roles',  width: 32 },
  { key: 'be',     width: 16 },
  { key: 'fe',     width: 16 },
  { key: 'notes',  width: 30 },
];

// Title row
ws.mergeCells('A1:H1');
const t = ws.getCell('A1');
t.value = '🚢  GR-Class Maritime Certification System — Complete API Progress Tracker';
t.font  = { name: 'Calibri', bold: true, size: 15, color: { argb: 'FFFFFFFF' } };
t.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.navyHeader } };
t.alignment = { horizontal: 'center', vertical: 'middle' };
ws.getRow(1).height = 38;

// Sub-title: last updated
ws.mergeCells('A2:H2');
const st = ws.getCell('A2');
const now = new Date();
st.value = `Last Updated: ${now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}  |  Total APIs: ${modules.reduce((s,m)=>s+m.apis.length,0)}  |  Modules: ${modules.length}`;
st.font  = { name: 'Calibri', italic: true, size: 10, color: { argb: 'FFFFFFFF' } };
st.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C5F8A' } };
st.alignment = { horizontal: 'center', vertical: 'middle' };
ws.getRow(2).height = 18;

// Column headers
const hdrs = ['#', 'Method', 'API Endpoint', 'Description', 'Role Access', '🖥 Backend', '🖱 Frontend', 'Notes / Blockers'];
const hRow = ws.getRow(3);
hRow.height = 24;
hdrs.forEach((h, i) => {
  const c = hRow.getCell(i + 1);
  c.value = h;
  c.font  = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2A4A' } };
  c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  c.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
});

let rowIdx = 4;
let sno = 1;

modules.forEach(mod => {
  // Module separator row
  ws.mergeCells(`A${rowIdx}:H${rowIdx}`);
  const mr = ws.getRow(rowIdx);
  mr.height = 22;
  const mc = mr.getCell(1);
  mc.value = `  ${mod.name}   [${mod.prefix}]`;
  mc.font  = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  mc.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.moduleHeader } };
  mc.alignment = { vertical: 'middle' };
  rowIdx++;

  mod.apis.forEach((api, idx) => {
    const row = ws.getRow(rowIdx);
    row.height = 20;
    const bg = idx % 2 === 0 ? COLORS.altRow : COLORS.whiteRow;

    const setC = (col, val, opts = {}) => {
      const c = row.getCell(col);
      c.value = val;
      c.font  = { name: 'Calibri', size: 10, ...opts.font };
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + (opts.bg || bg) }, ...opts.fill };
      c.alignment = { vertical: 'middle', horizontal: opts.align || 'left', wrapText: true };
      c.border = { top:{style:'hair',color:{argb:'FFCCCCCC'}}, bottom:{style:'hair',color:{argb:'FFCCCCCC'}},
                   left:{style:'hair',color:{argb:'FFCCCCCC'}}, right:{style:'hair',color:{argb:'FFCCCCCC'}} };
    };

    // #
    setC(1, sno++, { align: 'center', font: { size: 9, color: { argb: 'FF666666' } } });

    // Method badge
    const mc2 = row.getCell(2);
    mc2.value = api.method;
    mc2.font  = { name: 'Calibri', bold: true, size: 10 };
    mc2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + getMethodFill(api.method) } };
    mc2.alignment = { horizontal: 'center', vertical: 'middle' };
    mc2.border = { top:{style:'hair'}, bottom:{style:'hair'}, left:{style:'hair'}, right:{style:'hair'} };

    // Endpoint (monospace)
    const ec = row.getCell(3);
    ec.value = api.endpoint;
    ec.font  = { name: 'Courier New', size: 9, color: { argb: 'FF1B2A4A' } };
    ec.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } };
    ec.alignment = { vertical: 'middle', horizontal: 'left' };
    ec.border = { top:{style:'hair'}, bottom:{style:'hair'}, left:{style:'hair'}, right:{style:'hair'} };

    setC(4, api.description);
    setC(5, api.roles, { font: { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF444444' } } });

    // BE status
    const beS = getStatusStyle(api.be);
    const beC = row.getCell(6);
    beC.value = api.be;
    beC.font  = { name: 'Calibri', size: 10, ...beS.font };
    beC.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + beS.fill } };
    beC.alignment = { horizontal: 'center', vertical: 'middle' };
    beC.border = { top:{style:'hair'}, bottom:{style:'hair'}, left:{style:'hair'}, right:{style:'hair'} };

    // FE status
    const feS = getStatusStyle(api.fe);
    const feC = row.getCell(7);
    feC.value = api.fe;
    feC.font  = { name: 'Calibri', size: 10, ...feS.font };
    feC.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + feS.fill } };
    feC.alignment = { horizontal: 'center', vertical: 'middle' };
    feC.border = { top:{style:'hair'}, bottom:{style:'hair'}, left:{style:'hair'}, right:{style:'hair'} };

    setC(8, '');
    rowIdx++;
  });
});

ws.autoFilter = { from: 'A3', to: 'H3' };

// ══════════════════════════════════════════════════════════════
// SHEET 2 — Summary Dashboard
// ══════════════════════════════════════════════════════════════
const ws2 = wb.addWorksheet('📊 Summary');
ws2.columns = [{ width: 32 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];

ws2.mergeCells('A1:F1');
const s2T = ws2.getCell('A1');
s2T.value = '📊 GR-Class — API Module-wise Progress Summary';
s2T.font  = { name: 'Calibri', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
s2T.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.navyHeader } };
s2T.alignment = { horizontal: 'center', vertical: 'middle' };
ws2.getRow(1).height = 36;

const s2Hdrs = ['Module', 'Total APIs', '✅ BE Done', '⏳ BE Pending', '✅ FE Done', '⏳ FE Pending'];
const s2HR = ws2.getRow(2);
s2HR.height = 24;
s2Hdrs.forEach((h, i) => {
  const c = s2HR.getCell(i + 1);
  c.value = h;
  c.font  = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.moduleHeader } };
  c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  c.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
});

let tTotal = 0, tBeDone = 0, tFeDone = 0;
modules.forEach((mod, idx) => {
  const total  = mod.apis.length;
  const beDone = mod.apis.filter(a => a.be === 'Done').length;
  const feDone = mod.apis.filter(a => a.fe === 'Done').length;
  tTotal += total; tBeDone += beDone; tFeDone += feDone;

  const row = ws2.getRow(3 + idx);
  row.height = 20;
  const bg = idx % 2 === 0 ? COLORS.altRow : COLORS.whiteRow;

  const sc = (col, val, bg2) => {
    const c = row.getCell(col);
    c.value = val;
    c.font  = { name: 'Calibri', size: 10, bold: typeof val === 'number' };
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + (bg2 || bg) } };
    c.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
    c.border = { top:{style:'hair'}, bottom:{style:'hair'}, left:{style:'hair'}, right:{style:'hair'} };
  };

  sc(1, mod.name);
  sc(2, total);
  sc(3, beDone, beDone === total ? COLORS.done : COLORS.inProgress);
  sc(4, total - beDone, total - beDone === 0 ? COLORS.done : COLORS.pending);
  sc(5, feDone, feDone === total ? COLORS.done : (feDone > 0 ? COLORS.inProgress : COLORS.pending));
  sc(6, total - feDone, total - feDone === 0 ? COLORS.done : COLORS.pending);
});

// Totals
const tr = ws2.getRow(3 + modules.length);
tr.height = 26;
[`TOTAL (${modules.length} modules)`, tTotal, tBeDone, tTotal-tBeDone, tFeDone, tTotal-tFeDone].forEach((v, i) => {
  const c = tr.getCell(i + 1);
  c.value = v;
  c.font  = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.navyHeader } };
  c.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' };
  c.border = { top:{style:'medium'}, bottom:{style:'medium'}, left:{style:'thin'}, right:{style:'thin'} };
});

// Legend
const lgRow = 3 + modules.length + 2;
ws2.mergeCells(`A${lgRow}:F${lgRow}`);
ws2.getCell(`A${lgRow}`).value = '— STATUS LEGEND —';
ws2.getCell(`A${lgRow}`).font = { bold: true, size: 10 };
ws2.getCell(`A${lgRow}`).alignment = { horizontal: 'center' };

[['✅ Done', COLORS.done], ['🔄 In Progress', COLORS.inProgress], ['⏳ Pending', COLORS.pending], ['—  N/A', COLORS.na]].forEach((item, i) => {
  const c = ws2.getRow(lgRow + 1).getCell(i + 1);
  c.value = item[0];
  c.font  = { bold: true, size: 9 };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + item[1] } };
  c.alignment = { horizontal: 'center', vertical: 'middle' };
  c.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
  ws2.getRow(lgRow + 1).height = 22;
});

// Write
const outPath = path.join(__dirname, '..', 'GRClass_API_Tracker.xlsx');
await wb.xlsx.writeFile(outPath);
console.log(`✅ Excel generated: ${outPath}`);
console.log(`📊 Total APIs: ${modules.reduce((s,m)=>s+m.apis.length,0)} across ${modules.length} modules`);
