# ADMIN Role — Part 2: Surveys, Certificates, Payments, Surveyors

> [← Part 1: Auth, Users, Clients, Vessels, Jobs](./ADMIN.md) | [Part 3: Everything Else →](./ADMIN_PART3.md)

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔍 SURVEY MANAGEMENT

### GET `/api/v1/surveys`
**Query:** `?page=1&limit=20`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "job_id": "uuid", "surveyor_id": "uuid",
        "survey_status": "SUBMITTED",
        "start_latitude": 25.2048, "start_longitude": 55.2708,
        "submit_latitude": 25.2050, "submit_longitude": 55.2710,
        "started_at": "2026-03-05T18:00:00.000Z",
        "submitted_at": "2026-03-05T20:00:00.000Z",
        "finalized_at": null,
        "attendance_photo_url": "https://...", "signature_url": "https://...",
        "evidence_proof_url": "https://...", "survey_statement": "Vessel inspected...",
        "submission_count": 1,
        "Surveyor": { "name": "John Surveyor" },
        "JobRequest": { "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }
      }
    ],
    "count": 50
  }
}
```

### GET `/api/v1/surveys/jobs/:jobId`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "job_id": "uuid", "surveyor_id": "uuid",
    "survey_status": "SUBMITTED",
    "start_latitude": 25.2048, "start_longitude": 55.2708,
    "submit_latitude": 25.2050, "submit_longitude": 55.2710,
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": "2026-03-05T20:00:00.000Z", "finalized_at": null,
    "attendance_photo_url": "https://...", "signature_url": "https://...",
    "evidence_proof_url": "https://...", "survey_statement": "Vessel inspected...",
    "submission_count": 1,
    "Surveyor": { "name": "John Surveyor" },
    "JobRequest": { "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }
  }
}
```

### GET `/api/v1/surveys/jobs/:jobId/timeline`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "event": "SURVEY_SRTED", "timestamp": "2026-03-05T18:00:00.000Z", "latitude": 25.2048, "longitude": 55.2708 },
    { "event": "CHECKLIST_SUBMITTED", "timestamp": "2026-03-05T19:00:00.000Z" },
    { "event": "PROOF_UPLOADED", "timestamp": "2026-03-05T19:30:00.000Z" },
    { "event": "SURVEY_SUBMITTED", "timestamp": "2026-03-05T20:00:00.000Z", "latitude": 25.2050, "longitude": 55.2710 }
  ]
}
```

### POST `/api/v1/surveys/jobs/:jobId/violation`
**Request:**
```json
{ "description": "Missing safety equipment on deck 2", "severity": "MAJOR" }
```
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "description": "Missing safety equipment on deck 2", "severity": "MAJOR", "flagged_by": "uuid", "created_at": "2026-03-05T20:30:00.000Z" } }
```

---

## 📜 CERTIFICATE MANAGEMENT

### GET `/api/v1/certificates/types`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "name": "Safety Management Certificate", "issuing_authority": "CLASS",
      "validity_years": 5, "status": "ACTIVE", "description": "SMC for ISM Code compliance",
      "requires_survey": true,
      "required_documents": [{ "document_name": "Class Certificate", "is_mandatory": true }]
    }
  ]
}
```

### POST `/api/v1/certificates/types` (ADMIN only)
**Request:**
```json
{
  "name": "International Ship Security Certificate",
  "issuing_authority": "CLASS", "validity_years": 5,
  "description": "ISSC under ISPS Code", "requires_survey": true,
  "required_documents": [{ "document_name": "Ship Security Plan", "is_mandatory": true }]
}
```
**Response `201`:**
```json
{
  "success": true, "message": "Certificate type created successfully",
  "data": { "id": "uuid", "name": "International Ship Security Certificate", "issuing_authority": "CLASS", "validity_years": 5, "status": "ACTIVE" }
}
```

### PUT `/api/v1/certificates/types/:id`
**Request:** `{ "validity_years": 3, "description": "Updated description" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "validity_years": 3, "description": "Updated description" } }
```

### GET `/api/v1/certificates`
**Query:** `?page=1&limit=20&status=VALID&vessel_id=uuid&certificate_type_id=uuid`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "vessel_id": "uuid",
        "certificate_type_id": "uuid", "issue_date": "2026-01-15", "expiry_date": "2031-01-15",
        "status": "VALID", "issued_by_user_id": "uuid",
        "qr_code_url": "https://...", "pdf_file_url": "https://...",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" }
      }
    ],
    "count": 300
  }
}
```


