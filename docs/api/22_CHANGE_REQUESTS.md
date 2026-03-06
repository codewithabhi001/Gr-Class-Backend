# 22 — Change Request APIs

**Base URL:** `/api/v1/change-requests`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/change-requests`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`  
> Request a change to an existing entity (vessel info, certificate, etc.).

### Request Body
```json
{
  "entity_type": "VESSEL",
  "entity_id": "019514a2-7e3b-7000-8000-000000000005",
  "change_description": "Update port of registry from Dubai to Singapore",
  "old_value": { "port_of_registry": "Dubai" },
  "new_value": { "port_of_registry": "Singapore" },
  "priority": "MEDIUM"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `entity_type` | string | ✅ | e.g. `VESSEL`, `CLIENT`, `CERTIFICATE` |
| `entity_id` | UUID | ✅ | — |
| `change_description` | string | ✅ | — |
| `old_value` | JSON | optional | Previous values |
| `new_value` | JSON | optional | Requested new values |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH` (default `MEDIUM`) |

### Response `201 Created`
```json
{
  "message": "Change request created successfully",
  "change_request": {
    "id": "019514a2-7e3b-7000-8000-000000001000",
    "entity_type": "VESSEL",
    "entity_id": "019514a2-7e3b-7000-8000-000000000005",
    "requested_by": "019514a2-7e3b-7000-8000-000000000001",
    "change_description": "Update port of registry from Dubai to Singapore",
    "old_value": { "port_of_registry": "Dubai" },
    "new_value": { "port_of_registry": "Singapore" },
    "status": "PENDING",
    "priority": "MEDIUM",
    "approved_by": null,
    "approval_remarks": null,
    "approved_at": null,
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/change-requests`

> **Access:** `ADMIN`, `GM`, `TM`

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | optional | `PENDING`, `APPROVED`, `REJECTED` |
| `entity_type` | string | optional | e.g. `VESSEL`, `CLIENT` |
| `requested_by` | UUID | optional | — |

### Response `200 OK`
```json
{
  "change_requests": [
    {
      "id": "uuid",
      "entity_type": "VESSEL",
      "entity_id": "uuid",
      "requested_by": "uuid",
      "change_description": "Update port of registry...",
      "status": "PENDING",
      "priority": "MEDIUM",
      "created_at": "2026-03-05T18:00:00.000Z",
      "requester": { "name": "Client User" }
    }
  ],
  "total": 5
}
```

---

## 3. PUT `/api/v1/change-requests/:id/approve`

> **Access:** `ADMIN`, `GM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "remarks": "Change approved — vessel registry updated"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "message": "Change request approved",
  "change_request": {
    "id": "uuid",
    "status": "APPROVED",
    "approved_by": "uuid",
    "approval_remarks": "Change approved — vessel registry updated",
    "approved_at": "2026-03-06T10:00:00.000Z"
  }
}
```

---

## 4. PUT `/api/v1/change-requests/:id/reject`

> **Access:** `ADMIN`, `GM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "remarks": "Insufficient documentation provided"
}
```

| Field | Type | Required |
|-------|------|----------|
| `remarks` | string | optional |

### Response `200 OK`
```json
{
  "message": "Change request rejected",
  "change_request": {
    "id": "uuid",
    "status": "REJECTED",
    "approved_by": "uuid",
    "approval_remarks": "Insufficient documentation provided",
    "approved_at": "2026-03-06T10:00:00.000Z"
  }
}
```
