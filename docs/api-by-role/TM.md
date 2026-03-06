# TM (Technical Manager) — All APIs with Full Schemas

> **TM** manages technical operations — authorizes surveys, finalizes surveys, manages surveyors, handles TOCA.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE
Same as other roles — `POST /auth/logout`, `GET /users/me`, `PUT /users/profile-pic`, `PUT /users/fcm-token` (See [CLIENT.md](./CLIENT.md) for schemas)

---

## 🏢 CLIENTS | 🚢 VESSELS
Full CRUD (create, read, update) — same schemas as [GM.md](./GM.md)

---

## 📋 JOB WORKFLOW

| Method | Endpoint | Transition |
|--------|----------|------------|
| GET | `/jobs` | — |
| GET | `/jobs/:id` | — |
| PUT | `/jobs/:id/finalize` | `APPROVED` → `FINALIZED` |
| PUT | `/jobs/:id/reassign` | No status change |
| PUT | `/jobs/:id/authorize-survey` ⭐ | `ASSIGNED` → `SURVEY_AUTHORIZED` |
| PUT | `/jobs/:id/send-back` | → `REWORK_REQUESTED` |
| PUT | `/jobs/:id/reject` | → `REJECTED` |
| PUT | `/jobs/:id/cancel` | → `REJECTED` |
| PUT | `/jobs/:id/priority` | — |
| GET | `/jobs/:id/history` | — |
| POST | `/jobs/:id/notes` | — |
| GET/POST | `/jobs/:id/messages/*` | — |

### PUT `/api/v1/jobs/:id/authorize-survey` ⭐ (TM Key Action)
**Request:** `{ "remarks": "Survey authorized — surveyor may proceed" }`
**Response `200`:**
```json
{ "success": true, "message": "Survey authorized.", "data": { "id": "uuid", "job_status": "SURVEY_AUTHORIZED", "updated_at": "2026-03-05T19:00:00.000Z" } }
```

All other job endpoints — same schemas as [GM.md](./GM.md)

---

## 🔍 SURVEY MANAGEMENT ⭐ (TM Key Responsibility)

### PUT `/api/v1/surveys/jobs/:jobId/finalize` ⭐ (TM Only)
**Response `200`:**
```json
{
  "success": true, "message": "Survey finalized successfully.",
  "data": {
    "id": "uuid", "job_id": "uuid", "survey_status": "FINALIZED",
    "finalized_at": "2026-03-05T22:00:00.000Z",
    "updated_at": "2026-03-05T22:00:00.000Z"
  }
}
```

### PUT `/api/v1/surveys/jobs/:jobId/rework`
**Request:** `{ "reason": "Checklist section 3 incomplete, photos missing" }`
**Response `200`:**
```json
{ "success": true, "message": "Rework requested.", "data": { "id": "uuid", "survey_status": "REWORK_REQUIRED", "updated_at": "2026-03-05T21:00:00.000Z" } }
```

### POST `/api/v1/surveys/jobs/:jobId/violation`
**Request:** `{ "description": "Missing safety equipment", "severity": "MAJOR" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "description": "Missing safety equipment", "severity": "MAJOR", "flagged_by": "uuid", "created_at": "2026-03-05T20:30:00.000Z" } }
```

### POST `/api/v1/surveys/jobs/:jobId/statement/draft`
**Request:** `{ "survey_statement": "The vessel MV Star was inspected..." }`
**Response `200`:**
```json
{ "success": true, "message": "Statement drafted.", "data": { "id": "uuid", "survey_statement": "The vessel MV Star was inspected...", "updated_at": "2026-03-05T19:30:00.000Z" } }
```

### POST `/api/v1/surveys/jobs/:jobId/statement/issue` ⭐ (TM Only) — `multipart/form-data`
Field: `statement` (PDF file)
**Response `200`:**
```json
{ "success": true, "message": "Statement issued.", "data": { "id": "uuid", "statement_url": "https://storage.girik.com/statements/stmt-001.pdf", "issued_at": "2026-03-05T22:00:00.000Z" } }
```

### GET `/api/v1/surveys` | GET `/surveys/jobs/:jobId` | GET `/surveys/jobs/:jobId/timeline`
Same as [SURVEYOR.md](./SURVEYOR.md)

---

## 📜 CERTIFICATES
Full access: Generate, Suspend, Revoke, Restore, Renew, Bulk Renew, Reissue + all reads.
Same schemas as [ADMIN_PART2.md](./ADMIN_PART2.md)

