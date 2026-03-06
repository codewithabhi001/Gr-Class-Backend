# 06 — Job Workflow APIs

**Base URL:** `/api/v1/jobs`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

## Job Status Flow
```
CREATED → DOCUMENT_VERIFIED → APPROVED → ASSIGNED → SURVEY_AUTHORIZED → IN_PROGRESS → SURVEY_DONE → REVIEWED → FINALIZED → PAYMENT_DONE → CERTIFIED
                                 ↓ (non-survey)                                                        ↓
                              FINALIZED                                                        REWORK_REQUESTED
                                                     At any point → REJECTED
```

---

## 1. POST `/api/v1/jobs`

> **Access:** `CLIENT`, `ADMIN`, `GM`  
> Create a new job request.

### Request Body
```json
{
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
  "reason": "Annual survey due for safety management certificate",
  "target_port": "Dubai Port, Jebel Ali",
  "target_date": "2026-04-15",
  "uploaded_documents": [
    {
      "required_document_id": "019514a2-7e3b-7000-8000-000000000090",
      "file_url": "https://storage.girik.com/uploads/doc1.pdf"
    }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vessel_id` | UUID | ✅ | Must reference existing vessel |
| `certificate_type_id` | UUID | ✅ | Must reference existing certificate type |
| `reason` | string | ✅ | Reason for the job request |
| `target_port` | string | ✅ | Port where survey will happen |
| `target_date` | string (ISO date) | ✅ | Target date for the survey |
| `uploaded_documents` | array | optional | Pre-uploaded required documents |
| `uploaded_documents[].required_document_id` | UUID | ✅ (if doc) | ID of the required document type |
| `uploaded_documents[].file_url` | string | ✅ (if doc) | Pre-uploaded file URL |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
    "requested_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "reason": "Annual survey due for safety management certificate",
    "target_port": "Dubai Port, Jebel Ali",
    "target_date": "2026-04-15",
    "job_status": "CREATED",
    "priority": "NORMAL",
    "is_survey_required": true,
    "assigned_surveyor_id": null,
    "assigned_by_user_id": null,
    "approved_by_user_id": null,
    "generated_certificate_id": null,
    "remarks": null,
    "reschedule_count": 0,
    "created_at": "2026-03-05T18:30:00.000Z",
    "updated_at": "2026-03-05T18:30:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/jobs`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `TA`, `FLAG_ADMIN`, `SURVEYOR`  
> List all jobs. CLIENT sees only their vessels' jobs. SURVEYOR sees only assigned jobs.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number (default 1) |
| `limit` | number | optional | Items per page (default 20) |
| `status` | string | optional | Filter by job_status |
| `priority` | string | optional | `LOW`, `NORMAL`, `HIGH`, `URGENT` |
| `vessel_id` | UUID | optional | Filter by vessel |
| `assigned_surveyor_id` | UUID | optional | Filter by surveyor |
| `sort` | string | optional | Sort field (e.g. `created_at`) |
| `order` | string | optional | `ASC` or `DESC` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000100",
        "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
        "requested_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
        "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
        "reason": "Annual survey due",
        "target_port": "Dubai Port",
        "target_date": "2026-04-15",
        "job_status": "CREATED",
        "priority": "NORMAL",
        "is_survey_required": true,
        "assigned_surveyor_id": null,
        "reschedule_count": 0,
        "created_at": "2026-03-05T18:30:00.000Z",
        "Vessel": {
          "id": "019514a2-7e3b-7000-8000-000000000005",
          "vessel_name": "MV Star",
          "imo_number": "1234567"
        },
        "CertificateType": {
          "id": "019514a2-7e3b-7000-8000-000000000020",
          "name": "Safety Management Certificate"
        },
        "requester": {
          "id": "019514a2-7e3b-7000-8000-000000000001",
          "name": "Client User"
        },
        "surveyor": null
      }
    ],
    "count": 15
  }
}
```

---

## 3. GET `/api/v1/jobs/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "requested_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
    "reason": "Annual survey due",
    "target_port": "Dubai Port",
    "target_date": "2026-04-15",
    "job_status": "ASSIGNED",
    "priority": "NORMAL",
    "is_survey_required": true,
    "assigned_surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
    "assigned_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "approved_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "generated_certificate_id": null,
    "remarks": "Approved for survey",
    "reschedule_count": 0,
    "created_at": "2026-03-05T18:30:00.000Z",
    "updated_at": "2026-03-05T19:00:00.000Z",
    "Vessel": {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "1234567",
      "Client": { "company_name": "ABC Shipping Ltd" }
    },
    "CertificateType": { "name": "Safety Management Certificate" },
    "requester": { "id": "uuid", "name": "Client User" },
    "surveyor": { "id": "uuid", "name": "John Surveyor" },
    "approver": { "id": "uuid", "name": "Admin User" },
    "survey": {
      "id": "uuid",
      "survey_status": "NOT_STARTED",
      "surveyor_id": "uuid"
    }
  }
}
```

---

## 4. PUT `/api/v1/jobs/:id/verify-documents`

> **Access:** `TO` only  
> **Transition:** `CREATED` → `DOCUMENT_VERIFIED`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
None required

### Response `200 OK`
```json
{
  "success": true,
  "message": "Documents verified by TO.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "job_status": "DOCUMENT_VERIFIED",
    "updated_at": "2026-03-05T19:10:00.000Z"
  }
}
```

---

## 5. PUT `/api/v1/jobs/:id/approve-request`

> **Access:** `ADMIN`, `GM`  
> **Transition:** `DOCUMENT_VERIFIED` → `APPROVED`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "remarks": "Approved for survey"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job approved.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "job_status": "APPROVED",
    "approved_by_user_id": "uuid",
    "remarks": "Approved for survey",
    "updated_at": "2026-03-05T19:15:00.000Z"
  }
}
```

