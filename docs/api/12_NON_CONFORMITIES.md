# 12 — Non-Conformity APIs

**Base URL:** `/api/v1/non-conformities`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/non-conformities`

> **Access:** `SURVEYOR`, `TO`  
> Create a non-conformity record for a job.

### Request Body
```json
{
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "description": "Fire extinguisher on port side deck expired — last serviced 2024-06-01",
  "severity": "MAJOR"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | Must reference existing job |
| `description` | string | ✅ | Detailed description of the non-conformity |
| `severity` | string | ✅ | `MINOR`, `MAJOR`, `CRITICAL` |

### Response `201 Created`
```json
{
  "id": "019514a2-7e3b-7000-8000-000000000500",
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "description": "Fire extinguisher on port side deck expired — last serviced 2024-06-01",
  "severity": "MAJOR",
  "status": "OPEN",
  "closure_remarks": null,
  "closed_at": null
}
```

---

## 2. PUT `/api/v1/non-conformities/:id/close`

> **Access:** `TO`, `TM`  
> Close a non-conformity with resolution remarks.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "closure_remarks": "Corrective action verified — new fire extinguisher installed and inspected on 2026-03-06"
}
```

| Field | Type | Required |
|-------|------|----------|
| `closure_remarks` | string | ✅ |

### Response `200 OK`
```json
{
  "id": "019514a2-7e3b-7000-8000-000000000500",
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "description": "Fire extinguisher on port side deck expired...",
  "severity": "MAJOR",
  "status": "CLOSED",
  "closure_remarks": "Corrective action verified — new fire extinguisher installed...",
  "closed_at": "2026-03-06T10:00:00.000Z"
}
```

---

## 3. GET `/api/v1/non-conformities/job/:jobId`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> List all non-conformities for a specific job.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Response `200 OK`
```json
[
  {
    "id": "uuid",
    "job_id": "uuid",
    "description": "Fire extinguisher expired",
    "severity": "MAJOR",
    "status": "OPEN",
    "closure_remarks": null
  },
  {
    "id": "uuid",
    "job_id": "uuid",
    "description": "Navigation light not working",
    "severity": "MINOR",
    "status": "CLOSED",
    "closure_remarks": "Replaced and tested",
    "closed_at": "2026-03-06T10:00:00.000Z"
  }
]
```
