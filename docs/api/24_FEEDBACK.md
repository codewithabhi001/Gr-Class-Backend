# 24 — Customer Feedback APIs

**Base URL:** `/api/v1/customer-feedback`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/customer-feedback`

> **Access:** `CLIENT` only  
> Submit feedback for a completed job.

### Request Body
```json
{
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "rating": 5,
  "timeliness": 4,
  "professionalism": 5,
  "documentation": 4,
  "remarks": "Excellent service! The surveyor was very thorough and professional. The entire process was smooth and completed ahead of schedule."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | Must reference an existing job |
| `rating` | integer | ✅ | 1–5 (overall rating) |
| `timeliness` | integer | ✅ | 1–5 |
| `professionalism` | integer | ✅ | 1–5 |
| `documentation` | integer | ✅ | 1–5 |
| `remarks` | string | optional | Free-text comments |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000001200",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "client_id": "019514a2-7e3b-7000-8000-000000000060",
    "rating": 5,
    "timeliness": 4,
    "professionalism": 5,
    "documentation": 4,
    "remarks": "Excellent service!...",
    "submitted_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/customer-feedback`

> **Access:** `ADMIN`, `GM`

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | — |
| `limit` | number | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid",
        "job_id": "uuid",
        "client_id": "uuid",
        "rating": 5,
        "timeliness": 4,
        "professionalism": 5,
        "documentation": 4,
        "remarks": "Excellent service!",
        "submitted_at": "2026-03-05T18:00:00.000Z",
        "JobRequest": { "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } },
        "Client": { "name": "Ahmed Ali" }
      }
    ],
    "count": 20
  }
}
```

---

## 3. GET `/api/v1/customer-feedback/job/:jobId`

> **Access:** `ADMIN`, `GM`, `CLIENT`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "rating": 5,
    "timeliness": 4,
    "professionalism": 5,
    "documentation": 4,
    "remarks": "Excellent service!"
  }
}
```