---

## 6. PUT `/api/v1/jobs/:id/finalize`

> **Access:** `ADMIN`, `GM`, `TM`  
> **Transition:** `APPROVED` → `FINALIZED` (for non-survey jobs only)

### Request Body
```json
{
  "remarks": "Job finalized without survey"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job finalized.",
  "data": {
    "id": "uuid",
    "job_status": "FINALIZED",
    "updated_at": "2026-03-05T19:20:00.000Z"
  }
}
```

---

## 7. PUT `/api/v1/jobs/:id/assign`

> **Access:** `ADMIN`, `GM`  
> **Transition:** `APPROVED` → `ASSIGNED`

### Request Body
```json
{
  "surveyorId": "019514a2-7e3b-7000-8000-000000000002"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `surveyorId` | UUID | ✅ | Must reference a user with SURVEYOR role |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Surveyor assigned.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "job_status": "ASSIGNED",
    "assigned_surveyor_id": "019514a2-7e3b-7000-8000-000000000002",
    "assigned_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "updated_at": "2026-03-05T19:25:00.000Z"
  }
}
```

---

## 8. PUT `/api/v1/jobs/:id/reassign`

> **Access:** `GM`, `TM`  
> Re-assign surveyor (no status change).

### Request Body
```json
{
  "surveyorId": "019514a2-7e3b-7000-8000-000000000003",
  "reason": "Previous surveyor unavailable due to schedule conflict"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `surveyorId` | UUID | ✅ | New surveyor ID |
| `reason` | string | ✅ | Reason for reassignment |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Surveyor reassigned.",
  "data": {
    "id": "uuid",
    "assigned_surveyor_id": "019514a2-7e3b-7000-8000-000000000003",
    "updated_at": "2026-03-05T19:30:00.000Z"
  }
}
```

---

## 9. PUT `/api/v1/jobs/:id/reschedule`

> **Access:** `ADMIN`, `GM`  
> Reschedule a job to a new date/port.

### Request Body
```json
{
  "new_target_date": "2026-05-10",
  "new_target_port": "Mumbai Port",
  "reason": "Vessel delayed due to bad weather"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `new_target_date` | string (ISO date) | ✅ | — |
| `new_target_port` | string | ✅ | — |
| `reason` | string | ✅ | — |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job rescheduled successfully.",
  "data": {
    "id": "uuid",
    "target_date": "2026-05-10",
    "target_port": "Mumbai Port",
    "reschedule_count": 1,
    "updated_at": "2026-03-05T19:35:00.000Z"
  }
}
```

---

## 10. PUT `/api/v1/jobs/:id/authorize-survey`

> **Access:** `ADMIN`, `TM`  
> **Transition:** `ASSIGNED` → `SURVEY_AUTHORIZED`

### Request Body
```json
{
  "remarks": "Survey authorized, proceed with field work"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Survey authorized. Surveyor can now begin field work.",
  "data": {
    "id": "uuid",
    "job_status": "SURVEY_AUTHORIZED",
    "updated_at": "2026-03-05T19:40:00.000Z"
  }
}
```

---

## 11. PUT `/api/v1/jobs/:id/review`

> **Access:** `TO`  
> **Transition:** `SURVEY_DONE` → `REVIEWED`

