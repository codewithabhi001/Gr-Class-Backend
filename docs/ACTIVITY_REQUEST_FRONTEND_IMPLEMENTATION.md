# Activity Request — Full Frontend Implementation Guide

Use this document as the **single source of truth** for implementing Activity Requests from creation through job conversion.

**Base URL:** `/api/v1/activity-requests`  
**Auth:** `Authorization: Bearer <accessToken>` on every call

---

## Lifecycle overview

```
┌─────────────┐     PUT /status      ┌──────────┐    POST /convert-to-job    ┌─────────────────┐
│   PENDING   │ ──────────────────►  │ APPROVED │ ─────────────────────────► │ CONVERTED_TO_JOB │
└─────────────┘      APPROVED        └──────────┘                            └────────┬────────┘
       │                                    │                                         │
       │ PUT /status REJECTED               │                                         ▼
       ▼                                    │                              Job status CREATED
┌─────────────┐                             │                              GET /jobs/:jobId
│  REJECTED   │                             │
└─────────────┘                             └── Cannot use PUT status with CONVERTED_TO_JOB
```

| Step | Actor | Endpoint | Result status |
|------|-------|----------|---------------|
| 1 | CLIENT (or GM/TM) | `POST /activity-requests` | `PENDING` |
| 2 | ADMIN / GM / TM | `PUT /activity-requests/:id/status` | `APPROVED` or `REJECTED` |
| 3 | ADMIN / GM / TM | `POST /activity-requests/:id/convert-to-job` | `CONVERTED_TO_JOB` + new job |

---

## Global response rules

1. **Envelope:** `{ success: boolean, data?: ..., message?: string }`
2. **Empty values:** API returns **`"N/A"`** string, **never `null`**, on list/detail/convert responses.
3. **No nested Sequelize objects** — flat fields + `vessel` object only.
4. **CLIENT scope:** list/detail only returns rows where `requested_by` = current user.

---

## Step 1 — Create activity request

### `POST /api/v1/activity-requests`

**Roles:** `CLIENT`, `ADMIN`, `GM`, `TM`

### Request body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `vessel_id` | UUID | Required for CLIENT | Vessel for this request |
| `activity_type` | enum | ✅ | `INSPECTION`, `AUDIT`, `TRAINING`, `VISIT`, `SURVEY`, `OTHER` |
| `requested_service` | string | ✅ | e.g. "Annual hull inspection" |
| `location_port` | string | ✅ | Used as job `target_port` on convert |
| `proposed_date` | ISO date | ✅ | Used as job `target_date` on convert |
| `priority` | enum | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` (default `MEDIUM`) |
| `description` | string | optional | Used in job `reason` on convert |
| `attachments` | string[] | optional | S3 keys/URLs; detail returns signed URLs |

### Request example

```http
POST /api/v1/activity-requests
Content-Type: application/json
Authorization: Bearer <token>

{
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "activity_type": "SURVEY",
  "requested_service": "Annual hull inspection",
  "priority": "HIGH",
  "description": "Survey required before Rotterdam departure",
  "location_port": "Port of Singapore",
  "proposed_date": "2026-05-15",
  "attachments": ["certificates/supporting-doc.pdf"]
}
```

### Response `201`

```json
{
  "success": true,
  "data": {
    "id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc",
    "request_number": "AR-2026-0001",
    "activity_type": "SURVEY",
    "requested_service": "Annual hull inspection",
    "proposed_date": "2026-05-15",
    "status": "PENDING",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "requested_by": "019c79a4-4475-729b-ae3e-98373803b963",
    "priority": "HIGH",
    "description": "Survey required before Rotterdam departure",
    "location_port": "Port of Singapore",
    "linked_job_id": "N/A",
    "rejection_reason": "N/A",
    "attachments": [
      { "filename": "supporting-doc.pdf", "signedUrl": "https://..." }
    ],
    "created_at": "2026-04-12T13:44:40.000Z",
    "updated_at": "2026-04-12T13:44:40.000Z",
    "vessel_name": "MV Star",
    "imo_number": "9123456",
    "requester_name": "Client User",
    "requester_email": "ops@pacific.com",
    "vessel": {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "9123456",
      "call_sign": "9V1234",
      "mmsi_number": "563123456",
      "port_of_registry": "Singapore",
      "year_built": "2010",
      "ship_type": "Bulk Carrier",
      "gross_tonnage": "45000",
      "net_tonnage": "28000",
      "deadweight": "82000",
      "class_status": "ACTIVE",
      "current_class_society": "GR Class",
      "engine_type": "Diesel",
      "flag_state": "Singapore",
      "company_name": "Pacific Shipping Ltd",
      "company_code": "PAC-001"
    },
    "linked_job_status": "N/A",
    "linked_job_reason": "N/A",
    "linked_job_request_number": "N/A"
  }
}
```

---

## List activity requests

### `GET /api/v1/activity-requests?page=1&limit=10&status=PENDING`

**Roles:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`

