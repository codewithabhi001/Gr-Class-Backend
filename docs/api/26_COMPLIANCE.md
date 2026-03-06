# 26 — Compliance (GDPR) APIs

**Base URL:** `/api/v1/compliance`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/compliance/export/:id`

> **Access:** `ADMIN`, `CLIENT`  
> Export user's personal data (GDPR right of access).

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "CLIENT",
      "phone": "+971501234567",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z"
    },
    "client": {
      "company_name": "ABC Shipping",
      "company_code": "ABC-001"
    },
    "activity_logs": [...],
    "notifications": [...],
    "support_tickets": [...]
  }
}
```

---

## 2. POST `/api/v1/compliance/anonymize/:id`

> **Access:** `ADMIN` only  
> Anonymize user data (GDPR right to erasure).

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
    "name": "[ANONYMIZED]",
    "email": "anon-uuid@anonymized.girik",
    "phone": null,
    "status": "INACTIVE"
  }
}
```
