# 20 — Approval APIs

**Base URL:** `/api/v1/approvals`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/approvals`

> **Access:** `ADMIN`, `GM`, `TM`  
> Create a multi-step approval workflow.

### Request Body
```json
{
  "entity_type": "JOB",
  "entity_id": "019514a2-7e3b-7000-8000-000000000100",
  "steps": [
    { "role": "TO", "order": 1 },
    { "role": "TM", "order": 2 },
    { "role": "GM", "order": 3 }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `entity_type` | string | ✅ | e.g. `JOB`, `CERTIFICATE`, `TOCA` |
| `entity_id` | UUID | ✅ | — |
| `steps` | array | ✅ | Ordered approval steps |
| `steps[].role` | string | ✅ | Role required for this step |
| `steps[].order` | integer | ✅ | Step order |

### Response `201 Created`
```json
{
  "id": "uuid",
  "entity_type": "JOB",
  "entity_id": "uuid",
  "status": "PENDING",
  "steps": [
    { "id": "uuid", "role": "TO", "order": 1, "status": "PENDING" },
    { "id": "uuid", "role": "TM", "order": 2, "status": "PENDING" },
    { "id": "uuid", "role": "GM", "order": 3, "status": "PENDING" }
  ]
}
```

---

## 2. PUT `/api/v1/approvals/:id/step`

> **Access:** `ADMIN`, `GM`, `TM`  
> Approve or reject a step.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "APPROVED"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `APPROVED` or `REJECTED` |

### Response `200 OK`
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "current_step": 2,
  "overall_status": "PENDING"
}
```
