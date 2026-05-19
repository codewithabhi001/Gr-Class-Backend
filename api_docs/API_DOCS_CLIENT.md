# 🛰️ GR-Class Backend - API Endpoints for CLIENT

Base Path: `/api/v1`

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