### Query params

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | default `1` |
| `limit` | number | default `10` |
| `status` | enum | Filter: `PENDING`, `APPROVED`, `REJECTED`, `CONVERTED_TO_JOB`, `DRAFT` |
| `activity_type` | enum | Optional filter |

### Response `200`

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "rows": [
      {
        "id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc",
        "request_number": "AR-2026-0001",
        "activity_type": "SURVEY",
        "requested_service": "Annual hull inspection",
        "proposed_date": "2026-05-15",
        "status": "PENDING",
        "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
        "vessel_name": "MV Star",
        "imo_number": "9123456",
        "ship_type": "Bulk Carrier",
        "class_status": "ACTIVE",
        "flag_state": "Singapore",
        "company_name": "Pacific Shipping Ltd",
        "vessel": { "...": "..." },
        "linked_job_id": "N/A",
        "linked_job_status": "N/A",
        "linked_job_request_number": "N/A",
        "created_at": "2026-04-12T13:44:40.000Z"
      }
    ]
  }
}
```

---

## Detail page

### `GET /api/v1/activity-requests/:id`

Same shape as create response (`data` = flat detail with `vessel` block).

**UI:** Render `data.vessel` for vessel card (name, IMO, flag, company, tonnage, etc.).

---

## Step 2 — Approve or reject

### `PUT /api/v1/activity-requests/:id/status`

**Roles:** `ADMIN`, `GM`, `TM`

### Request body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | enum | ✅ | `APPROVED`, `REJECTED`, `PENDING`, `DRAFT` only |
| `remarks` | string | optional | Use for rejection reason |

**Do not send** `CONVERTED_TO_JOB` — returns `400`.

### Approve example

```http
PUT /api/v1/activity-requests/019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc/status

{
  "status": "APPROVED",
  "remarks": "Approved — ready to convert"
}
```

### Reject example

```json
{
  "status": "REJECTED",
  "remarks": "Please provide latest class status certificate"
}
```

### Response `200`

```json
{
  "success": true,
  "data": { "...full flat detail, status APPROVED or REJECTED..." }
}
```

---

## Step 3 — Convert to job

### `POST /api/v1/activity-requests/:id/convert-to-job`

**Roles:** `ADMIN`, `GM`, `TM`  
**Precondition:** `status === "APPROVED"` and `linked_job_id === "N/A"`

### Request body

| Field | Type | Required | Default if omitted |
|-------|------|----------|-------------------|
| `certificate_type_id` | UUID | ✅ | — |
| `vessel_id` | UUID | optional | activity `vessel_id` |
| `target_port` | string | optional | activity `location_port` |
| `target_date` | ISO date | optional | activity `proposed_date` |
| `reason` | string | optional | `requested_service` + `description` |
| `priority` | enum | optional | activity priority (`MEDIUM`→`NORMAL`) |
| `remarks` | string | optional | `Converted from {request_number}` |
| `uploaded_documents` | array | optional | Not required at convert |

**Blank strings** (`""`) are ignored; activity values are used.

### Minimal request (recommended)

```http
POST /api/v1/activity-requests/019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc/convert-to-job

