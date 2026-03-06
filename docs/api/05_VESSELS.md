# 05 — Vessel Management APIs

**Base URL:** `/api/v1/vessels`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/vessels`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`, `CLIENT`  
> List all vessels. CLIENT sees only their own vessels.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `client_id` | UUID | optional | Filter by client |
| `class_status` | string | optional | `ACTIVE`, `SUSPENDED`, `WITHDRAWN` |
| `search` | string | optional | Search by vessel name or IMO |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Vessels fetched successfully",
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000005",
        "client_id": "019514a2-7e3b-7000-8000-000000000060",
        "vessel_name": "MV Star",
        "imo_number": "1234567",
        "call_sign": "ABCD",
        "mmsi_number": "123456789",
        "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
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
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z",
        "Client": {
          "id": "019514a2-7e3b-7000-8000-000000000060",
          "company_name": "ABC Shipping Ltd"
        },
        "FlagAdministration": {
          "id": "019514a2-7e3b-7000-8000-000000000030",
          "flag_state_name": "Panama",
          "country": "PA"
        }
      }
    ],
    "count": 15
  }
}
```

---

## 2. GET `/api/v1/vessels/client/:clientId`

> **Access:** `ADMIN`, `GM`, `TM`  
> Get all vessels belonging to a specific client.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `clientId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Client vessels fetched successfully",
  "data": [
    {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "1234567",
      "ship_type": "Bulk Carrier",
      "class_status": "ACTIVE"
    }
  ]
}
```

---

## 3. POST `/api/v1/vessels`

> **Access:** `ADMIN`, `GM`, `TM`  
> Create a new vessel.

### Request Body
```json
{
  "client_id": "019514a2-7e3b-7000-8000-000000000060",
  "vessel_name": "MV Star",
  "imo_number": "1234567",
  "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
  "ship_type": "Bulk Carrier",
  "call_sign": "ABCD",
  "mmsi_number": "123456789",
  "port_of_registry": "Dubai",
  "year_built": 2015,
  "gross_tonnage": 50000,
  "net_tonnage": 30000,
  "deadweight": 85000,
  "class_status": "ACTIVE",
  "current_class_society": "Lloyd's Register",
  "engine_type": "MAN B&W 6S60ME-C8.5",
  "builder_name": "Hyundai Heavy Industries",
  "uploaded_documents": [
    {
      "file_url": "https://storage.girik.com/uploads/class_cert.pdf",
      "document_type": "Class Certificate",
      "description": "Current class certificate"
    }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `client_id` | UUID | ✅ | Must reference existing client |
| `vessel_name` | string | ✅ | — |
| `imo_number` | string | ✅ | Must be exactly 7 digits |
| `flag_administration_id` | UUID | ✅ | Must reference existing flag |
| `ship_type` | string | ✅ | — |
| `call_sign` | string | optional | — |
| `mmsi_number` | string | optional | Must be exactly 9 digits |
| `port_of_registry` | string | optional | — |
| `year_built` | integer | optional | — |
| `gross_tonnage` | number | optional | — |
| `net_tonnage` | number | optional | — |
| `deadweight` | number | optional | — |
| `class_status` | string | optional | `ACTIVE`, `SUSPENDED`, `WITHDRAWN` |
| `current_class_society` | string | optional | — |
| `engine_type` | string | optional | — |
| `builder_name` | string | optional | — |
| `uploaded_documents` | array | optional | Array of document objects |
| `uploaded_documents[].file_url` | string | ✅ (if doc) | Pre-uploaded file URL |
| `uploaded_documents[].document_type` | string | ✅ (if doc) | — |
| `uploaded_documents[].description` | string | optional | — |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Vessel added successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000080",
    "client_id": "019514a2-7e3b-7000-8000-000000000060",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
    "ship_type": "Bulk Carrier",
    "call_sign": "ABCD",
    "mmsi_number": "123456789",
    "port_of_registry": "Dubai",
    "year_built": 2015,
    "gross_tonnage": "50000.00",
    "net_tonnage": "30000.00",
    "deadweight": "85000.00",
    "class_status": "ACTIVE",
    "current_class_society": "Lloyd's Register",
    "engine_type": "MAN B&W 6S60ME-C8.5",
    "builder_name": "Hyundai Heavy Industries",
    "created_at": "2026-03-05T18:30:00.000Z",
    "updated_at": "2026-03-05T18:30:00.000Z"
  }
}
```

---

## 4. GET `/api/v1/vessels/:id`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`, `CLIENT`  
> Get specific vessel details.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Vessel details fetched successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000005",
    "client_id": "019514a2-7e3b-7000-8000-000000000060",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "call_sign": "ABCD",
    "mmsi_number": "123456789",
    "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
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
    "Client": {
      "id": "019514a2-7e3b-7000-8000-000000000060",
      "company_name": "ABC Shipping Ltd"
    },
    "FlagAdministration": {
      "flag_state_name": "Panama",
      "country": "PA",
      "authority_name": "Panama Maritime Authority"
    },
    "Documents": [
      {
        "id": "uuid",
        "document_type": "Class Certificate",
        "file_url": "https://..."
      }
    ],
    "JobRequests": [
      {
        "id": "uuid",
        "job_status": "CREATED",
        "reason": "Annual survey"
      }
    ],
    "Certificates": [
      {
        "id": "uuid",
        "certificate_number": "GIRIK-2026-0042",
        "status": "VALID"
      }
    ]
  }
}
```

---

## 5. PUT `/api/v1/vessels/:id`

> **Access:** `ADMIN`, `GM`, `TM`  
> Update vessel details.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "vessel_name": "MV Star Updated",
  "port_of_registry": "Singapore",
  "class_status": "ACTIVE",
  "current_class_society": "DNV GL"
}
```

All fields from create are optional here.

### Response `200 OK`
```json
{
  "success": true,
  "message": "Vessel updated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000005",
    "vessel_name": "MV Star Updated",
    "port_of_registry": "Singapore",
    "current_class_society": "DNV GL",
    "updated_at": "2026-03-05T19:00:00.000Z"
  }
}
```
