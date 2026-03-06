# 23 — Incident APIs

**Base URL:** `/api/v1/incidents`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/incidents`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`  
> Report an incident on a vessel.

### Request Body
```json
{
  "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
  "title": "Engine Room Fire Alarm Activation",
  "description": "Smoke detected in engine room starboard side at 14:30 local time. Crew responded immediately. No injuries. Fire suppression system activated as a precaution."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vessel_id` | UUID | ✅ | Must reference existing vessel |
| `title` | string | ✅ | — |
| `description` | string | ✅ | Detailed incident description |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000001100",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "reported_by": "019514a2-7e3b-7000-8000-000000000001",
    "title": "Engine Room Fire Alarm Activation",
    "description": "Smoke detected in engine room...",
    "status": "OPEN",
    "remarks": null,
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/incidents`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`  
> CLIENT sees only their own incidents.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | — |
| `limit` | number | optional | — |
| `status` | string | optional | `OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED` |
| `vessel_id` | UUID | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid",
        "vessel_id": "uuid",
        "reported_by": "uuid",
        "title": "Engine Room Fire Alarm Activation",
        "description": "Smoke detected...",
        "status": "OPEN",
        "remarks": null,
        "created_at": "2026-03-05T18:00:00.000Z",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "User": { "name": "Client User" }
      }
    ],
    "count": 3
  }
}
```

---

## 3. GET `/api/v1/incidents/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
Full incident object with `Vessel` and `User` associations.

---

## 4. PUT `/api/v1/incidents/:id/status`

> **Access:** `ADMIN`, `GM`, `TM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "INVESTIGATING",
  "remarks": "Investigation team dispatched to vessel. Expected arrival 2026-03-06 08:00."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED` |
| `remarks` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "INVESTIGATING",
    "remarks": "Investigation team dispatched...",
    "updated_at": "2026-03-06T10:00:00.000Z"
  }
}
```
