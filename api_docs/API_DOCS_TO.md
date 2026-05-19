# 🛰️ GR-Class Backend - API Endpoints for TO

Base Path: `/api/v1`

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

