# 17 — Support Ticket APIs

**Base URL:** `/api/v1/support`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/support`

> **Access:** Any authenticated user  
> Create a support ticket.

### Request Body
```json
{
  "subject": "Cannot upload vessel documents",
  "description": "Getting a 500 Internal Server Error when trying to upload PDF documents for vessel MV Star. The file size is 2MB.",
  "priority": "HIGH",
  "category": "Technical"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `subject` | string | ✅ | — |
| `description` | string | ✅ | (or `message` field) |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` (default `MEDIUM`) |
| `category` | string | optional | e.g. `Technical`, `Billing`, `General` |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000700",
    "user_id": "019514a2-7e3b-7000-8000-000000000001",
    "subject": "Cannot upload vessel documents",
    "description": "Getting a 500 Internal Server Error...",
    "status": "OPEN",
    "priority": "HIGH",
    "category": "Technical",
    "resolved_at": null,
    "resolved_by": null,
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/support`

> **Access:** Any authenticated user  
> Users see their own tickets. ADMIN/GM see all tickets.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | — |
| `limit` | number | optional | — |
| `status` | string | optional | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "subject": "Cannot upload vessel documents",
        "description": "Getting a 500 Internal Server Error...",
        "status": "OPEN",
        "priority": "HIGH",
        "category": "Technical",
        "created_at": "2026-03-05T18:00:00.000Z",
        "Creator": { "name": "Admin User", "email": "admin@girik.com" }
      }
    ],
    "count": 10
  }
}
```

---

## 3. GET `/api/v1/support/:id`

> **Access:** Any authenticated user (own tickets) / ADMIN, GM (any ticket)

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "subject": "Cannot upload vessel documents",
    "description": "Getting a 500 Internal Server Error...",
    "status": "OPEN",
    "priority": "HIGH",
    "category": "Technical",
    "resolved_at": null,
    "resolved_by": null,
    "created_at": "2026-03-05T18:00:00.000Z",
    "Creator": { "name": "Admin User", "email": "admin@girik.com" },
    "Resolver": null
  }
}
```

---

## 4. PUT `/api/v1/support/:id/status`

> **Access:** `ADMIN`, `GM`  
> Update ticket status.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "RESOLVED",
  "internal_note": "Fixed the upload issue — S3 bucket permission was misconfigured"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `internal_note` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "RESOLVED",
    "resolved_at": "2026-03-06T10:00:00.000Z",
    "resolved_by": "uuid"
  }
}
```

---

## 5. PUT `/api/v1/support/:id`

> **Access:** `ADMIN`, `GM`  
> Full update (status + details).

### Request Body
Same as status update + any additional fields.

### Response `200 OK`
Same as above.
