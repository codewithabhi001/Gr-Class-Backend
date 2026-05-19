# 21 — Activity Request APIs

**Base URL:** `/api/v1/activity-requests`  
**Auth:** `Authorization: Bearer <accessToken>`

> **Full frontend guide (req/res, UI checklist, AI prompt):** [ACTIVITY_REQUEST_FRONTEND_IMPLEMENTATION.md](../ACTIVITY_REQUEST_FRONTEND_IMPLEMENTATION.md)  
> **Swagger:** `src/docs/paths/activity_requests.yaml` + `src/docs/schemas/activity.yaml` → `/api-docs` → Activity Requests

---

## 1. POST `/api/v1/activity-requests`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`  
> Create a new activity request (pre-job request).

### Request Body
```json
{
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "activity_type": "INSPECTION",
  "requested_service": "Annual Safety Inspection",
  "priority": "HIGH",
  "description": "Annual safety inspection required before vessel departure to Rotterdam",
  "location_port": "Dubai Port, Jebel Ali",
  "proposed_date": "2026-04-10T00:00:00.000Z",
  "attachments": []
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vessel_id` | UUID | optional | For client requests |
| `activity_type` | string | ✅ | `INSPECTION`, `AUDIT`, `TRAINING`, `VISIT`, `SURVEY`, `OTHER` |
| `requested_service` | string | optional | Specific service name |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` (default `MEDIUM`) |
| `description` | string | optional | — |
| `location_port` | string | optional | — |
| `proposed_date` | string (ISO) | optional | — |
| `attachments` | array (JSON) | optional | — |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000900",
    "request_number": "AR-2026-001",
    "requested_by": "019514a2-7e3b-7000-8000-000000000001",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "activity_type": "INSPECTION",
    "requested_service": "Annual Safety Inspection",
    "priority": "HIGH",
    "description": "Annual safety inspection required...",
    "location_port": "Dubai Port, Jebel Ali",
    "proposed_date": "2026-04-10T00:00:00.000Z",
    "status": "PENDING",
    "linked_job_id": null,
    "rejection_reason": null,
    "attachments": [],
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/activity-requests`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`  
> CLIENT sees only their own requests.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | — |
| `limit` | number | optional | — |
| `status` | string | optional | `PENDING`, `APPROVED`, `REJECTED`, `CONVERTED_TO_JOB`, `DRAFT` |
| `activity_type` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid",
        "request_number": "AR-2026-001",
        "activity_type": "INSPECTION",
        "requested_service": "Annual Safety Inspection",
        "priority": "HIGH",
        "status": "PENDING",
        "proposed_date": "2026-04-10",
        "Requester": { "name": "Client User" },
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "count": 5
  }
}
```

---

## 3. GET `/api/v1/activity-requests/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`

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
    "request_number": "AR-2026-001",
    "activity_type": "INSPECTION",
    "requested_service": "Annual Safety Inspection",
    "proposed_date": "2026-04-10T00:00:00.000Z",
    "status": "PENDING",
    "vessel_id": "uuid",
    "requested_by": "uuid",
    "priority": "HIGH",
    "description": "Annual safety inspection required...",
    "location_port": "Dubai Port, Jebel Ali",
    "linked_job_id": "N/A",
    "rejection_reason": "N/A",
    "attachments": [
      {
        "filename": "supporting-doc.pdf",
        "signedUrl": "https://bucket.s3.amazonaws.com/...?X-Amz-Signature=..."
      }
    ],
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "vessel": {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "1234567",
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
    "requester_name": "Client User",
    "requester_email": "ops@pacific.com",
    "linked_job_status": "N/A",
    "linked_job_reason": "N/A",
    "linked_job_request_number": "N/A"
  }
}
```

---

## 4. POST `/api/v1/activity-requests/:id/convert-to-job`

> **Access:** `ADMIN`, `GM`, `TM`  
> Convert an **APPROVED** activity request into a formal job. Creates the job, sets `linked_job_id`, and sets status to `CONVERTED_TO_JOB`.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body

Same idea as `POST /api/v1/jobs`, but only **`certificate_type_id` is required**. Other fields are optional and default from the activity request.

```json
{
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020"
}
```

Full override example:

```json
{
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "target_port": "Port of Singapore",
  "target_date": "2026-05-15",
  "reason": "Annual hull survey — converted from client request",
  "priority": "HIGH",
  "remarks": "Converted from AR-2026-0042",
  "uploaded_documents": []
}
```

| Field | Type | Required | Default source |
|-------|------|----------|----------------|
| `certificate_type_id` | UUID | ✅ | — (GM must choose) |
| `vessel_id` | UUID | optional | activity `vessel_id` |
| `target_port` | string | optional | activity `location_port` |
| `target_date` | ISO date | optional | activity `proposed_date` |
| `reason` | string | optional | `requested_service` + `description` |
| `priority` | string | optional | activity `priority` (MEDIUM → NORMAL) |
| `remarks` | string | optional | `Converted from {request_number}` |
| `uploaded_documents` | array | optional | Upload on convert if ready; otherwise add on job before verification |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Activity request converted to job successfully",
  "data": {
    "activity_request": {
      "id": "uuid",
      "status": "CONVERTED_TO_JOB",
      "linked_job_id": "uuid",
      "linked_job_request_number": "GRJ-A1B2C3D4",
      "vessel": { "...": "..." }
    },
    "job": {
      "id": "uuid",
      "job_request_number": "GRJ-A1B2C3D4",
      "job_status": "CREATED",
      "vessel_id": "uuid",
      "certificate_type_id": "uuid",
      "target_port": "Port of Singapore",
      "target_date": "2026-05-15",
      "priority": "NORMAL",
      "reason": "Annual Survey — client hull inspection",
      "source_activity_request_id": "uuid"
    }
  }
}
```

**Notes:**
- Blank strings in the body (e.g. `"target_port": ""`) are ignored; values fall back to the activity request.
- Mandatory certificate documents are **not** required at convert; upload them on the job before document verification.
- `GET /jobs/:id` returns `source_activity_request` when the job was converted from an activity request.

### Errors
| Code | When |
|------|------|
| `400` | Status is not `APPROVED`, or vessel/port/date cannot be resolved |
| `409` | Already has `linked_job_id` |

### End-to-end flow
1. Client → `POST /activity-requests` → `PENDING`
2. GM/TM → `PUT /activity-requests/:id/status` → `{ "status": "APPROVED" }`
3. GM/TM → `POST /activity-requests/:id/convert-to-job` → job + `CONVERTED_TO_JOB`

---

## 5. PUT `/api/v1/activity-requests/:id/status`

> **Access:** `ADMIN`, `GM`, `TM`  
> Approve/reject an activity request.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "APPROVED",
  "remarks": "Approved — converting to job request"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `APPROVED`, `REJECTED`, `PENDING`, `DRAFT` — **not** `CONVERTED_TO_JOB` (use convert-to-job) |
| `remarks` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "updated_at": "2026-03-06T10:00:00.000Z"
  }
}
```