---

## 💰 PAYMENTS
List, Detail, Invoice, Mark Paid, Partial — no WriteOff, no Refund.
Same schemas as [GM.md](./GM.md)

---

## 👷 SURVEYOR MANAGEMENT

### POST `/api/v1/surveyors`
**Request:** `{ "name": "John Surveyor", "email": "john@girik.com", "password": "Secure@123", "phone": "+971501234567", "nationality": "UK", "qualifications": "Master Mariner" }`
**Response `201`:**
```json
{ "success": true, "message": "Surveyor created successfully", "data": { "user": { "id": "uuid", "name": "John Surveyor", "role": "SURVEYOR" }, "profile": { "id": "uuid", "nationality": "UK", "qualifications": "Master Mariner" } } }
```

### GET `/api/v1/surveyors/applications`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "full_name": "John Smith", "email": "john@example.com", "qualification": "Chief Engineer", "years_of_experience": 15, "status": "PENDING", "cv_url": "https://...", "created_at": "2026-03-05T18:00:00.000Z" }], "count": 5 } }
```

### PUT `/api/v1/surveyors/applications/:id/review`
**Request:** `{ "status": "APPROVED", "remarks": "All credentials verified" }`
**Response `200`:**
```json
{ "success": true, "message": "Application approved successfully", "data": { "id": "uuid", "status": "APPROVED", "remarks": "All credentials verified" } }
```

### GET `/api/v1/surveyors/:id/profile` | PUT `/:id/profile` | GET `/:id/location-history`
Same as [ADMIN_PART2.md](./ADMIN_PART2.md)

---

## 🔄 TOCA ⭐ (TM Key)

### POST `/api/v1/toca` (TM only)
**Request:**
```json
{ "vessel_id": "uuid", "losing_class_society": "Bureau Veritas", "gaining_class_society": "Lloyd's Register", "request_date": "2026-03-05" }
```
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "vessel_id": "uuid", "losing_class_society": "Bureau Veritas", "gaining_class_society": "Lloyd's Register", "request_date": "2026-03-05", "status": "PENDING", "decision_date": null } }
```

### PUT `/api/v1/toca/:id/status`
**Request:** `{ "status": "ACCEPTED" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "ACCEPTED", "decision_date": "2026-03-06" } }`

### GET `/api/v1/toca`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "losing_class_society": "Bureau Veritas", "gaining_class_society": "Lloyd's Register", "status": "PENDING", "Vessel": { "vessel_name": "MV Star" } }] }
```

---

## 🚨 NON-CONFORMITIES

### PUT `/api/v1/non-conformities/:id/close`
**Request:** `{ "closure_remarks": "Corrective action verified — new extinguisher installed" }`
**Response `200`:**
```json
{ "id": "uuid", "status": "CLOSED", "closure_remarks": "Corrective action verified...", "closed_at": "2026-03-06T10:00:00.000Z" }
```

### GET `/api/v1/non-conformities/job/:jobId`
Same as [ADMIN_PART3.md](./ADMIN_PART3.md)

---

## OTHER MODULES
| Module | Access | Schemas |
|--------|--------|---------|
| Dashboard | `GET /dashboard` | See [ADMIN_PART3.md](./ADMIN_PART3.md) — TM-specific |
| Reports | All 4 reports | Same as [GM.md](./GM.md) |
| Documents | Full access (no DELETE) | Same as [CLIENT.md](./CLIENT.md) |
| Notifications | Full access | Same as all roles |
| Support | Create + View own | Same as [CLIENT.md](./CLIENT.md) |
| Flags | GET only | Same as [GM.md](./GM.md) |
| Approvals | POST, PUT step | Same as [GM.md](./GM.md) |
| Activity Requests | All CRUD | Same as [CLIENT.md](./CLIENT.md) |
| Change Requests | POST, GET | Same as [CLIENT.md](./CLIENT.md) |
| Incidents | All CRUD + status | Same as [CLIENT.md](./CLIENT.md) |
| Search | GET | Same as all roles |
| Checklist Templates | All GET | Same as [SURVEYOR.md](./SURVEYOR.md) |
| Cert Templates | GET only | Same as [ADMIN_PART3.md](./ADMIN_PART3.md) |
| System | Health, Readiness, Version | Same as [ADMIN_PART3.md](./ADMIN_PART3.md) |
