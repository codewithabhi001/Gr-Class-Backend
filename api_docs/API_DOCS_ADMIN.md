# 🛰️ Girik Backend - API Endpoints for ADMIN

Base Path: `/api/v1`

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

