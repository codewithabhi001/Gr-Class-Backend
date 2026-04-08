# 07 — Survey Workflow APIs

**Base URL:** `/api/v1/surveys`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

## Survey Status Flow
```
NOT_STARTED → STARTED → CHECKLIST_SUBMITTED → PROOF_UPLOADED → SUBMITTED → FINALIZED
                                                                    ↓
                                                            REWORK_REQUIRED → (re-submit)
```

---

## 1. POST `/api/v1/surveys/start`

> **Access:** `SURVEYOR` only  
> Start a survey (check-in with GPS). Job must be in `SURVEY_AUTHORIZED` or `IN_PROGRESS` status.

### Request Body
```json
{
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "latitude": 25.2048,
  "longitude": 55.2708
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | Must reference job assigned to this surveyor |
| `latitude` | number | ✅ | GPS latitude |
| `longitude` | number | ✅ | GPS longitude |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Survey started successfully.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000200",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
    "survey_status": "STARTED",
    "start_latitude": 25.2048,
    "start_longitude": 55.2708,
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": null,
    "submit_latitude": null,
    "submit_longitude": null,
    "attendance_photo_url": null,
    "signature_url": null,
    "evidence_proof_url": null,
    "survey_statement": null,
    "submission_count": 0,
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. POST `/api/v1/surveys/jobs/:jobId/proof`

> **Access:** `SURVEYOR` only  
> Upload evidence proof for a survey.  
> **Content-Type:** `multipart/form-data`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `proof` | file | ✅ (or use `fileKey`) | Evidence photo/document |
| `fileKey` | string | ✅ (or use `proof`) | Pre-uploaded file key (from pre-signed URL) |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Proof uploaded successfully.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000200",
    "survey_status": "PROOF_UPLOADED",
    "evidence_proof_url": "https://storage.grclass.com/surveys/proof-001.jpg",
    "updated_at": "2026-03-05T18:30:00.000Z"
  }
}
```

---

## 3. POST `/api/v1/surveys/jobs/:jobId/location`

> **Access:** `SURVEYOR` only  
> Report current GPS location during survey.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body
```json
{
  "latitude": 25.2048,
  "longitude": 55.2708
}
```

| Field | Type | Required |
|-------|------|----------|
| `latitude` | number | ✅ |
| `longitude` | number | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Location recorded.",
  "data": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "recorded_at": "2026-03-05T18:35:00.000Z"
  }
}
```

---

## 4. POST `/api/v1/surveys/jobs/:jobId/statement/draft`

> **Access:** `SURVEYOR`, `TM`  
> Save a draft survey statement.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body
```json
{
  "survey_statement": "The vessel MV Star was inspected at Dubai Port on 5th March 2026. All safety equipment was found in satisfactory condition. Fire detection systems operational. Life-saving appliances properly maintained."
}
```

| Field | Type | Required |
|-------|------|----------|
| `survey_statement` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "survey_statement": "The vessel MV Star was inspected..."
  }
}
```

---

## 5. POST `/api/v1/surveys`

> **Access:** `SURVEYOR` only  
> Submit final survey report (check-out).  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_id` | string (UUID) | ✅ | The job ID |
| `submit_latitude` | number | ✅ | Check-out GPS latitude |
| `submit_longitude` | number | ✅ | Check-out GPS longitude |
| `photoKey` | string | ✅ | Pre-uploaded attendance photo key |
| `signatureKey` | string | ✅ | Pre-uploaded digital signature key |
| `survey_statement` | string | optional | Final survey statement text |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Survey report submitted successfully.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000200",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
    "survey_status": "SUBMITTED",
    "start_latitude": 25.2048,
    "start_longitude": 55.2708,
    "submit_latitude": 25.2050,
    "submit_longitude": 55.2710,
    "attendance_photo_url": "https://storage.grclass.com/surveys/photo.jpg",
    "signature_url": "https://storage.grclass.com/surveys/signature.png",
    "evidence_proof_url": "https://storage.grclass.com/surveys/proof.jpg",
    "survey_statement": "The vessel was inspected...",
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": "2026-03-05T20:00:00.000Z",
    "submission_count": 1,
    "updated_at": "2026-03-05T20:00:00.000Z"
  }
}
```

---

## 6. PUT `/api/v1/surveys/jobs/:jobId/finalize`

