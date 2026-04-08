# 08 — Certificate Management APIs

**Base URL:** `/api/v1/certificates`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. POST `/api/v1/certificates`

> **Access:** `ADMIN`, `GM`, `TM`  
> Generate a certificate for a finalized job.

### Request Body
```json
{
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "validity_years": 5
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | Job must be in FINALIZED or PAYMENT_DONE status |
| `validity_years` | integer | optional | 1–10 (uses cert type default if not specified) |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000300",
    "certificate_number": "GIRIK-2026-0042",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "issue_date": "2026-03-05",
    "expiry_date": "2031-03-05",
    "status": "VALID",
    "issued_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "qr_code_url": "https://storage.grclass.com/qr/GIRIK-2026-0042.png",
    "pdf_file_url": "https://storage.grclass.com/certs/GIRIK-2026-0042.pdf",
    "created_at": "2026-03-05T21:30:00.000Z"
  }
}
```

---

## 2. GET `/api/v1/certificates`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> List all certificates.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `status` | string | optional | `VALID`, `EXPIRED`, `SUSPENDED`, `REVOKED` |
| `vessel_id` | UUID | optional | Filter by vessel |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificates fetched successfully",
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000300",
        "certificate_number": "GIRIK-2026-0042",
        "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
        "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
        "issue_date": "2026-01-15",
        "expiry_date": "2031-01-15",
        "status": "VALID",
        "issued_by_user_id": "uuid",
        "qr_code_url": "https://...",
        "pdf_file_url": "https://...",
        "created_at": "2026-01-15T00:00:00.000Z",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" }
      }
    ],
    "count": 50
  }
}
```

---

## 3. GET `/api/v1/certificates/types`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> List all certificate types.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `include_inactive` | boolean | optional | Only ADMIN/GM can see inactive |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "019514a2-7e3b-7000-8000-000000000020",
      "name": "Safety Management Certificate",
      "issuing_authority": "CLASS",
      "validity_years": 5,
      "status": "ACTIVE",
      "description": "SMC for ISM Code compliance",
      "requires_survey": true,
      "required_documents": [
        { "document_name": "Class Certificate", "is_mandatory": true },
        { "document_name": "Safety Equipment Cert", "is_mandatory": false }
      ]
    }
  ]
}
```

---

## 4. GET `/api/v1/certificates/types/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000020",
    "name": "Safety Management Certificate",
    "issuing_authority": "CLASS",
    "validity_years": 5,
    "status": "ACTIVE",
    "description": "SMC for ISM Code compliance",
    "requires_survey": true,
    "required_documents": [...]
  }
}
```

---

## 5. POST `/api/v1/certificates/types`

> **Access:** `ADMIN` only  
> Create a new certificate type.

### Request Body
```json
{
  "name": "Safety Management Certificate",
  "issuing_authority": "CLASS",
  "validity_years": 5,
  "status": "ACTIVE",
  "description": "SMC for ISM Code compliance",
  "requires_survey": true,
  "required_documents": [
    { "document_name": "Class Certificate", "is_mandatory": true },
    { "document_name": "Safety Equipment Certificate", "is_mandatory": false }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `issuing_authority` | string | ✅ | `CLASS` or `FLAG` |
| `validity_years` | integer | ✅ | 1–10 |
| `status` | string | optional | `ACTIVE` or `INACTIVE` (default `ACTIVE`) |
| `description` | string | optional | — |
| `requires_survey` | boolean | optional | Default `true` |
| `required_documents` | array | optional | Array of required document definitions |
| `required_documents[].document_name` | string | ✅ (if doc) | — |
| `required_documents[].is_mandatory` | boolean | ✅ (if doc) | — |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Certificate type created",
  "data": {
    "id": "uuid",
    "name": "Safety Management Certificate",
    "issuing_authority": "CLASS",
    "validity_years": 5,
    "status": "ACTIVE"
  }
}
```

---

## 6. PUT `/api/v1/certificates/types/:id`

> **Access:** `ADMIN`, `TM`  
> Same body as create (all fields optional).

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate type updated",
  "data": { "id": "uuid", "name": "Updated Name", "..." : "..." }
}
```

---

## 7. GET `/api/v1/certificates/expiring`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | number | optional | Default 30 |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificates expiring within 30 days fetched successfully",
  "data": {
    "expirations": [
      {
        "id": "uuid",
        "certificate_number": "GIRIK-2026-0010",
        "vessel_id": "uuid",
        "expiry_date": "2026-04-01",
        "status": "VALID",
        "Vessel": { "vessel_name": "MV Star" },
        "CertificateType": { "name": "SMC" }
      }
    ],
    "count": 3,
    "days": 30
  }
}
```

---

## 8. GET `/api/v1/certificates/vessel/:vesselId`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `vesselId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Vessel certificates fetched successfully",
  "data": [
    {
      "id": "uuid",
      "certificate_number": "GIRIK-2026-0042",
      "status": "VALID",
      "issue_date": "2026-01-15",
      "expiry_date": "2031-01-15",
      "CertificateType": { "name": "SMC" }
    }
  ]
}
```

---

## 9. GET `/api/v1/certificates/job/:jobId`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate for job fetched successfully",
  "data": {
    "id": "uuid",
    "certificate_number": "GIRIK-2026-0042",
    "status": "VALID",
    "issue_date": "2026-01-15",
    "expiry_date": "2031-01-15"
  }
}
```

---

