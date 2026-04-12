# 04 — Client Management APIs

**Base URL:** `/api/v1/clients`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/clients/profile`

> **Access:** `CLIENT` only  
> Get own client company profile.

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000060",
    "company_name": "ABC Shipping Ltd",
    "company_code": "ABC-001",
    "address": "Business Bay, Dubai, UAE",
    "country": "AE",
    "email": "info@abcshipping.com",
    "phone": "+971501234567",
    "contact_person_name": "Ahmed Ali",
    "contact_person_email": "ahmed@abcshipping.com",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## 2. PUT `/api/v1/clients/profile`

> **Access:** `CLIENT` only  
> Update own company profile.

### Request Body
```json
{
  "phone": "+971509999999",
  "contact_person_name": "Updated Contact",
  "address": "New Address"
}
```

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000060",
    "company_name": "ABC Shipping Ltd",
    "phone": "+971509999999",
    "contact_person_name": "Updated Contact",
    "address": "New Address"
  }
}
```

---

## 3. GET `/api/v1/clients/profile/documents`

> **Access:** `CLIENT` only  
> Get documents for own client company.

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "entity_type": "CLIENT",
      "entity_id": "019514a2-7e3b-7000-8000-000000000060",
      "document_type": "Registration Certificate",
      "description": "Company registration",
      "file_name": "reg_cert.pdf",
      "signedUrl": "https://signed-url...",
      "created_at": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 4. GET `/api/v1/clients/dashboard`

> **Access:** `CLIENT` only  
> Get client dashboard data.

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "totalVessels": 5,
    "activeJobs": 3,
    "pendingJobs": 2,
    "expiringSoon": 1,
    "recentJobs": [
      {
        "id": "uuid",
        "job_status": "CREATED",
        "reason": "Annual survey due",
        "target_date": "2026-04-15",
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "certificates": [
      {
        "id": "uuid",
        "certificate_number": "GR-CLASS-2026-0042",
        "status": "VALID",
        "expiry_date": "2031-01-15"
      }
    ]
  }
}
```

---

## 5. POST `/api/v1/clients`

> **Access:** `ADMIN`, `GM`, `TM`  
> Create a new client company (with optional user login).

### Request Body
```json
{
  "company_name": "New Shipping Corp",
  "company_code": "NSC-001",
  "email": "info@newshipping.com",
  "address": "Marina Walk, Dubai",
  "country": "AE",
  "phone": "+971504444444",
  "contact_person_name": "Mohammed",
  "contact_person_email": "mohammed@newshipping.com",
  "status": "ACTIVE",
  "user": {
    "name": "Mohammed Admin",
    "email": "mohammed@newshipping.com",
    "password": "Secure@123",
    "role": "CLIENT",
    "phone": "+971504444444"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `company_name` | string | ✅ | — |
| `company_code` | string | ✅ | Unique company code |
| `email` | string | ✅ | Valid email |
| `address` | string | optional | — |
| `country` | string | optional | — |
| `phone` | string | optional | — |
| `contact_person_name` | string | optional | — |
| `contact_person_email` | string | optional | Valid email |
| `status` | string | optional | `ACTIVE` or `INACTIVE` (default `ACTIVE`) |
| `user` | object | optional | Auto-create a login user for this client |
| `user.name` | string | ✅ (if user) | — |
| `user.email` | string | ✅ (if user) | Valid email |
| `user.password` | string | ✅ (if user) | Min 8, uppercase+lowercase+digit |
| `user.role` | string | optional | Default `CLIENT` |
| `user.phone` | string | optional | — |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000070",
    "company_name": "New Shipping Corp",
    "company_code": "NSC-001",
    "email": "info@newshipping.com",
    "address": "Marina Walk, Dubai",
    "country": "AE",
    "phone": "+971504444444",
    "contact_person_name": "Mohammed",
    "contact_person_email": "mohammed@newshipping.com",
    "status": "ACTIVE",
    "created_at": "2026-03-05T18:30:00.000Z"
  }
}
```

---

## 6. GET `/api/v1/clients`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`  
> List all clients.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `status` | string | optional | `ACTIVE` or `INACTIVE` |
| `search` | string | optional | Search by company name |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Clients fetched successfully",
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000060",
        "company_name": "ABC Shipping Ltd",
        "company_code": "ABC-001",
        "email": "info@abcshipping.com",
        "country": "AE",
        "phone": "+971501234567",
        "status": "ACTIVE",
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "count": 10
  }
}
```

---

## 7. GET `/api/v1/clients/:id`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Client details fetched successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000060",
    "company_name": "ABC Shipping Ltd",
    "company_code": "ABC-001",
    "address": "Business Bay, Dubai, UAE",
    "country": "AE",
    "email": "info@abcshipping.com",
    "phone": "+971501234567",
    "contact_person_name": "Ahmed Ali",
    "contact_person_email": "ahmed@abcshipping.com",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z",
    "Vessels": [
      {
        "id": "uuid",
        "vessel_name": "MV Star",
        "imo_number": "1234567"
      }
    ],
    "Users": [
      {
        "id": "uuid",
        "name": "Ahmed Ali",
        "email": "ahmed@abcshipping.com",
        "role": "CLIENT"
      }
    ]
  }
}
```

---

## 8. GET `/api/v1/clients/:id/documents`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "entity_type": "CLIENT",
      "entity_id": "019514a2-7e3b-7000-8000-000000000060",
      "document_type": "Registration Certificate",
      "description": "Company registration",
      "signedUrl": "https://signed-url...",
      "created_at": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 9. PUT `/api/v1/clients/:id`

> **Access:** `ADMIN`, `GM`, `TM`  
> Update client details.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "company_name": "Updated Shipping Ltd",
  "phone": "+971509999999",
  "status": "ACTIVE"
}
```

### Response `200 OK`
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000060",
    "company_name": "Updated Shipping Ltd",
    "phone": "+971509999999",
    "status": "ACTIVE"
  }
}
```

---

## 10. DELETE `/api/v1/clients/:id`

> **Access:** `ADMIN` only  
> Delete/deactivate a client.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "message": "Client deleted/deactivated successfully"
}
```
