# 18 — Flag Administration APIs

**Base URL:** `/api/v1/flags`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/flags`

> **Access:** `ADMIN` only  
> Create a new flag administration.

### Request Body
```json
{
  "flag_state_name": "Panama",
  "country": "PA",
  "authority_name": "Panama Maritime Authority",
  "contact_email": "info@pma.gob.pa"
}
```

| Field | Type | Required |
|-------|------|----------|
| `flag_state_name` | string | ✅ |
| `country` | string | ✅ |
| `authority_name` | string | ✅ |
| `contact_email` | string | ✅ |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000030",
    "flag_state_name": "Panama",
    "country": "PA",
    "authority_name": "Panama Maritime Authority",
    "contact_email": "info@pma.gob.pa",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/flags`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "flag_state_name": "Panama",
      "country": "PA",
      "authority_name": "Panama Maritime Authority",
      "contact_email": "info@pma.gob.pa"
    },
    {
      "id": "uuid",
      "flag_state_name": "Marshall Islands",
      "country": "MH",
      "authority_name": "Republic of the Marshall Islands Maritime Administrator",
      "contact_email": "info@register-iri.com"
    }
  ]
}
```

---

## 3. GET `/api/v1/flags/:id`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

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
    "flag_state_name": "Panama",
    "country": "PA",
    "authority_name": "Panama Maritime Authority",
    "contact_email": "info@pma.gob.pa"
  }
}
```

---

## 4. PUT `/api/v1/flags/:id`

> **Access:** `ADMIN` only

### Request Body
```json
{
  "contact_email": "new-contact@pma.gob.pa",
  "authority_name": "Panama Maritime Authority (Updated)"
}
```

All fields optional.

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "flag_state_name": "Panama",
    "contact_email": "new-contact@pma.gob.pa",
    "authority_name": "Panama Maritime Authority (Updated)"
  }
}
```
