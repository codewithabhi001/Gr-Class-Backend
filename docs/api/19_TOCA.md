# 19 — TOCA (Transfer of Class Authority) APIs

**Base URL:** `/api/v1/toca`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/toca`

> **Access:** `TM`  
> Create a Transfer of Class request.

### Request Body
```json
{
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "losing_class_society": "Bureau Veritas",
  "gaining_class_society": "Lloyd's Register",
  "request_date": "2026-03-05"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vessel_id` | UUID | ✅ | Must reference existing vessel |
| `losing_class_society` | string | ✅ | Current class society |
| `gaining_class_society` | string | ✅ | New class society |
| `request_date` | string (YYYY-MM-DD) | ✅ | Date of TOCA request |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000800",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "losing_class_society": "Bureau Veritas",
    "gaining_class_society": "Lloyd's Register",
    "request_date": "2026-03-05",
    "status": "PENDING",
    "documents_url": [],
    "decision_date": null
  }
}
```

---

## 2. PUT `/api/v1/toca/:id/status`

> **Access:** `TM`, `ADMIN`  
> Accept or reject a TOCA request.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "ACCEPTED"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `ACCEPTED` or `REJECTED` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACCEPTED",
    "decision_date": "2026-03-06"
  }
}
```

---

## 3. GET `/api/v1/toca`

> **Access:** `ADMIN`, `GM`, `TM`

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | optional | `PENDING`, `ACCEPTED`, `REJECTED` |
| `vessel_id` | UUID | optional | Filter by vessel |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "vessel_id": "uuid",
      "losing_class_society": "Bureau Veritas",
      "gaining_class_society": "Lloyd's Register",
      "request_date": "2026-03-05",
      "status": "PENDING",
      "decision_date": null,
      "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" }
    }
  ]
}
```
