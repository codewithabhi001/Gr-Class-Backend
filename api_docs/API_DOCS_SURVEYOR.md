# 🛰️ Girik Backend - API Endpoints for SURVEYOR

Base Path: `/api/v1`

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

