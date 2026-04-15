# API Access Control Matrix

This document lists API endpoints accessible to each user role.
*Note: 'ADMIN' typically has access to all protected endpoints.*

## 🌍 PUBLIC (No Auth Required)

- `GET /api/public/certificate/verify/:number`
- `GET /api/public/vessel/:imo`
- `GET /api/public/website/videos`

## 🔐 AUTHENTICATED (All Logged-in Users)

These endpoints do not have specific role restrictions but require a valid login.

- `GET /api/certificates/verify/:number`
- `GET /api/checklists/jobs/:jobId`
- `GET /api/notifications`
- `GET /api/search`
- `GET /api/support`
- `GET /api/support/:id`
- `GET /api/surveyors/get-upload-url`
- `GET /api/system/health`
- `GET /api/system/readiness`
- `GET /api/system/version`
- `GET /api/users/me`
- `GET /api/website/videos`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `POST /api/auth/reset-password`
- `POST /api/contact`
- `POST /api/support`
- `POST /api/surveyors/apply`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`
- `PUT /api/users/fcm-token`
- `PUT /api/users/profile-pic`

## 👤 Role: ADMIN

- `DELETE /api/certificate-templates/:id`
- `DELETE /api/checklist-templates/:id`
- `DELETE /api/clients/:id`
- `DELETE /api/contact/:id`
- `DELETE /api/documents/:id`
- `DELETE /api/users/:id`
- `DELETE /api/website/videos/:id`
- `GET /api/activity-requests`
- `GET /api/activity-requests/:id`
- `GET /api/certificate-templates`
- `GET /api/certificate-templates/:id`
- `GET /api/certificates`
- `GET /api/certificates/:id`
- `GET /api/certificates/:id/download`
- `GET /api/certificates/:id/history`
- `GET /api/certificates/:id/preview`
- `GET /api/certificates/:id/signature`
- `GET /api/certificates/expiring`
- `GET /api/certificates/job/:jobId`
- `GET /api/certificates/types`
- `GET /api/certificates/types/:id`
- `GET /api/certificates/vessel/:vesselId`
- `GET /api/change-requests`
- `GET /api/checklist-templates`
- `GET /api/checklist-templates/:id`
- `GET /api/checklist-templates/get-upload-url`
- `GET /api/checklist-templates/job/:jobId`
- `GET /api/clients`
- `GET /api/clients/:id`
- `GET /api/clients/:id/documents`
- `GET /api/clients/dashboard`
- `GET /api/clients/profile`
- `GET /api/clients/profile/documents`
- `GET /api/compliance/export/:id`
- `GET /api/contact`
- `GET /api/contact/:id`
- `GET /api/contact/stats`
- `GET /api/customer-feedback`
- `GET /api/customer-feedback/job/:jobId`
- `GET /api/dashboard`
- `GET /api/documents/:entityType/:entityId`
- `GET /api/documents/:id`
- `GET /api/documents/get-upload-url`
- `GET /api/flags`
- `GET /api/flags/:id`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/:id/eligible-surveyors`
- `GET /api/jobs/:id/history`
- `GET /api/jobs/:id/messages/external`
- `GET /api/jobs/:id/messages/internal`
- `GET /api/non-conformities/job/:jobId`
- `GET /api/payments`
- `GET /api/payments/:id`
- `GET /api/payments/:id/ledger`
- `GET /api/payments/summary`
- `GET /api/reports/certificates`
- `GET /api/reports/financials`
- `GET /api/reports/non-conformities`
- `GET /api/reports/surveyors`
- `GET /api/surveyors`
- `GET /api/surveyors/:id/location-history`
- `GET /api/surveyors/:id/profile`
- `GET /api/surveyors/applications`
- `GET /api/surveys`
- `GET /api/surveys/jobs/:jobId`
- `GET /api/surveys/jobs/:jobId/signed-checklist-upload-url`
- `GET /api/surveys/jobs/:jobId/timeline`
- `GET /api/system/audit-logs`
- `GET /api/system/feature-flags`
- `GET /api/system/jobs/failed`
- `GET /api/system/locales`
- `GET /api/system/metrics`
- `GET /api/system/migrations`
- `GET /api/toca`
- `GET /api/users`
- `GET /api/vessels`
- `GET /api/vessels/:id`
- `GET /api/vessels/client/:clientId`
- `PATCH /api/contact/:id/status`
- `POST /api/activity-requests`
- `POST /api/approvals`
- `POST /api/certificate-templates`
- `POST /api/certificates`
- `POST /api/certificates/:id/extend`
- `POST /api/certificates/:id/reissue`
- `POST /api/certificates/:id/sign`
- `POST /api/certificates/:id/transfer`
- `POST /api/certificates/bulk-renew`
- `POST /api/certificates/types`
- `POST /api/change-requests`
- `POST /api/checklist-templates`
- `POST /api/checklist-templates/:id/clone`
- `POST /api/clients`
- `POST /api/compliance/anonymize/:id`
- `POST /api/customer-feedback`
- `POST /api/documents/:entityType/:entityId`
- `POST /api/documents/:entityType/:entityId/register`
- `POST /api/documents/register`
- `POST /api/documents/upload`
- `POST /api/flags`
- `POST /api/incidents`
- `POST /api/jobs`
- `POST /api/jobs/:id/messages`
- `POST /api/jobs/:id/notes`
- `POST /api/non-conformities`
- `POST /api/payments/:id/partial`
- `POST /api/payments/:id/refund`
- `POST /api/payments/invoice`
- `POST /api/payments/writeoff`
- `POST /api/surveyors`
- `POST /api/surveyors/availability`
- `POST /api/surveyors/location`
- `POST /api/surveys`
- `POST /api/surveys/jobs/:jobId/location`
- `POST /api/surveys/jobs/:jobId/proof`
- `POST /api/surveys/jobs/:jobId/statement/draft`
- `POST /api/surveys/jobs/:jobId/statement/issue`
- `POST /api/surveys/jobs/:jobId/sync`
- `POST /api/surveys/jobs/:jobId/violation`
- `POST /api/surveys/start`
- `POST /api/system/jobs/:id/retry`
- `POST /api/system/maintenance/:action`
- `POST /api/system/users/:id/logout`
- `POST /api/toca`
- `POST /api/users`
- `POST /api/vessels`
- `POST /api/website/videos`
- `PUT /api/activity-requests/:id/status`
- `PUT /api/approvals/:id/step`
- `PUT /api/certificate-templates/:id`
- `PUT /api/certificates/:id/downgrade`
- `PUT /api/certificates/:id/renew`
- `PUT /api/certificates/:id/restore`
- `PUT /api/certificates/:id/revoke`
- `PUT /api/certificates/:id/suspend`
- `PUT /api/certificates/types/:id`
- `PUT /api/change-requests/:id/approve`
- `PUT /api/change-requests/:id/reject`
- `PUT /api/checklist-templates/:id`
- `PUT /api/checklist-templates/:id/activate`
- `PUT /api/checklists/jobs/:jobId`
- `PUT /api/clients/:id`
- `PUT /api/clients/profile`
- `PUT /api/flags/:id`
- `PUT /api/incidents/:id/status`
- `PUT /api/jobs/:id/approve-request`
- `PUT /api/jobs/:id/assign`
- `PUT /api/jobs/:id/authorize-survey`
- `PUT /api/jobs/:id/cancel`
- `PUT /api/jobs/:id/finalize`
- `PUT /api/jobs/:id/priority`
- `PUT /api/jobs/:id/reassign`
- `PUT /api/jobs/:id/reject`
- `PUT /api/jobs/:id/reschedule`
- `PUT /api/jobs/:id/review`
- `PUT /api/jobs/:id/send-back`
- `PUT /api/jobs/:id/verify-documents`
- `PUT /api/non-conformities/:id/close`
- `PUT /api/payments/:id/pay`
- `PUT /api/support/:id`
- `PUT /api/support/:id/status`
- `PUT /api/surveyors/:id/profile`
- `PUT /api/surveyors/:id/status`
- `PUT /api/surveyors/applications/:id/review`
- `PUT /api/surveys/jobs/:jobId/finalize`
- `PUT /api/surveys/jobs/:jobId/rework`
- `PUT /api/toca/:id/status`
- `PUT /api/users/:id`
- `PUT /api/users/:id/status`
- `PUT /api/vessels/:id`
- `PUT /api/website/videos/:id`

## 👤 Role: GM

## 👤 Role: TM

## 👤 Role: TO

## 👤 Role: TA

## 👤 Role: SURVEYOR

- `PUT /api/surveys/jobs/:jobId/signed-checklist`

## 👤 Role: CLIENT

## 👤 Role: FLAG_ADMIN
