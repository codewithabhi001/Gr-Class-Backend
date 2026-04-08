# 27 — System Administration APIs

**Base URL:** `/api/v1/system`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/system/health`

> **Access:** Any authenticated user

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/system/readiness`

> **Access:** Any authenticated user  
> Checks database and component status.

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "READY",
    "components": {
      "database": { "status": "CONNECTED" },
      "uptime": 123456,
      "memory": { "used": "256MB", "total": "1024MB" }
    }
  }
}
```

### Response `503 Service Unavailable`
```json
{
  "success": false,
  "message": "NOT_READY",
  "error": "DB Down"
}
```

---

## 3. GET `/api/v1/system/version`

> **Access:** Any authenticated user

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "version": "1.5.0",
    "build": "2026-03-05",
    "environment": "production"
  }
}
```

---

## 4. GET `/api/v1/system/metrics`

> **Access:** `ADMIN` only

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "uptime": 123456,
    "database": { "status": "CONNECTED", "pool_size": 10, "active_connections": 3 },
    "memory": { "rss": "256MB", "heapTotal": "180MB", "heapUsed": "120MB" },
    "cpu": { "user": 1234, "system": 567 }
  }
}
```

---

## 5. GET `/api/v1/system/audit-logs`

> **Access:** `ADMIN` only

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page (default 50) |
| `entity_type` | string | optional | `JOB`, `SURVEY`, `CERTIFICATE`, `USER`, etc. |
| `user_id` | UUID | optional | Filter by user |
| `action` | string | optional | e.g. `UPDATE_STATUS`, `CREATE`, `DELETE` |
| `from_date` | string | optional | — |
| `to_date` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "action": "UPDATE_STATUS",
        "entity_type": "JOB",
        "entity_id": "uuid",
        "old_value": "CREATED",
        "new_value": "DOCUMENT_VERIFIED",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-03-05T19:10:00.000Z",
        "User": { "name": "TO User", "role": "TO" }
      }
    ],
    "count": 500
  }
}
```

---

## 6. POST `/api/v1/system/users/:id/logout`

> **Access:** `ADMIN` only  
> Force logout a specific user.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "message": "User session invalidated"
  }
}
```

---

## 7. GET `/api/v1/system/jobs/failed`

> **Access:** `ADMIN` only  
> Get failed background jobs/tasks.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "EMAIL_NOTIFICATION",
      "error": "SMTP connection timeout",
      "failed_at": "2026-03-05T17:00:00.000Z",
      "retry_count": 3
    }
  ]
}
```

---

## 8. POST `/api/v1/system/jobs/:id/retry`

> **Access:** `ADMIN` only  
> Retry a failed background job.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "RETRYING" }
}
```

---

## 9. POST `/api/v1/system/maintenance/:action`

> **Access:** `ADMIN` only  
> Enable/disable maintenance mode.

### Path Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | ✅ | `enable` or `disable` |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "maintenance_mode": true, "performed_by": "admin@grclass.com" }
}
```

---

## 10. GET `/api/v1/system/feature-flags`

> **Access:** `ADMIN` only

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "flags": {
      "NEW_UI": true,
      "BETA_REPORTS": false
    }
  }
}
```

---

## 11. GET `/api/v1/system/migrations`

> **Access:** `ADMIN` only

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    { "name": "20260101-create-users", "status": "completed" },
    { "name": "20260102-create-vessels", "status": "completed" }
  ]
}
```

---

## 12. GET `/api/v1/system/locales`

> **Access:** `ADMIN` only

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    { "code": "en", "name": "English", "active": true },
    { "code": "ar", "name": "Arabic", "active": true }
  ]
}
```
