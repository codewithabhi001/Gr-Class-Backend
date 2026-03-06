# 14 — Notification APIs

**Base URL:** `/api/v1/notifications`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/notifications`

> **Access:** Any authenticated user (returns own notifications)

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "019514a2-7e3b-7000-8000-000000000600",
      "user_id": "019514a2-7e3b-7000-8000-000000000002",
      "title": "New Job Assigned",
      "message": "You have been assigned to job #JOB-2026-042 for vessel MV Star at Dubai Port.",
      "type": "INFO",
      "is_read": false,
      "created_at": "2026-03-05T18:00:00.000Z"
    },
    {
      "id": "019514a2-7e3b-7000-8000-000000000601",
      "user_id": "019514a2-7e3b-7000-8000-000000000002",
      "title": "Survey Authorization",
      "message": "Survey for job #JOB-2026-042 has been authorized. You may begin field work.",
      "type": "INFO",
      "is_read": true,
      "created_at": "2026-03-05T17:00:00.000Z"
    },
    {
      "id": "019514a2-7e3b-7000-8000-000000000602",
      "user_id": "019514a2-7e3b-7000-8000-000000000002",
      "title": "Certificate Expiring Soon",
      "message": "The Safety Management Certificate for MV Star expires in 30 days.",
      "type": "WARNING",
      "is_read": false,
      "created_at": "2026-03-05T16:00:00.000Z"
    }
  ]
}
```

---

## 2. PUT `/api/v1/notifications/:id/read`

> **Access:** Any authenticated user (own notifications only)

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000600",
    "is_read": true
  }
}
```

---

## 3. PUT `/api/v1/notifications/read-all`

> **Access:** Any authenticated user (marks all own notifications as read)

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "updated": 5
  }
}
```
