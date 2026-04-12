# 🛰️ GR-Class Backend - API Endpoints by Role

Base Path: `/api/v1`

## 👤 Role: ...RBAC.AUTHORIZE_SURVEY
### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `PUT` | `/api/v1/jobs/:id/authorize-survey` |

---

## 👤 Role: ADMIN
### 📦 Module: Activity-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/activity-requests/:id` |
| `GET` | `/api/v1/activity-requests` |
| `POST` | `/api/v1/activity-requests` |
| `PUT` | `/api/v1/activity-requests/:id/status` |

### 📦 Module: Approvals
| Method | Full Endpoint URL |
| :--- | :--- |
| `POST` | `/api/v1/approvals` |
| `PUT` | `/api/v1/approvals/:id/step` |

### 📦 Module: Certificate-templates
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/certificate-templates/:id` |
| `GET` | `/api/v1/certificate-templates/:id` |
| `GET` | `/api/v1/certificate-templates` |
| `POST` | `/api/v1/certificate-templates` |
| `PUT` | `/api/v1/certificate-templates/:id` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/expiring` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |
| `POST` | `/api/v1/certificates/:id/extend` |
| `POST` | `/api/v1/certificates/:id/reissue` |
| `POST` | `/api/v1/certificates/:id/sign` |
| `POST` | `/api/v1/certificates/:id/transfer` |
| `POST` | `/api/v1/certificates/bulk-renew` |
| `POST` | `/api/v1/certificates/types` |
| `POST` | `/api/v1/certificates` |
| `PUT` | `/api/v1/certificates/:id/downgrade` |
| `PUT` | `/api/v1/certificates/:id/renew` |
| `PUT` | `/api/v1/certificates/:id/restore` |
| `PUT` | `/api/v1/certificates/:id/revoke` |
| `PUT` | `/api/v1/certificates/:id/suspend` |
| `PUT` | `/api/v1/certificates/types/:id` |

### 📦 Module: Change-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/change-requests` |
| `POST` | `/api/v1/change-requests` |
| `PUT` | `/api/v1/change-requests/:id/approve` |
| `PUT` | `/api/v1/change-requests/:id/reject` |

### 📦 Module: Clients
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/clients/:id` |
| `GET` | `/api/v1/clients/:id/documents` |
| `GET` | `/api/v1/clients/:id` |
| `GET` | `/api/v1/clients` |
| `POST` | `/api/v1/clients` |
| `PUT` | `/api/v1/clients/:id` |

### 📦 Module: Customer-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/customer-feedback/job/:jobId` |
| `GET` | `/api/v1/customer-feedback` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/get-upload-url` |
| `POST` | `/api/v1/documents/:entityType/:entityId/register` |
| `POST` | `/api/v1/documents/:entityType/:entityId` |
| `POST` | `/api/v1/documents/register` |
| `POST` | `/api/v1/documents/upload` |

### 📦 Module: Flags
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/flags/:id` |
| `GET` | `/api/v1/flags` |
| `POST` | `/api/v1/flags` |
| `PUT` | `/api/v1/flags/:id` |

### 📦 Module: Incidents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/incidents/:id` |
| `GET` | `/api/v1/incidents` |
| `POST` | `/api/v1/incidents` |
| `PUT` | `/api/v1/incidents/:id/status` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/eligible-surveyors` |
| `GET` | `/api/v1/jobs/:id/history` |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id/messages/internal` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |
| `POST` | `/api/v1/jobs/:id/notes` |
| `POST` | `/api/v1/jobs` |
| `PUT` | `/api/v1/jobs/:id/approve-request` |
| `PUT` | `/api/v1/jobs/:id/assign` |
| `PUT` | `/api/v1/jobs/:id/cancel` |
| `PUT` | `/api/v1/jobs/:id/finalize` |
| `PUT` | `/api/v1/jobs/:id/priority` |
| `PUT` | `/api/v1/jobs/:id/reassign` |
| `PUT` | `/api/v1/jobs/:id/reject` |
| `PUT` | `/api/v1/jobs/:id/reschedule` |
| `PUT` | `/api/v1/jobs/:id/review` |
| `PUT` | `/api/v1/jobs/:id/send-back` |
| `PUT` | `/api/v1/jobs/:id/verify-documents` |

