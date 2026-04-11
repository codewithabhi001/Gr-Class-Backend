# 🛰️ Girik Backend - API Endpoints for TM

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