### POST `/api/v1/certificates` — Generate
**Request:** `{ "job_id": "uuid", "validity_years": 5 }`
**Response `201`:**
```json
{
  "success": true, "message": "Certificate generated successfully",
  "data": {
    "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "vessel_id": "uuid",
    "certificate_type_id": "uuid", "job_id": "uuid",
    "issue_date": "2026-03-05", "expiry_date": "2031-03-05", "status": "VALID",
    "issued_by_user_id": "uuid", "qr_code_url": "https://...", "pdf_file_url": "https://..."
  }
}
```

### PUT `/api/v1/certificates/:id/suspend`
**Request:** `{ "reason": "Pending investigation of safety breach" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate suspended.", "data": { "id": "uuid", "status": "SUSPENDED", "suspension_reason": "Pending investigation..." } }
```

### PUT `/api/v1/certificates/:id/revoke`
**Request:** `{ "reason": "Fraudulent documentation detected" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate revoked.", "data": { "id": "uuid", "status": "REVOKED" } }
```

### PUT `/api/v1/certificates/:id/restore`
**Request:** `{ "reason": "Investigation cleared — no issues found" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate restored.", "data": { "id": "uuid", "status": "VALID" } }
```

### PUT `/api/v1/certificates/:id/renew`
**Request:** `{ "validity_years": 5, "reason": "Standard renewal" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate renewed.", "data": { "id": "uuid", "status": "VALID", "issue_date": "2026-03-05", "expiry_date": "2031-03-05" } }
```

### POST `/api/v1/certificates/bulk-renew`
**Request:** `{ "ids": ["uuid-1", "uuid-2", "uuid-3"], "validity_years": 5, "reason": "Fleet renewal" }`
**Response `200`:**
```json
{ "success": true, "message": "3 certificates renewed.", "data": { "renewed": 3, "failed": 0 } }
```

### POST `/api/v1/certificates/:id/reissue`
**Request:** `{ "reason": "Original certificate damaged" }`
**Response `201`:**
```json
{ "success": true, "message": "Certificate reissued.", "data": { "id": "new-uuid", "certificate_number": "GR-CLASS-2026-0042-R1", "status": "VALID" } }
```

### POST `/api/v1/certificates/:id/sign`
**Request:** `{ "digital_signature": "ADMIN-SIGNATURE-KEY" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate signed.", "data": { "id": "uuid", "is_signed": true } }
```

### POST `/api/v1/certificates/:id/transfer`
**Request:** `{ "reason": "Vessel sold to new owner", "new_vessel_id": "uuid" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate transferred.", "data": { "id": "uuid", "vessel_id": "new-uuid" } }
```

### POST `/api/v1/certificates/:id/extend`
**Request:** `{ "reason": "COVID extension", "extension_months": 6 }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate extended.", "data": { "id": "uuid", "expiry_date": "2031-09-05" } }
```

### PUT `/api/v1/certificates/:id/downgrade`
**Request:** `{ "reason": "Ship class reduced" }`
**Response `200`:**
```json
{ "success": true, "message": "Certificate downgraded.", "data": { "id": "uuid", "status": "DOWNGRADED" } }
```

### GET `/:id`, `/:id/download`, `/:id/preview`, `/:id/signature`, `/:id/history`, `/vessel/:vesselId`, `/job/:jobId`, `/types/:id`
Same responses as CLIENT.md.

---

## 💰 PAYMENTS

### GET `/api/v1/payments`
**Query:** `?page=1&limit=20&payment_status=UNPAID`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      { "id": "uuid", "job_id": "uuid", "invoice_number": "INV-2026-001", "amount": "5000.00", "currency": "USD", "payment_status": "UNPAID", "payment_date": null, "receipt_url": null, "JobRequest": { "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } } }
    ],
    "count": 50
  }
}
```

### GET `/api/v1/payments/summary`
**Response `200`:**
```json
{ "success": true, "data": { "total_invoiced": "150000.00", "total_paid": "120000.00", "total_outstanding": "30000.00", "total_on_hold": "5000.00", "count_paid": 24, "count_unpaid": 6, "count_on_hold": 1 } }
```

### POST `/api/v1/payments/invoice`
**Request:** `{ "job_id": "uuid", "amount": 5000, "currency": "USD", "invoice_number": "INV-2026-001" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "invoice_number": "INV-2026-001", "amount": "5000.00", "currency": "USD", "payment_status": "UNPAID" } }
```

### PUT `/api/v1/payments/:id/pay` — `multipart/form-data`
Fields: `receipt` (file), `payment_date` (string)
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "payment_status": "PAID", "payment_date": "2026-03-05", "receipt_url": "https://...", "verified_by_user_id": "uuid" } }
```

