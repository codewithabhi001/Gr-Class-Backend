# TO (Technical Officer) — All APIs with Full Schemas

> **TO** handles document verification, technical reviews, and non-conformity management.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE
Same as other roles — `POST /auth/logout`, `GET /users/me`, `PUT /users/profile-pic`, `PUT /users/fcm-token` (See [CLIENT.md](./CLIENT.md))

---

## 🏢 CLIENTS (Read Only)

### GET `/api/v1/clients`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "company_name": "ABC Shipping Ltd", "company_code": "ABC-001", "email": "info@abcshipping.com", "phone": "+971501234567", "status": "ACTIVE" }], "count": 30 } }
```

### GET `/api/v1/clients/:id`
Same as [GM.md](./GM.md)

### GET `/api/v1/clients/:id/documents`
Same as [ADMIN.md](./ADMIN.md)

---

## 🚢 VESSELS (Read Only)

### GET `/api/v1/vessels`
Same as [CLIENT.md](./CLIENT.md) — sees all vessels.

### GET `/api/v1/vessels/:id`
Same as [CLIENT.md](./CLIENT.md)

---

## 📋 JOB WORKFLOW ⭐ (TO Key Actions)

### PUT `/api/v1/jobs/:id/verify-documents` ⭐ (TO Only)
> First step in job workflow — TO verifies submitted documents.

**Request:** `{ "remarks": "All required documents verified and in order" }`
**Response `200`:**
```json
{
  "success": true,
  "message": "Documents verified.",
  "data": {
    "id": "uuid",
    "job_status": "DOCUMENT_VERIFIED",
    "updated_at": "2026-03-05T18:45:00.000Z"
  }
}
```

### PUT `/api/v1/jobs/:id/review` ⭐ (TO Only)
> Technical review after surveyor submits — TO reviews the survey report.

**Request:** `{ "remarks": "Survey report reviewed — all items satisfactory" }`
**Response `200`:**
```json
{
  "success": true,
  "message": "Job reviewed.",
  "data": {
    "id": "uuid",
    "job_status": "REVIEWED",
    "updated_at": "2026-03-05T22:00:00.000Z"
  }
}
```

### PUT `/api/v1/jobs/:id/send-back`
**Request:** `{ "reason": "Checklist section 3 missing photos" }`
**Response `200`:**
```json
{ "success": true, "message": "Job sent back for rework.", "data": { "id": "uuid", "job_status": "REWORK_REQUESTED" } }
```

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20&status=CREATED`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "certificate_type_id": "uuid",
        "reason": "Annual survey due", "target_port": "Dubai Port", "target_date": "2026-04-15",
        "job_status": "CREATED", "priority": "NORMAL", "is_survey_required": true,
        "assigned_surveyor_id": null, "reschedule_count": 0,
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" },
        "requester": { "name": "Ahmed Ali" }, "surveyor": null
      }
    ],
    "count": 500
  }
}
```

### GET `/api/v1/jobs/:id`
Same as [CLIENT.md](./CLIENT.md) — full job detail with all associations.

### GET `/api/v1/jobs/:id/history`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "job_id": "uuid", "from_status": "CREATED", "to_status": "DOCUMENT_VERIFIED", "remarks": "All docs verified", "changed_by_user_id": "uuid", "created_at": "2026-03-05T18:30:00.000Z", "user": { "name": "TO User" } }
  ]
}
```

### POST `/api/v1/jobs/:id/notes`
**Request:** `{ "note": "Checked vessel class certificate — valid until 2027." }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "user_id": "uuid", "note": "Checked vessel class certificate...", "created_at": "2026-03-05T19:30:00.000Z" } }
```

### Messages (external + internal + send)
Same as [CLIENT.md](./CLIENT.md) — also has internal messages access.

---

## 🔍 SURVEYS (Read Only)

### GET `/api/v1/surveys`
Same as [SURVEYOR.md](./SURVEYOR.md)

### GET `/api/v1/surveys/jobs/:jobId`
Same as [SURVEYOR.md](./SURVEYOR.md)

### GET `/api/v1/surveys/jobs/:jobId/timeline`
Same as [SURVEYOR.md](./SURVEYOR.md)

---

## 📜 CERTIFICATES (Read + Expiring)

### GET `/api/v1/certificates`
Same as [CLIENT.md](./CLIENT.md) — all certificates (not scoped).