### 📦 Module: Non-conformities
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/non-conformities/job/:jobId` |

### 📦 Module: Payments
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/payments/:id/ledger` |
| `GET` | `/api/v1/payments/:id` |
| `GET` | `/api/v1/payments/summary` |
| `GET` | `/api/v1/payments` |
| `POST` | `/api/v1/payments/:id/partial` |
| `POST` | `/api/v1/payments/:id/refund` |
| `POST` | `/api/v1/payments/invoice` |
| `POST` | `/api/v1/payments/writeoff` |
| `PUT` | `/api/v1/payments/:id/pay` |

### 📦 Module: Portfolio-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/portfolio-feedback` |
| `PATCH` | `/api/v1/portfolio-feedback/:id/visibility` |

### 📦 Module: Surveyors
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/surveyors/:id/location-history` |
| `GET` | `/api/v1/surveyors/:id/profile` |
| `GET` | `/api/v1/surveyors/applications` |
| `GET` | `/api/v1/surveyors` |
| `POST` | `/api/v1/surveyors` |
| `PUT` | `/api/v1/surveyors/:id/profile` |
| `PUT` | `/api/v1/surveyors/:id/status` |
| `PUT` | `/api/v1/surveyors/applications/:id/review` |

### 📦 Module: System
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/system/audit-logs` |
| `GET` | `/api/v1/system/feature-flags` |
| `GET` | `/api/v1/system/jobs/failed` |
| `GET` | `/api/v1/system/locales` |
| `GET` | `/api/v1/system/metrics` |
| `GET` | `/api/v1/system/migrations` |
| `POST` | `/api/v1/system/jobs/:id/retry` |
| `POST` | `/api/v1/system/maintenance/:action` |
| `POST` | `/api/v1/system/users/:id/logout` |

### 📦 Module: Toca
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/toca` |
| `PUT` | `/api/v1/toca/:id/status` |

### 📦 Module: Users
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/users/:id` |
| `GET` | `/api/v1/users` |
| `POST` | `/api/v1/users` |
| `PUT` | `/api/v1/users/:id/status` |
| `PUT` | `/api/v1/users/:id` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |
| `GET` | `/api/v1/vessels/client/:clientId` |
| `GET` | `/api/v1/vessels` |
| `POST` | `/api/v1/vessels` |
| `PUT` | `/api/v1/vessels/:id` |

### 📦 Module: Website
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/website/videos/:id` |
| `GET` | `/api/v1/website/subscribers` |
| `POST` | `/api/v1/website/send` |
| `POST` | `/api/v1/website/videos` |
| `PUT` | `/api/v1/website/videos/:id` |

---

## 👤 Role: CLIENT
### 📦 Module: Activity-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/activity-requests/:id` |
| `GET` | `/api/v1/activity-requests` |
| `POST` | `/api/v1/activity-requests` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/expiring` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |

### 📦 Module: Change-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `POST` | `/api/v1/change-requests` |

### 📦 Module: Clients
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/clients/dashboard` |
| `GET` | `/api/v1/clients/profile/documents` |
| `GET` | `/api/v1/clients/profile` |
| `PUT` | `/api/v1/clients/profile` |

### 📦 Module: Customer-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/customer-feedback/job/:jobId` |
| `POST` | `/api/v1/customer-feedback` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/get-upload-url` |
| `POST` | `/api/v1/documents/:entityType/:entityId/register` |
| `POST` | `/api/v1/documents/:entityType/:entityId` |
| `POST` | `/api/v1/documents/register` |
| `POST` | `/api/v1/documents/upload` |

### 📦 Module: Incidents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/incidents/:id` |
| `GET` | `/api/v1/incidents` |
| `POST` | `/api/v1/incidents` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |
| `POST` | `/api/v1/jobs` |
| `PUT` | `/api/v1/jobs/:id/cancel` |

### 📦 Module: Payments
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/payments/:id` |
| `GET` | `/api/v1/payments/summary` |
| `GET` | `/api/v1/payments` |

### 📦 Module: Portfolio-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/portfolio-feedback/my-feedback` |
| `POST` | `/api/v1/portfolio-feedback` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |
| `GET` | `/api/v1/vessels` |

---

## 👤 Role: FLAG_ADMIN
### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs` |

---

## 👤 Role: GM
### 📦 Module: Activity-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/activity-requests/:id` |
| `GET` | `/api/v1/activity-requests` |
| `POST` | `/api/v1/activity-requests` |
| `PUT` | `/api/v1/activity-requests/:id/status` |

### 📦 Module: Approvals
| Method | Full Endpoint URL |
| :--- | :--- |
| `POST` | `/api/v1/approvals` |
| `PUT` | `/api/v1/approvals/:id/step` |