### POST `/api/v1/payments/:id/refund`
**Request:** `{ "amount": 2000, "reason": "Job cancelled" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "refunded_amount": "2000.00" } }
```

### POST `/api/v1/payments/:id/partial`
**Request:** `{ "amount": 2500 }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "amount_paid": "2500.00", "remaining": "2500.00" } }
```

### GET `/api/v1/payments/:id/ledger`
**Response `200`:**
```json
{ "success": true, "data": [{ "action": "INVOICE_CREATED", "amount": "5000.00", "performed_by": "uuid", "timestamp": "2026-03-05T21:00:00.000Z" }, { "action": "PARTIAL_PAYMENT", "amount": "2000.00", "performed_by": "uuid", "timestamp": "2026-03-05T22:00:00.000Z" }] }
```

### POST `/api/v1/payments/writeoff` (ADMIN only)
**Request:** `{ "paymentId": "uuid", "reason": "Bad debt — company dissolved" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "payment_status": "WRITTEN_OFF" } }
```

---

## 👷 SURVEYOR MANAGEMENT

### POST `/api/v1/surveyors`
**Request:**
```json
{ "name": "John Surveyor", "email": "john@grclass.com", "password": "Secure@123", "phone": "+971501234567", "nationality": "UK", "qualifications": "Master Mariner" }
```
**Response `201`:**
```json
{
  "success": true, "message": "Surveyor created successfully",
  "data": {
    "user": { "id": "uuid", "name": "John Surveyor", "email": "john@grclass.com", "role": "SURVEYOR" },
    "profile": { "id": "uuid", "nationality": "UK", "qualifications": "Master Mariner" }
  }
}
```

### GET `/api/v1/surveyors/applications`
**Query:** `?status=PENDING&page=1&limit=20`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      { "id": "uuid", "full_name": "John Smith", "email": "john@example.com", "phone": "+971501234567", "nationality": "UK", "qualification": "Chief Engineer", "years_of_experience": 15, "status": "PENDING", "cv_url": "https://...", "created_at": "2026-03-05T18:00:00.000Z" }
    ],
    "count": 5
  }
}
```

### PUT `/api/v1/surveyors/applications/:id/review`
**Request:** `{ "status": "APPROVED", "remarks": "All credentials verified" }`
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `APPROVED`, `REJECTED`, `DOCUMENTS_REQUIRED` |
| `remarks` | string | optional | — |

**Response `200`:**
```json
{ "success": true, "message": "Application approved successfully", "data": { "id": "uuid", "status": "APPROVED", "remarks": "All credentials verified" } }
```

### GET `/api/v1/surveyors/:id/profile`
**Response `200`:**
```json
{
  "success": true, "message": "Profile fetched successfully",
  "data": {
    "id": "uuid", "user_id": "uuid", "nationality": "UK",
    "qualifications": "Master Mariner, Class 1 Certificate",
    "is_available": true, "last_known_latitude": 25.2048, "last_known_longitude": 55.2708,
    "User": { "id": "uuid", "name": "John Surveyor", "email": "john@grclass.com", "role": "SURVEYOR", "status": "ACTIVE" }
  }
}
```

### PUT `/api/v1/surveyors/:id/profile`
**Request:** `{ "nationality": "UAE", "qualifications": "Updated", "is_available": false }`
**Response `200`:**
```json
{ "success": true, "message": "Profile updated successfully", "data": { "id": "uuid", "nationality": "UAE", "qualifications": "Updated" } }
```

### GET `/api/v1/surveyors/:id/location-history`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "latitude": 25.2048, "longitude": 55.2708, "recorded_at": "2026-03-05T18:00:00.000Z" },
    { "latitude": 25.2050, "longitude": 55.2710, "recorded_at": "2026-03-05T19:00:00.000Z" }
  ]
}
```