> **Access:** `TM` only  
> Finalize a survey (also finalizes the parent job).

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body
None required

### Response `200 OK`
```json
{
  "success": true,
  "message": "Survey finalized. Job is now FINALIZED.",
  "data": {
    "id": "uuid",
    "survey_status": "FINALIZED",
    "finalized_at": "2026-03-05T21:00:00.000Z"
  }
}
```

---

## 7. PUT `/api/v1/surveys/jobs/:jobId/rework`

> **Access:** `GM`, `TM`  
> Request rework on a submitted survey.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body
```json
{
  "reason": "Checklist items incomplete — missing evidence for fire equipment inspection"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Rework requested.",
  "data": {
    "id": "uuid",
    "survey_status": "REWORK_REQUIRED",
    "updated_at": "2026-03-05T21:05:00.000Z"
  }
}
```

---

## 8. POST `/api/v1/surveys/jobs/:jobId/violation`

> **Access:** `ADMIN`, `TM`  
> Record a violation found during survey review.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body
```json
{
  "description": "Missing safety equipment on starboard deck",
  "severity": "MAJOR"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `description` | string | ✅ | — |
| `severity` | string | ✅ | `MINOR`, `MAJOR`, `CRITICAL` |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "description": "Missing safety equipment on starboard deck",
    "severity": "MAJOR",
    "status": "OPEN",
    "created_at": "2026-03-05T21:10:00.000Z"
  }
}
```

---

## 9. POST `/api/v1/surveys/jobs/:jobId/statement/issue`

> **Access:** `TM` only  
> Issue the official survey statement (PDF upload).  
> **Content-Type:** `multipart/form-data`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `statement` | file (PDF) | ✅ | The official survey statement PDF |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "statement_url": "https://storage.grclass.com/statements/stmt-001.pdf"
  }
}
```

---

## 10. GET `/api/v1/surveys`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`  
> List all surveys.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `status` | string | optional | Filter by survey_status |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "019514a2-7e3b-7000-8000-000000000200",
      "job_id": "019514a2-7e3b-7000-8000-000000000100",
      "surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
      "survey_status": "SUBMITTED",
      "started_at": "2026-03-05T18:00:00.000Z",
      "submitted_at": "2026-03-05T20:00:00.000Z",
      "submission_count": 1,
      "JobRequest": {
        "id": "uuid",
        "reason": "Annual survey",
        "Vessel": { "vessel_name": "MV Star" }
      },
      "Surveyor": { "name": "John Surveyor" }
    }
  ]
}
```

---

## 11. GET `/api/v1/surveys/jobs/:jobId`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> Get survey details for a specific job.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000200",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
    "survey_status": "SUBMITTED",
    "start_latitude": 25.2048,
    "start_longitude": 55.2708,
    "submit_latitude": 25.2050,
    "submit_longitude": 55.2710,
    "attendance_photo_url": "https://storage.grclass.com/surveys/photo.jpg",
    "signature_url": "https://storage.grclass.com/surveys/signature.png",
    "evidence_proof_url": "https://storage.grclass.com/surveys/proof.jpg",
    "survey_statement": "The vessel MV Star was inspected...",
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": "2026-03-05T20:00:00.000Z",
    "submission_count": 1,
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T20:00:00.000Z"
  }
}
```

---

## 12. GET `/api/v1/surveys/jobs/:jobId/timeline`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> Get timeline of survey events (status transitions, uploads, etc.).

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "event": "SURVEY_STARTED",
      "timestamp": "2026-03-05T18:00:00.000Z",
      "user": "John Surveyor",
      "details": { "latitude": 25.2048, "longitude": 55.2708 }
    },
    {
      "event": "CHECKLIST_SUBMITTED",
      "timestamp": "2026-03-05T19:00:00.000Z",
      "user": "John Surveyor",
      "details": { "items_count": 15 }
    },
    {
      "event": "PROOF_UPLOADED",
      "timestamp": "2026-03-05T19:30:00.000Z",
      "user": "John Surveyor"
    },
    {
      "event": "SURVEY_SUBMITTED",
      "timestamp": "2026-03-05T20:00:00.000Z",
      "user": "John Surveyor",
      "details": { "latitude": 25.2050, "longitude": 55.2710 }
    }
  ]
}
```