## 10. GET `/api/v1/certificates/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate details fetched successfully",
  "data": {
    "id": "uuid",
    "certificate_number": "GIRIK-2026-0042",
    "vessel_id": "uuid",
    "certificate_type_id": "uuid",
    "job_id": "uuid",
    "issue_date": "2026-01-15",
    "expiry_date": "2031-01-15",
    "status": "VALID",
    "issued_by_user_id": "uuid",
    "qr_code_url": "https://...",
    "pdf_file_url": "https://...",
    "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
    "CertificateType": { "name": "SMC", "issuing_authority": "CLASS" }
  }
}
```

---

## 11. GET `/api/v1/certificates/:id/download`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`  
> Returns 302 redirect to the signed PDF URL.

### Response `302 Redirect` → PDF download URL

### Response `404` (if PDF not available)
```json
{
  "success": false,
  "message": "Certificate PDF is not available for download yet."
}
```

---

## 12. GET `/api/v1/certificates/:id/preview`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`  
> Preview certificate data for rendering.

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate preview data fetched",
  "data": {
    "certificate_number": "GIRIK-2026-0042",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "certificate_type": "Safety Management Certificate",
    "issue_date": "2026-01-15",
    "expiry_date": "2031-01-15",
    "issuing_authority": "CLASS"
  }
}
```

---

## 13. GET `/api/v1/certificates/:id/history`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate history fetched",
  "data": [
    {
      "action": "ISSUED",
      "performed_by": "uuid",
      "timestamp": "2026-01-15T00:00:00.000Z",
      "details": {}
    },
    {
      "action": "RENEWED",
      "performed_by": "uuid",
      "timestamp": "2026-06-15T00:00:00.000Z",
      "details": { "new_expiry": "2031-06-15" }
    }
  ]
}
```

---

## 14. GET `/api/v1/certificates/:id/signature`

> **Access:** `ADMIN`, `GM`, `TM`, `TO`

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate signature fetched",
  "data": {
    "public_key": "KEY-XYZ",
    "signature": "SHA256-SIG"
  }
}
```

---

## 15. POST `/api/v1/certificates/:id/sign`

> **Access:** `ADMIN`, `GM`  
> Digitally sign a certificate.

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate signed successfully",
  "data": {
    "signature": "SHA256-SIG"
  }
}
```

---

## 16. PUT `/api/v1/certificates/:id/suspend`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "reason": "Pending investigation — vessel detained at port"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate suspended successfully",
  "data": {
    "id": "uuid",
    "status": "SUSPENDED",
    "updated_at": "2026-03-05T22:00:00.000Z"
  }
}
```

---

## 17. PUT `/api/v1/certificates/:id/revoke`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "reason": "Major non-conformity found — safety systems failed inspection"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": { "id": "uuid", "status": "REVOKED" }
}
```

---

## 18. PUT `/api/v1/certificates/:id/restore`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "reason": "Investigation complete — all issues resolved"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate restored successfully",
  "data": { "id": "uuid", "status": "VALID" }
}
```

---

## 19. PUT `/api/v1/certificates/:id/renew`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "validity_years": 5,
  "reason": "Standard renewal — previous certificate expiring soon"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `validity_years` | integer | ✅ | 1–10 |
| `reason` | string | ✅ | — |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate renewed successfully",
  "data": { "id": "uuid", "status": "VALID", "expiry_date": "2031-03-05" }
}
```

---

## 20. POST `/api/v1/certificates/bulk-renew`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"],
  "validity_years": 5,
  "reason": "Batch renewal for fleet certificates"
}
```

| Field | Type | Required |
|-------|------|----------|
| `ids` | array of UUID | ✅ |
| `validity_years` | integer | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "renewed": 3,
    "results": [
      { "id": "uuid-1", "status": "VALID", "expiry_date": "2031-03-05" },
      { "id": "uuid-2", "status": "VALID", "expiry_date": "2031-03-05" },
      { "id": "uuid-3", "status": "VALID", "expiry_date": "2031-03-05" }
    ]
  }
}
```

---

## 21. POST `/api/v1/certificates/:id/reissue`

> **Access:** `ADMIN`, `TM`

### Request Body
```json
{
  "reason": "Original certificate lost during transit"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate reissued successfully",
  "data": { "id": "uuid", "certificate_number": "GIRIK-2026-0042-R1" }
}
```

---

## 22. POST `/api/v1/certificates/:id/transfer`

> **Access:** `ADMIN`, `GM`

### Request Body
```json
{
  "newOwnerId": "uuid-of-new-client",
  "reason": "Vessel sold to new owner"
}
```

| Field | Type | Required |
|-------|------|----------|
| `newOwnerId` | UUID | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate transferred successfully",
  "data": { "id": "uuid", "vessel_id": "uuid" }
}
```

---

## 23. POST `/api/v1/certificates/:id/extend`

> **Access:** `ADMIN`, `GM`

### Request Body
```json
{
  "extensionMonths": 6,
  "reason": "Extension granted due to COVID port restrictions"
}
```

| Field | Type | Required |
|-------|------|----------|
| `extensionMonths` | integer | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate extension applied successfully",
  "data": { "id": "uuid", "expiry_date": "2031-09-05" }
}
```

---

## 24. PUT `/api/v1/certificates/:id/downgrade`

> **Access:** `ADMIN`, `GM`

### Request Body
```json
{
  "newTypeId": "uuid-of-lower-cert-type",
  "reason": "Conditions for full certification not met"
}
```

| Field | Type | Required |
|-------|------|----------|
| `newTypeId` | UUID | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Certificate downgraded successfully",
  "data": { "id": "uuid", "certificate_type_id": "uuid-of-lower-cert-type" }
}
```