### 📦 Module: Certificate-templates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificate-templates/:id` |
| `GET` | `/api/v1/certificate-templates` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/expiring` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |
| `POST` | `/api/v1/certificates/:id/extend` |
| `POST` | `/api/v1/certificates/:id/sign` |
| `POST` | `/api/v1/certificates/:id/transfer` |
| `POST` | `/api/v1/certificates` |
| `PUT` | `/api/v1/certificates/:id/downgrade` |

### 📦 Module: Change-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/change-requests` |
| `POST` | `/api/v1/change-requests` |
| `PUT` | `/api/v1/change-requests/:id/approve` |
| `PUT` | `/api/v1/change-requests/:id/reject` |

### 📦 Module: Clients
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/clients/:id/documents` |
| `GET` | `/api/v1/clients/:id` |
| `GET` | `/api/v1/clients` |
| `POST` | `/api/v1/clients` |
| `PUT` | `/api/v1/clients/:id` |

### 📦 Module: Customer-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/customer-feedback/job/:jobId` |
| `GET` | `/api/v1/customer-feedback` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `DELETE` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/get-upload-url` |
| `POST` | `/api/v1/documents/:entityType/:entityId/register` |
| `POST` | `/api/v1/documents/:entityType/:entityId` |
| `POST` | `/api/v1/documents/register` |
| `POST` | `/api/v1/documents/upload` |

### 📦 Module: Flags
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/flags/:id` |
| `GET` | `/api/v1/flags` |

### 📦 Module: Incidents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/incidents/:id` |
| `GET` | `/api/v1/incidents` |
| `POST` | `/api/v1/incidents` |
| `PUT` | `/api/v1/incidents/:id/status` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/eligible-surveyors` |
| `GET` | `/api/v1/jobs/:id/history` |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id/messages/internal` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |
| `POST` | `/api/v1/jobs/:id/notes` |
| `POST` | `/api/v1/jobs` |
| `PUT` | `/api/v1/jobs/:id/approve-request` |
| `PUT` | `/api/v1/jobs/:id/assign` |
| `PUT` | `/api/v1/jobs/:id/cancel` |
| `PUT` | `/api/v1/jobs/:id/finalize` |
| `PUT` | `/api/v1/jobs/:id/priority` |
| `PUT` | `/api/v1/jobs/:id/reassign` |
| `PUT` | `/api/v1/jobs/:id/reject` |
| `PUT` | `/api/v1/jobs/:id/reschedule` |
| `PUT` | `/api/v1/jobs/:id/verify-documents` |

### 📦 Module: Non-conformities
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/non-conformities/job/:jobId` |

### 📦 Module: Payments
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/payments/:id/ledger` |
| `GET` | `/api/v1/payments/:id` |
| `GET` | `/api/v1/payments/summary` |
| `GET` | `/api/v1/payments` |
| `POST` | `/api/v1/payments/:id/partial` |
| `POST` | `/api/v1/payments/:id/refund` |
| `POST` | `/api/v1/payments/invoice` |
| `PUT` | `/api/v1/payments/:id/pay` |

### 📦 Module: Portfolio-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/portfolio-feedback` |

### 📦 Module: Surveyors
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/surveyors/:id/location-history` |
| `GET` | `/api/v1/surveyors/:id/profile` |
| `GET` | `/api/v1/surveyors` |

### 📦 Module: Toca
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/toca` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |
| `GET` | `/api/v1/vessels/client/:clientId` |
| `GET` | `/api/v1/vessels` |
| `POST` | `/api/v1/vessels` |
| `PUT` | `/api/v1/vessels/:id` |

---

## 👤 Role: Public/Authenticated
### 📦 Module: Auth
| Method | Full Endpoint URL |
| :--- | :--- |
| `POST` | `/api/v1/auth/change-password` |
| `POST` | `/api/v1/auth/forgot-password` |
| `POST` | `/api/v1/auth/login` |
| `POST` | `/api/v1/auth/logout` |
| `POST` | `/api/v1/auth/refresh-token` |
| `POST` | `/api/v1/auth/reset-password` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/verify/:number` |

### 📦 Module: Checklists
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/checklists/jobs/:jobId` |

### 📦 Module: Compliance
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/compliance/export/:id` |
| `POST` | `/api/v1/compliance/anonymize/:id` |

### 📦 Module: Notifications
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/notifications` |
| `PUT` | `/api/v1/notifications/:id/read` |
| `PUT` | `/api/v1/notifications/read-all` |