{
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020"
}
```

### Full override request

```json
{
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "target_port": "Jebel Ali",
  "target_date": "2026-06-01",
  "reason": "Intermediate survey",
  "priority": "HIGH",
  "remarks": "Converted from AR-2026-0001",
  "uploaded_documents": []
}
```

### Response `201`

```json
{
  "success": true,
  "message": "Activity request converted to job successfully",
  "data": {
    "activity_request": {
      "id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc",
      "request_number": "AR-2026-0001",
      "status": "CONVERTED_TO_JOB",
      "linked_job_id": "019514a2-7e3b-7000-8000-000000000200",
      "linked_job_request_number": "GRJ-A1B2C3D4",
      "linked_job_status": "CREATED",
      "vessel": { "...": "..." }
    },
    "job": {
      "id": "019514a2-7e3b-7000-8000-000000000200",
      "job_request_number": "GRJ-A1B2C3D4",
      "job_status": "CREATED",
      "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
      "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
      "target_port": "Port of Singapore",
      "target_date": "2026-05-15",
      "priority": "HIGH",
      "reason": "Annual hull inspection — Survey required before Rotterdam departure",
      "source_activity_request_id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc"
    }
  }
}
```

### Errors

| HTTP | When |
|------|------|
| `400` | Not `APPROVED`, missing vessel/port/date, invalid certificate |
| `404` | Unknown id |
| `409` | Already converted |

---

## After convert — Job detail

### `GET /api/v1/jobs/:jobId`

Includes back-link when created from activity:

```json
{
  "source_activity_request_id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc",
  "source_activity_request": {
    "id": "019d81ef-f655-76a2-a6ea-7b9d4ca5cdbc",
    "request_number": "AR-2026-0001",
    "status": "CONVERTED_TO_JOB",
    "activity_type": "SURVEY",
    "requested_service": "Annual hull inspection"
  }
}
```

---

## UI screens checklist

### Client — Create form
- Vessel picker → `vessel_id`
- Activity type, service name, port, date, priority, description
- File upload → `attachments` array of S3 keys
- Submit → `POST /activity-requests` → redirect to detail

### Client — My requests list
- `GET /activity-requests?page&limit&status`
- Columns: request_number, vessel_name, service, proposed_date, status badge
- Row click → detail

### GM/TM — Review queue
- Filter `status=PENDING`
- Detail: show `vessel` card + attachments
- Actions: Approve / Reject → `PUT .../status`

### GM/TM — Convert modal (when `APPROVED`)
- Certificate type dropdown (required) → `GET /certificates/types`
- Optional overrides: port, date, reason
- Submit → `POST .../convert-to-job`
- On success → navigate to `data.job.id` job detail

### Detail — Converted state
- When `status === "CONVERTED_TO_JOB"` and `linked_job_id !== "N/A"`:
  - Show link: `View Job GRJ-...` using `linked_job_request_number`
  - Hide convert button

---

## Copy-paste prompt for AI / another developer

```
Implement Activity Request module for GR-Class backend API.

Base: /api/v1/activity-requests, Bearer auth.

Flow:
1. POST /activity-requests — CLIENT creates PENDING request (vessel_id, activity_type, requested_service, location_port, proposed_date required).
2. PUT /activity-requests/:id/status — GM/TM sets APPROVED or REJECTED (never CONVERTED_TO_JOB).
3. POST /activity-requests/:id/convert-to-job — GM/TM converts APPROVED request; body only requires certificate_type_id; vessel/port/date/reason default from activity.

Rules:
- All list/detail fields use "N/A" for empty values, never null.
- Flat responses with vessel{} block on detail/list.
- List is paginated: data { total, page, limit, totalPages, rows[] }.
- Convert returns { activity_request, job }; job has source_activity_request_id.
- GET /jobs/:id returns source_activity_request breadcrumb.

Use docs/ACTIVITY_REQUEST_FRONTEND_IMPLEMENTATION.md and Swagger tag "Activity Requests" for exact payloads.
```

---

## Swagger

OpenAPI sources:
- Paths: `src/docs/paths/activity_requests.yaml`
- Schemas: `src/docs/schemas/activity.yaml`

View in app: `/api-docs` (or role-specific `/api-docs/gm`, etc.) under **Activity Requests**.