### Request Body
```json
{
  "remarks": "Technical review complete, all items satisfactory"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job marked as reviewed.",
  "data": {
    "id": "uuid",
    "job_status": "REVIEWED",
    "updated_at": "2026-03-05T20:00:00.000Z"
  }
}
```

---

## 12. PUT `/api/v1/jobs/:id/send-back`

> **Access:** `ADMIN`, `TM`, `TO`  
> **Transition:** `SURVEY_DONE`/`REVIEWED` → `REWORK_REQUESTED`

### Request Body
```json
{
  "remarks": "Checklist items FS-003 and FS-007 need correction with evidence photos"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Rework requested. Surveyor has been notified.",
  "data": {
    "id": "uuid",
    "job_status": "REWORK_REQUESTED",
    "updated_at": "2026-03-05T20:05:00.000Z"
  }
}
```

---

## 13. PUT `/api/v1/jobs/:id/reject`

> **Access:** `ADMIN`, `GM`, `TM`  
> **Transition:** Any non-terminal status → `REJECTED`

### Request Body
```json
{
  "remarks": "Incomplete documentation, client needs to resubmit"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job rejected.",
  "data": {
    "id": "uuid",
    "job_status": "REJECTED",
    "updated_at": "2026-03-05T20:10:00.000Z"
  }
}
```

---

## 14. PUT `/api/v1/jobs/:id/cancel`

> **Access:** `CLIENT`, `GM`, `TM`, `ADMIN`  
> Cancel a job (moves to REJECTED status).

### Request Body
```json
{
  "reason": "Client requested cancellation due to vessel sale"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Job cancelled.",
  "data": {
    "id": "uuid",
    "job_status": "REJECTED",
    "updated_at": "2026-03-05T20:15:00.000Z"
  }
}
```

---

## 15. PUT `/api/v1/jobs/:id/priority`

> **Access:** `ADMIN`, `GM`, `TM`  
> Update job priority.

### Request Body
```json
{
  "priority": "URGENT",
  "reason": "Client escalation — vessel departure in 48 hours"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `priority` | string | ✅ | `LOW`, `NORMAL`, `HIGH`, `URGENT` |
| `reason` | string | ✅ | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "priority": "URGENT",
    "updated_at": "2026-03-05T20:20:00.000Z"
  }
}
```

---

## 16. GET `/api/v1/jobs/:id/history`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`  
> Get full status change history.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "job_id": "019514a2-7e3b-7000-8000-000000000100",
      "from_status": null,
      "to_status": "CREATED",
      "changed_by_user_id": "uuid",
      "remarks": null,
      "created_at": "2026-03-05T18:30:00.000Z"
    },
    {
      "id": "uuid",
      "job_id": "019514a2-7e3b-7000-8000-000000000100",
      "from_status": "CREATED",
      "to_status": "DOCUMENT_VERIFIED",
      "changed_by_user_id": "uuid",
      "remarks": "All documents verified and in order",
      "created_at": "2026-03-05T19:10:00.000Z"
    }
  ]
}
```

---

## 17. POST `/api/v1/jobs/:id/notes`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`  
> Add an internal note to a job.

### Request Body
```json
{
  "note_text": "Client confirmed vessel will be at port on schedule"
}
```

| Field | Type | Required |
|-------|------|----------|
| `note_text` | string | ✅ |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "note_text": "Client confirmed vessel will be at port on schedule",
    "created_by": "uuid",
    "created_at": "2026-03-05T20:30:00.000Z"
  }
}
```

---

## 18. GET `/api/v1/jobs/:id/messages/external`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> Get external (client-visible) messages for a job.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "job_id": "019514a2-7e3b-7000-8000-000000000100",
      "sender_id": "uuid",
      "message": "Documents have been uploaded for review.",
      "is_internal": false,
      "attachment_url": null,
      "created_at": "2026-03-05T18:35:00.000Z"
    }
  ]
}
```

---

## 19. GET `/api/v1/jobs/:id/messages/internal`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`  
> Get internal (staff-only) messages.

### Response `200 OK`
Same structure as external messages but with `"is_internal": true`.

---

## 20. POST `/api/v1/jobs/:id/messages`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ | Message text |
| `is_internal` | boolean | optional | Default `false`. Only staff can set `true` |
| `attachment` | file | optional | PDF, image, etc. |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "sender_id": "uuid",
    "message": "Updated documents attached.",
    "is_internal": false,
    "attachment_url": "https://storage.girik.com/messages/doc.pdf",
    "created_at": "2026-03-05T20:45:00.000Z"
  }
}
```