### 📦 Module: Portfolio-feedback
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/portfolio-feedback/public` |

### 📦 Module: Public
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/public/certificate/verify/:number` |
| `GET` | `/api/v1/public/vessel/:imo` |
| `GET` | `/api/v1/public/website/videos` |

### 📦 Module: Reports
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/reports/certificates` |
| `GET` | `/api/v1/reports/financials` |
| `GET` | `/api/v1/reports/non-conformities` |
| `GET` | `/api/v1/reports/surveyors` |

### 📦 Module: Search
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/search` |

### 📦 Module: Site_static
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/site_static/:slug` |
| `GET` | `/api/v1/site_static` |

### 📦 Module: Support
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/support/:id` |
| `GET` | `/api/v1/support` |
| `POST` | `/api/v1/support` |
| `PUT` | `/api/v1/support/:id/status` |
| `PUT` | `/api/v1/support/:id` |

### 📦 Module: Surveyors
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/surveyors/get-upload-url` |
| `POST` | `/api/v1/surveyors/apply` |

### 📦 Module: System
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/system/health` |
| `GET` | `/api/v1/system/readiness` |
| `GET` | `/api/v1/system/version` |

### 📦 Module: Users
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/users/me` |
| `PUT` | `/api/v1/users/fcm-token` |
| `PUT` | `/api/v1/users/profile-pic` |

### 📦 Module: Website
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/website/unsubscribe-one-click` |
| `GET` | `/api/v1/website/videos` |
| `POST` | `/api/v1/website/subscribe` |
| `POST` | `/api/v1/website/unsubscribe-one-click` |
| `POST` | `/api/v1/website/unsubscribe` |

---

## 👤 Role: SURVEYOR
### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |

### 📦 Module: Checklists
| Method | Full Endpoint URL |
| :--- | :--- |
| `PUT` | `/api/v1/checklists/jobs/:jobId` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/get-upload-url` |
| `POST` | `/api/v1/documents/:entityType/:entityId/register` |
| `POST` | `/api/v1/documents/:entityType/:entityId` |
| `POST` | `/api/v1/documents/register` |
| `POST` | `/api/v1/documents/upload` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |

### 📦 Module: Non-conformities
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/non-conformities/job/:jobId` |
| `POST` | `/api/v1/non-conformities` |

### 📦 Module: Surveyors
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/surveyors/:id/profile` |
| `POST` | `/api/v1/surveyors/availability` |
| `POST` | `/api/v1/surveyors/location` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |

---

## 👤 Role: TA
### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs` |

### 📦 Module: Payments
| Method | Full Endpoint URL |
| :--- | :--- |
| `PUT` | `/api/v1/payments/:id/pay` |

---

## 👤 Role: TM
### 📦 Module: Activity-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/activity-requests/:id` |
| `GET` | `/api/v1/activity-requests` |
| `POST` | `/api/v1/activity-requests` |
| `PUT` | `/api/v1/activity-requests/:id/status` |

### 📦 Module: Approvals
| Method | Full Endpoint URL |
| :--- | :--- |
| `POST` | `/api/v1/approvals` |
| `PUT` | `/api/v1/approvals/:id/step` |

### 📦 Module: Certificate-templates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificate-templates/:id` |
| `GET` | `/api/v1/certificate-templates` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/expiring` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |
| `POST` | `/api/v1/certificates/:id/reissue` |
| `POST` | `/api/v1/certificates/bulk-renew` |
| `POST` | `/api/v1/certificates` |
| `PUT` | `/api/v1/certificates/:id/renew` |
| `PUT` | `/api/v1/certificates/:id/restore` |
| `PUT` | `/api/v1/certificates/:id/revoke` |
| `PUT` | `/api/v1/certificates/:id/suspend` |
| `PUT` | `/api/v1/certificates/types/:id` |

### 📦 Module: Change-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/change-requests` |
| `POST` | `/api/v1/change-requests` |

### 📦 Module: Clients
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/clients/:id/documents` |
| `GET` | `/api/v1/clients/:id` |
| `GET` | `/api/v1/clients` |
| `POST` | `/api/v1/clients` |
| `PUT` | `/api/v1/clients/:id` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |
| `GET` | `/api/v1/documents/get-upload-url` |
| `POST` | `/api/v1/documents/:entityType/:entityId/register` |
| `POST` | `/api/v1/documents/:entityType/:entityId` |
| `POST` | `/api/v1/documents/register` |
| `POST` | `/api/v1/documents/upload` |

### 📦 Module: Flags
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/flags/:id` |
| `GET` | `/api/v1/flags` |

