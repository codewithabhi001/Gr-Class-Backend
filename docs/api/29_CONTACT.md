# 29 — Contact Enquiry APIs

**Base URL:** `/api/v1/contact`  
**Auth:** Noted per endpoint

---

## 1. POST `/api/v1/contact`

> **Access:** Public (no auth, rate limited)  
> Submit a contact enquiry from the website.

### Request Body
```json
{
  "full_name": "John Smith",
  "corporate_email": "john@smithshipping.com",
  "message": "We are interested in your classification services for our fleet of 5 vessels operating in the Gulf region. Please send us a proposal.",
  "company": "Smith Shipping Ltd",
  "phone": "+971501234567",
  "subject": "Fleet Classification Services",
  "source_page": "CONCT"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `full_name` | string | ✅ | 2–100 characters |
| `corporate_email` | string | ✅ | Must be valid email |
| `message` | string | ✅ | 10–5000 characters |
| `company` | string | optional | — |
| `phone` | string | optional | — |
| `subject` | string | optional | — |
| `source_page` | string | optional | `CONCT`, `HOME`, etc. |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you shortly.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000001300",
    "full_name": "John Smith",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/contact`

> **Access:** `ADMIN`, `GM`  
> List all contact enquiries.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `status` | string | optional | `NEW`, `READ`, `REPLIED`, `ARCHIVED` |

### Response `200 OK`
```json
{
  "success": true,
  "total": 25,
  "data": [
    {
      "id": "uuid",
      "full_name": "John Smith",
      "company": "Smith Shipping Ltd",
      "corporate_email": "john@smithshipping.com",
      "phone": "+971501234567",
      "subject": "Fleet Classification Services",
      "message": "We are interested in your classification services...",
      "status": "NEW",
      "internal_note": null,
      "replied_by": null,
      "replied_at": null,
      "ip_address": "192.168.1.100",
      "source_page": "CONCT",
      "created_at": "2026-03-05T18:00:00.000Z",
      "updated_at": "2026-03-05T18:00:00.000Z"
    }
  ]
}
```

---

## 3. GET `/api/v1/contact/stats`

> **Access:** `ADMIN`, `GM`

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 25,
    "by_status": {
      "NEW": 10,
      "READ": 5,
      "REPLIED": 8,
      "ARCHIVED": 2
    }
  }
}
```

---

## 4. GET `/api/v1/contact/:id`

> **Access:** `ADMIN`, `GM`

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
    "full_name": "John Smith",
    "company": "Smith Shipping Ltd",
    "corporate_email": "john@smithshipping.com",
    "phone": "+971501234567",
    "subject": "Fleet Classification Services",
    "message": "We are interested...",
    "status": "NEW",
    "internal_note": null,
    "replied_by": null,
    "replied_at": null,
    "ip_address": "192.168.1.100",
    "source_page": "CONCT",
    "created_at": "2026-03-05T18:00:00.000Z",
    "Responder": null
  }
}
```

---

## 5. PATCH `/api/v1/contact/:id/status`

> **Access:** `ADMIN`, `GM`  
> Update enquiry status and add internal notes.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "REPLIED",
  "internal_note": "Sent proposal via email on 2026-03-06. Follow up in 1 week."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `NEW`, `READ`, `REPLIED`, `ARCHIVED` |
| `internal_note` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Enquiry updated successfully.",
  "data": {
    "id": "uuid",
    "status": "REPLIED",
    "internal_note": "Sent proposal via email...",
    "replied_by": "uuid",
    "replied_at": "2026-03-06T10:00:00.000Z"
  }
}
```

---

## 6. DELETE `/api/v1/contact/:id`

> **Access:** `ADMIN` only  
> Permanently delete an enquiry.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `204 No Content`
No body.
