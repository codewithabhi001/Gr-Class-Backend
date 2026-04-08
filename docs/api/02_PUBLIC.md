# 02 — Public APIs (No Authentication)

**Base URL:** `/api/v1/public`

---

## 1. GET `/api/v1/public/certificate/verify/:number`

> **Access:** Public — no auth required  
> Verify a certificate by its certificate number.

### Path Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `number` | string | ✅ | Certificate number e.g. `GIRIK-2026-0042` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000010",
    "certificate_number": "GIRIK-2026-0042",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
    "issue_date": "2026-01-15",
    "expiry_date": "2031-01-15",
    "status": "VALID",
    "qr_code_url": "https://storage.grclass.com/qr/GIRIK-2026-0042.png",
    "pdf_file_url": "https://storage.grclass.com/certs/GIRIK-2026-0042.pdf",
    "issued_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "Vessel": {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "1234567",
      "ship_type": "Bulk Carrier",
      "Client": {
        "company_name": "ABC Shipping Ltd"
      }
    },
    "CertificateType": {
      "id": "019514a2-7e3b-7000-8000-000000000020",
      "name": "Safety Management Certificate",
      "issuing_authority": "CLASS"
    }
  }
}
```

### Response `404 Not Found`
```json
{
  "success": false,
  "message": "Certificate not found"
}
```

---

## 2. GET `/api/v1/public/vessel/:imo`

> **Access:** Public — no auth required  
> Verify a vessel by its IMO number.

### Path Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `imo` | string (7-digit) | ✅ | IMO number e.g. `1234567` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000005",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "call_sign": "ABCD",
    "mmsi_number": "123456789",
    "port_of_registry": "Dubai",
    "year_built": 2015,
    "ship_type": "Bulk Carrier",
    "gross_tonnage": "50000.00",
    "net_tonnage": "30000.00",
    "deadweight": "85000.00",
    "class_status": "ACTIVE",
    "current_class_society": "Lloyd's Register",
    "engine_type": "MAN B&W 6S60ME-C8.5",
    "builder_name": "Hyundai Heavy Industries",
    "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
    "FlagAdministration": {
      "flag_state_name": "Panama",
      "country": "PA"
    },
    "Client": {
      "company_name": "ABC Shipping Ltd"
    }
  }
}
```

---

## 3. GET `/api/v1/public/website/videos`

> **Access:** Public — no auth required  
> Get website videos for the public portfolio.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `section` | string | optional | Filter by section: `HOME`, `PORTFOLIO`, etc. |

### Response `200 OK`
```json
[
  {
    "id": "019514a2-7e3b-7000-8000-000000000040",
    "section": "HOME",
    "title": "About Girik Marine",
    "description": "Introduction to Girik Marine certification services",
    "video_url": "https://storage.grclass.com/videos/intro.mp4",
    "thumbnail_url": "https://storage.grclass.com/thumbnails/intro.jpg",
    "uploaded_by": "019514a2-7e3b-7000-8000-000000000001",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

## 4. GET `/api/v1/health`

> **Access:** Public — no auth required  
> System health check (outside of `/public` prefix).

### Response `200 OK`
```json
{
  "status": "UP",
  "timestamp": "2026-03-05T18:30:00.000Z"
}
```
