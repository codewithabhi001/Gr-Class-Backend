# 16 — Report APIs

**Base URL:** `/api/v1/reports`  
**Auth:** `Authorization: Bearer <accessToken>`  
**Access:** `ADMIN`, `GM`, `TM` (all endpoints)

---

## 1. GET `/api/v1/reports/certificates`

> Certificate report with filters.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from_date` | string | optional | Start date (ISO) |
| `to_date` | string | optional | End date (ISO) |
| `status` | string | optional | `VALID`, `EXPIRED`, `SUSPENDED`, `REVOKED` |
| `certificate_type_id` | UUID | optional | Filter by type |
| `client_id` | UUID | optional | Filter by client |

### Response `200 OK`
```json
{
  "total": 150,
  "by_status": { "VALID": 120, "EXPIRED": 20, "SUSPENDED": 5, "REVOKED": 5 },
  "by_type": [
    { "certificate_type": "SMC", "count": 50 },
    { "certificate_type": "DOC", "count": 40 }
  ],
  "certificates": [
    {
      "id": "uuid",
      "certificate_number": "GR-CLASS-2026-0042",
      "vessel_name": "MV Star",
      "status": "VALID",
      "issue_date": "2026-01-15",
      "expiry_date": "2031-01-15"
    }
  ]
}
```

---

## 2. GET `/api/v1/reports/surveyors`

> Surveyor performance report.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from_date` | string | optional | — |
| `to_date` | string | optional | — |
| `surveyor_id` | UUID | optional | Specific surveyor |

### Response `200 OK`
```json
{
  "total_surveyors": 25,
  "active_surveyors": 18,
  "total_surveys_completed": 200,
  "surveyors": [
    {
      "id": "uuid",
      "name": "John Surveyor",
      "total_surveys": 30,
      "average_completion_days": 2.5,
      "rework_count": 1,
      "rating": 4.8
    }
  ]
}
```

---

## 3. GET `/api/v1/reports/non-conformities`

> Non-conformity report.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from_date` | string | optional | — |
| `to_date` | string | optional | — |
| `severity` | string | optional | `MINOR`, `MAJOR`, `CRITICAL` |
| `status` | string | optional | `OPEN`, `CLOSED` |

### Response `200 OK`
```json
{
  "total": 45,
  "by_severity": { "MINOR": 20, "MAJOR": 20, "CRITICAL": 5 },
  "by_status": { "OPEN": 15, "CLOSED": 30 },
  "items": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "description": "Fire extinguisher expired",
      "severity": "MAJOR",
      "status": "CLOSED",
      "vessel": "MV Star"
    }
  ]
}
```

---

## 4. GET `/api/v1/reports/financials`

> Financial report.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from_date` | string | optional | — |
| `to_date` | string | optional | — |
| `currency` | string | optional | `USD`, `AED` |

### Response `200 OK`
```json
{
  "total_invoiced": "250000.00",
  "total_collected": "200000.00",
  "outstanding": "50000.00",
  "by_month": [
    { "month": "2026-01", "invoiced": "50000.00", "collected": "45000.00" },
    { "month": "2026-02", "invoiced": "60000.00", "collected": "55000.00" }
  ],
  "by_client": [
    { "client": "ABC Shipping", "invoiced": "80000.00", "paid": "70000.00" }
  ]
}
```
