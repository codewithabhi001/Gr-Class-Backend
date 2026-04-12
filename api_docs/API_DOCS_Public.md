# 🛰️ GR-Class Backend - API Endpoints for Public

Base Path: `/api/v1`

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

