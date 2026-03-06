# 30 — Certificate Template APIs

**Base URL:** `/api/v1/certificate-templates`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/certificate-templates`

> **Access:** `ADMIN` only  
> Create a new certificate template (used for PDF generation layout).

### Request Body
```json
{
  "name": "ISM DOC Template",
  "code": "ISM-DOC-TPL",
  "description": "Template for generating ISM Document of Compliance certificates",
  "sections": [
    {
      "title": "Ship Particulars",
      "items": [
        { "code": "SP-001", "text": "Vessel Name", "type": "TEXT" },
        { "code": "SP-002", "text": "IMO Number", "type": "TEXT" },
        { "code": "SP-003", "text": "Flag State", "type": "TEXT" }
      ]
    },
    {
      "title": "Compliance Details",
      "items": [
        { "code": "CD-001", "text": "ISM Code compliant?", "type": "YES_NO_NA" },
        { "code": "CD-002", "text": "Safety management system verified?", "type": "YES_NO_NA" }
      ]
    }
  ],
  "status": "ACTIVE",
  "metadata": {
    "paper_size": "A4",
    "orientation": "portrait"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `code` | string | ✅ | Unique template code |
| `description` | string | optional | — |
| `sections` | array | ✅ | Array of sections with items |
| `sections[].title` | string | ✅ | — |
| `sections[].items` | array | ✅ | — |
| `sections[].items[].code` | string | ✅ | — |
| `sections[].items[].text` | string | ✅ | — |
| `sections[].items[].type` | string | ✅ | `TEXT`, `YES_NO_NA`, `DATE`, `NUMBER` |
| `status` | string | optional | `ACTIVE`, `INACTIVE`, `DRAFT` (default `ACTIVE`) |
| `metadata` | object | optional | — |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Template created",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000001400",
    "name": "ISM DOC Template",
    "code": "ISM-DOC-TPL",
    "description": "Template for generating ISM DOC certificates",
    "status": "ACTIVE",
    "sections": [...],
    "metadata": { "paper_size": "A4", "orientation": "portrait" },
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/certificate-templates`

> **Access:** `ADMIN`, `GM`, `TM`

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | optional | `ACTIVE`, `INACTIVE`, `DRAFT` |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ISM DOC Template",
      "code": "ISM-DOC-TPL",
      "status": "ACTIVE",
      "sections": [...],
      "created_at": "2026-03-05T18:00:00.000Z"
    }
  ]
}
```

---

## 3. GET `/api/v1/certificate-templates/:id`

> **Access:** `ADMIN`, `GM`, `TM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
Full template object.

---

## 4. PUT `/api/v1/certificate-templates/:id`

> **Access:** `ADMIN` only  
> Update template. Same body as create, all fields optional.

### Response `200 OK`
```json
{
  "success": true,
  "message": "Template updated",
  "data": { "id": "uuid", "name": "Updated Name", "..." : "..." }
}
```

---

## 5. DELETE `/api/v1/certificate-templates/:id`

> **Access:** `ADMIN` only

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```