### 📦 Module: Incidents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/incidents/:id` |
| `GET` | `/api/v1/incidents` |
| `POST` | `/api/v1/incidents` |
| `PUT` | `/api/v1/incidents/:id/status` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/eligible-surveyors` |
| `GET` | `/api/v1/jobs/:id/history` |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id/messages/internal` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |
| `POST` | `/api/v1/jobs/:id/notes` |
| `PUT` | `/api/v1/jobs/:id/cancel` |
| `PUT` | `/api/v1/jobs/:id/finalize` |
| `PUT` | `/api/v1/jobs/:id/priority` |
| `PUT` | `/api/v1/jobs/:id/reject` |
| `PUT` | `/api/v1/jobs/:id/send-back` |

### 📦 Module: Non-conformities
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/non-conformities/job/:jobId` |
| `PUT` | `/api/v1/non-conformities/:id/close` |

### 📦 Module: Payments
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/payments/:id` |
| `GET` | `/api/v1/payments` |
| `POST` | `/api/v1/payments/:id/partial` |
| `POST` | `/api/v1/payments/invoice` |
| `PUT` | `/api/v1/payments/:id/pay` |

### 📦 Module: Surveyors
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/surveyors/:id/location-history` |
| `GET` | `/api/v1/surveyors/:id/profile` |
| `GET` | `/api/v1/surveyors/applications` |
| `GET` | `/api/v1/surveyors` |
| `POST` | `/api/v1/surveyors` |
| `PUT` | `/api/v1/surveyors/:id/profile` |
| `PUT` | `/api/v1/surveyors/:id/status` |
| `PUT` | `/api/v1/surveyors/applications/:id/review` |

### 📦 Module: Toca
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/toca` |
| `POST` | `/api/v1/toca` |
| `PUT` | `/api/v1/toca/:id/status` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |
| `GET` | `/api/v1/vessels/client/:clientId` |
| `GET` | `/api/v1/vessels` |
| `POST` | `/api/v1/vessels` |
| `PUT` | `/api/v1/vessels/:id` |

---

## 👤 Role: TO
### 📦 Module: Activity-requests
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/activity-requests/:id` |
| `GET` | `/api/v1/activity-requests` |

### 📦 Module: Certificates
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/certificates/:id/download` |
| `GET` | `/api/v1/certificates/:id/history` |
| `GET` | `/api/v1/certificates/:id/preview` |
| `GET` | `/api/v1/certificates/:id/signature` |
| `GET` | `/api/v1/certificates/:id` |
| `GET` | `/api/v1/certificates/expiring` |
| `GET` | `/api/v1/certificates/job/:jobId` |
| `GET` | `/api/v1/certificates/types/:id` |
| `GET` | `/api/v1/certificates/types` |
| `GET` | `/api/v1/certificates/vessel/:vesselId` |
| `GET` | `/api/v1/certificates` |

### 📦 Module: Clients
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/clients/:id/documents` |
| `GET` | `/api/v1/clients/:id` |
| `GET` | `/api/v1/clients` |

### 📦 Module: Dashboard
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/dashboard` |

### 📦 Module: Documents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/documents/:entityType/:entityId` |
| `GET` | `/api/v1/documents/:id` |

### 📦 Module: Flags
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/flags/:id` |
| `GET` | `/api/v1/flags` |

### 📦 Module: Incidents
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/incidents/:id` |
| `GET` | `/api/v1/incidents` |

### 📦 Module: Jobs
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/jobs/:id/history` |
| `GET` | `/api/v1/jobs/:id/messages/external` |
| `GET` | `/api/v1/jobs/:id/messages/internal` |
| `GET` | `/api/v1/jobs/:id` |
| `GET` | `/api/v1/jobs` |
| `POST` | `/api/v1/jobs/:id/messages` |
| `POST` | `/api/v1/jobs/:id/notes` |
| `PUT` | `/api/v1/jobs/:id/review` |
| `PUT` | `/api/v1/jobs/:id/send-back` |
| `PUT` | `/api/v1/jobs/:id/verify-documents` |

### 📦 Module: Non-conformities
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/non-conformities/job/:jobId` |
| `POST` | `/api/v1/non-conformities` |
| `PUT` | `/api/v1/non-conformities/:id/close` |

### 📦 Module: Vessels
| Method | Full Endpoint URL |
| :--- | :--- |
| `GET` | `/api/v1/vessels/:id` |
| `GET` | `/api/v1/vessels` |

---