### GET `/api/v1/certificates/expiring`
**Query:** `?days=30`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "expirations": [{ "id": "uuid", "certificate_number": "GIRIK-2026-0010", "expiry_date": "2026-04-01", "status": "VALID", "Vessel": { "vessel_name": "MV Star" }, "CertificateType": { "name": "SMC" } }],
    "count": 12, "days": 30
  }
}
```

All other GET cert endpoints — same as [CLIENT.md](./CLIENT.md)

---

## 🚨 NON-CONFORMITIES ⭐ (TO Key)

### POST `/api/v1/non-conformities`
**Request:**
```json
{ "job_id": "uuid", "description": "Fire extinguisher on port side deck expired — last serviced 2024-06-01", "severity": "MAJOR" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | — |
| `description` | string | ✅ | — |
| `severity` | string | ✅ | `MINOR`, `MAJOR`, `CRITICAL` |

**Response `201`:**
```json
{
  "id": "uuid", "job_id": "uuid",
  "description": "Fire extinguisher on port side deck expired...",
  "severity": "MAJOR", "status": "OPEN",
  "closure_remarks": null, "closed_at": null
}
```

### PUT `/api/v1/non-conformities/:id/close`
**Request:**
```json
{ "closure_remarks": "Corrective action verified — new fire extinguisher installed and inspected on 2026-03-06" }
```
**Response `200`:**
```json
{
  "id": "uuid", "job_id": "uuid",
  "description": "Fire extinguisher expired...",
  "severity": "MAJOR", "status": "CLOSED",
  "closure_remarks": "Corrective action verified — new fire extinguisher installed...",
  "closed_at": "2026-03-06T10:00:00.000Z"
}
```

### GET `/api/v1/non-conformities/job/:jobId`
**Response `200`:**
```json
[
  { "id": "uuid", "job_id": "uuid", "description": "Fire extinguisher expired", "severity": "MAJOR", "status": "OPEN", "closure_remarks": null },
  { "id": "uuid", "job_id": "uuid", "description": "Navigation light not working", "severity": "MINOR", "status": "CLOSED", "closure_remarks": "Replaced and tested", "closed_at": "2026-03-06T10:00:00.000Z" }
]
```

---

## 📂 DOCUMENTS (Full access, no DELETE)

### GET `/api/v1/documents/get-upload-url`
**Query:** `?fileName=report.pdf&fileType=application/pdf`
**Response `200`:**
```json
{ "success": true, "data": { "uploadUrl": "https://s3.../presigned", "fileKey": "documents/report.pdf", "expiresIn": 3600 } }
```

### POST `/api/v1/documents/upload` — `multipart/form-data`
**Response `201`:**
```json
{ "success": true, "data": { "fileKey": "misc/1709672200000-report.pdf", "url": "https://storage.girik.com/misc/report.pdf" } }
```

All other GET/POST document endpoints — same as [CLIENT.md](./CLIENT.md)

---

## 🔔 NOTIFICATIONS | 📊 DASHBOARD | 🎫 SUPPORT

### GET `/api/v1/dashboard` (TO-specific)
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "pendingVerification": 10,
    "pendingReview": 4,
    "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "DOCUMENT_VERIFIED": 5, "APPROVED": 8, "ASSIGNED": 12, "SURVEY_DONE": 4, "REVIEWED": 2 },
    "recentJobs": [{ "id": "uuid", "job_status": "CREATED", "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }]
  }
}
```

Notifications — same as all roles (see [CLIENT.md](./CLIENT.md))
Support — Create + View own (see [CLIENT.md](./CLIENT.md))

---

## OTHER MODULES

| Module | Endpoints | Schemas |
|--------|-----------|---------|
| Flags | `GET /flags`, `GET /flags/:id` | See [GM.md](./GM.md) |
| Activity Requests | `GET`, `GET /:id` (read only) | See [CLIENT.md](./CLIENT.md) |
| Incidents | `GET`, `GET /:id` (read only) | See [CLIENT.md](./CLIENT.md) |
| Search | `GET /search?q=keyword` | See [CLIENT.md](./CLIENT.md) |
| Checklists | `GET /checklists/jobs/:jobId` | See [SURVEYOR.md](./SURVEYOR.md) |
| Checklist Templates | `GET /job/:jobId` | See [SURVEYOR.md](./SURVEYOR.md) |
| System | Health, Readiness, Version | See [ADMIN_PART3.md](./ADMIN_PART3.md) |
