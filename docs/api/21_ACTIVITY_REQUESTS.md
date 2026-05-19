# 21 — Activity Request APIs

**Base URL:** `/api/v1/activity-requests`  
**Auth:** `Authorization: Bearer <accessToken>`

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
Full activity request object (same as create response with associations).

---

## 4. PUT `/api/v1/activity-requests/:id/status`

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
| `status` | string | ✅ | `APPROVED`, `REJECTED`, `CONVERTED_TO_JOB` |
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
