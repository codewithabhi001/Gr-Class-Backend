# 25 — Global Search API

**Base URL:** `/api/v1/search`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## GET `/api/v1/search`

> **Access:** Any authenticated user  
> Search across all modules. Results scoped by user role.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | ✅ | Search query (min 2 chars) |
| `type` | string | optional | Filter by type: `vessel`, `job`, `certificate`, `client`, `user` |
| `limit` | number | optional | Max results per type (default 10) |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "vessels": [
      {
        "id": "uuid",
        "vessel_name": "MV Star",
        "imo_number": "1234567",
        "ship_type": "Bulk Carrier",
        "class_status": "ACTIVE",
        "Client": { "company_name": "ABC Shipping" }
      }
    ],
    "jobs": [
      {
        "id": "uuid",
        "job_status": "ASSIGNED",
        "reason": "Annual survey",
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "certificates": [
      {
        "id": "uuid",
        "certificate_number": "GR-CLASS-2026-0042",
        "status": "VALID",
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "clients": [
      {
        "id": "uuid",
        "company_name": "ABC Shipping Ltd",
        "company_code": "ABC-001"
      }
    ]
  }
}
```
