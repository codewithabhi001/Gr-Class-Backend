# CLIENT Role — All APIs with Full Schemas

> **CLIENT** = Ship Owner/Operator. Sees only own vessels, jobs, certificates.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE

### POST `/api/v1/auth/logout`
**Response `200`:**
```json
{ "message": "Logged out successfully", "accessToken": null, "refreshToken": null }
```

### GET `/api/v1/users/me`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "name": "Ahmed Ali", "email": "ahmed@abcshipping.com",
    "role": "CLIENT", "phone": "+971501234567", "status": "ACTIVE",
    "client_id": "uuid", "profile_pic_url": "https://...",
    "force_password_reset": false, "last_login_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z", "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
**Request:** `profile_pic` (file, image)
**Response `200`:**
```json
{ "success": true, "message": "Profile picture updated successfully", "data": { "id": "uuid", "profile_pic_url": "https://storage.grclass.com/profiles/new.jpg" } }
```

### PUT `/api/v1/users/fcm-token`
**Request:**
```json
{ "fcmToken": "firebase-device-token-string" }
```
**Response `200`:**
```json
{ "success": true, "message": "FCM token updated successfully", "data": { "id": "uuid", "fcm_token": "firebase-device-token-string" } }
```

---

## 🏢 CLIENT PROFILE (Self-Service)

### GET `/api/v1/clients/profile`
**Response `200`:**
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

### PUT `/api/v1/clients/profile`
**Request:**
```json
{ "phone": "+971509999999", "contact_person_name": "Updated Contact", "address": "New Address" }
```
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "company_name": "ABC Shipping Ltd",
    "phone": "+971509999999", "contact_person_name": "Updated Contact", "address": "New Address"
  }
}
```

### GET `/api/v1/clients/profile/documents`
**Response `200`:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid", "entity_type": "CLIENT", "entity_id": "uuid",
      "document_type": "Registration Certificate", "description": "Company registration",
      "file_name": "reg_cert.pdf", "signedUrl": "https://signed-url...",
      "created_at": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/v1/clients/dashboard`
**Response `200`:**
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
        "id": "uuid", "job_status": "CREATED", "reason": "Annual survey due",
        "target_date": "2026-04-15", "target_port": "Dubai Port",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" }
      }
    ],
    "certificates": [
      {
        "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID",
        "expiry_date": "2031-01-15",
        "Vessel": { "vessel_name": "MV Star" },
        "CertificateType": { "name": "SMC" }
      }
    ]
  }
}
```

---

## 🚢 VESSELS (Own Only)

### GET `/api/v1/vessels`
**Query:** `?page=1&limit=20&class_status=ACTIVE&search=star`
**Response `200`:**
```json
{
  "success": true,
  "message": "Vessels fetched successfully",
  "data": {
    "rows": [
      {
        "id": "uuid", "client_id": "uuid", "vessel_name": "MV Star",
        "imo_number": "1234567", "call_sign": "ABCD", "mmsi_number": "123456789",
        "flag_administration_id": "uuid", "port_of_registry": "Dubai",
        "year_built": 2015, "ship_type": "Bulk Carrier",
        "gross_tonnage": "50000.00", "net_tonnage": "30000.00", "deadweight": "85000.00",
        "class_status": "ACTIVE", "current_class_society": "Lloyd's Register",
        "engine_type": "MAN B&W 6S60ME-C8.5", "builder_name": "Hyundai Heavy Industries",
        "created_at": "2026-01-01T00:00:00.000Z", "updated_at": "2026-01-01T00:00:00.000Z",
        "Client": { "id": "uuid", "company_name": "ABC Shipping Ltd" },
        "FlagAdministration": { "id": "uuid", "flag_state_name": "Panama", "country": "PA" }
      }
    ],
    "count": 5
  }
}
```

### GET `/api/v1/vessels/:id`
**Response `200`:**
```json
{
  "success": true,
  "message": "Vessel details fetched successfully",
  "data": {
    "id": "uuid", "client_id": "uuid", "vessel_name": "MV Star",
    "imo_number": "1234567", "call_sign": "ABCD", "mmsi_number": "123456789",
    "port_of_registry": "Dubai", "year_built": 2015, "ship_type": "Bulk Carrier",
    "gross_tonnage": "50000.00", "net_tonnage": "30000.00", "deadweight": "85000.00",
    "class_status": "ACTIVE", "current_class_society": "Lloyd's Register",
    "engine_type": "MAN B&W 6S60ME-C8.5", "builder_name": "Hyundai Heavy Industries",
    "Client": { "id": "uuid", "company_name": "ABC Shipping Ltd" },
    "FlagAdministration": { "flag_state_name": "Panama", "country": "PA", "authority_name": "Panama Maritime Authority" },
    "Documents": [{ "id": "uuid", "document_type": "Class Certificate", "file_url": "https://..." }],
    "JobRequests": [{ "id": "uuid", "job_status": "CREATED", "reason": "Annual survey" }],
    "Certificates": [{ "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID" }]
  }
}
```

---

## 📋 JOBS

### POST `/api/v1/jobs` — Create Job
**Request:**
```json
{
  "vessel_id": "uuid",
  "certificate_type_id": "uuid",
  "reason": "Annual survey due for safety management certificate",
  "target_port": "Dubai Port, Jebel Ali",
  "target_date": "2026-04-15",
  "uploaded_documents": [
    { "required_document_id": "uuid", "file_url": "https://storage.grclass.com/uploads/doc1.pdf" }
  ]
}
```
| Field | Type | Required |
|-------|------|----------|
| `vessel_id` | UUID | ✅ |
| `certificate_type_id` | UUID | ✅ |
| `reason` | string | ✅ |
| `target_port` | string | ✅ |
| `target_date` | ISO date | ✅ |
| `uploaded_documents` | array | optional |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000100",
    "vessel_id": "uuid", "certificate_type_id": "uuid",
    "requested_by_user_id": "uuid",
    "reason": "Annual survey due for safety management certificate",
    "target_port": "Dubai Port, Jebel Ali", "target_date": "2026-04-15",
    "job_status": "CREATED", "priority": "NORMAL",
    "is_survey_required": true, "assigned_surveyor_id": null,
    "assigned_by_user_id": null, "approved_by_user_id": null,
    "generated_certificate_id": null, "remarks": null, "reschedule_count": 0,
    "created_at": "2026-03-05T18:30:00.000Z", "updated_at": "2026-03-05T18:30:00.000Z"
  }
}
```

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20&status=CREATED&priority=NORMAL&vessel_id=uuid`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "requested_by_user_id": "uuid",
        "certificate_type_id": "uuid", "reason": "Annual survey due",
        "target_port": "Dubai Port", "target_date": "2026-04-15",
        "job_status": "CREATED", "priority": "NORMAL", "is_survey_required": true,
        "assigned_surveyor_id": null, "reschedule_count": 0,
        "created_at": "2026-03-05T18:30:00.000Z",
        "Vessel": { "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "id": "uuid", "name": "Safety Management Certificate" },
        "requester": { "id": "uuid", "name": "Ahmed Ali" },
        "surveyor": null
      }
    ],
    "count": 5
  }
}
```

### GET `/api/v1/jobs/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "vessel_id": "uuid", "requested_by_user_id": "uuid",
    "certificate_type_id": "uuid", "reason": "Annual survey due",
    "target_port": "Dubai Port", "target_date": "2026-04-15",
    "job_status": "ASSIGNED", "priority": "NORMAL", "is_survey_required": true,
    "assigned_surveyor_id": "uuid", "assigned_by_user_id": "uuid",
    "approved_by_user_id": "uuid", "generated_certificate_id": null,
    "remarks": "Approved for survey", "reschedule_count": 0,
    "created_at": "2026-03-05T18:30:00.000Z", "updated_at": "2026-03-05T19:00:00.000Z",
    "Vessel": {
      "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567",
      "Client": { "company_name": "ABC Shipping Ltd" }
    },
    "CertificateType": { "name": "Safety Management Certificate" },
    "requester": { "id": "uuid", "name": "Ahmed Ali" },
    "surveyor": { "id": "uuid", "name": "John Surveyor" },
    "approver": { "id": "uuid", "name": "Admin User" },
    "survey": { "id": "uuid", "survey_status": "NOT_STARTED", "surveyor_id": "uuid" }
  }
}
```

### PUT `/api/v1/jobs/:id/cancel`
**Request:**
```json
{ "reason": "Vessel sale — no longer required" }
```
**Response `200`:**
```json
{
  "success": true,
  "message": "Job cancelled.",
  "data": { "id": "uuid", "job_status": "REJECTED", "updated_at": "2026-03-05T20:15:00.000Z" }
}
```

### GET `/api/v1/jobs/:id/messages/external`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "job_id": "uuid", "sender_id": "uuid",
      "message": "Documents have been uploaded for review.",
      "is_internal": false, "attachment_url": null,
      "created_at": "2026-03-05T18:35:00.000Z"
    }
  ]
}
```

### POST `/api/v1/jobs/:id/messages` — `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| `message` | string | ✅ |
| `attachment` | file | optional |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "job_id": "uuid", "sender_id": "uuid",
    "message": "Updated documents attached.", "is_internal": false,
    "attachment_url": "https://storage.grclass.com/messages/doc.pdf",
    "created_at": "2026-03-05T20:45:00.000Z"
  }
}
```

---

## 📜 CERTIFICATES (Own Vessels Only)

### GET `/api/v1/certificates`
**Query:** `?page=1&limit=20&status=VALID&vessel_id=uuid`
**Response `200`:**
```json
{
  "success": true,
  "message": "Certificates fetched successfully",
  "data": {
    "rows": [
      {
        "id": "uuid", "certificate_number": "GR-CLASS-2026-0042",
        "vessel_id": "uuid", "certificate_type_id": "uuid",
        "issue_date": "2026-01-15", "expiry_date": "2031-01-15",
        "status": "VALID", "issued_by_user_id": "uuid",
        "qr_code_url": "https://...", "pdf_file_url": "https://...",
        "created_at": "2026-01-15T00:00:00.000Z",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" }
      }
    ],
    "count": 10
  }
}
```

### GET `/api/v1/certificates/types`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "name": "Safety Management Certificate",
      "issuing_authority": "CLASS", "validity_years": 5,
      "status": "ACTIVE", "description": "SMC for ISM Code compliance",
      "requires_survey": true,
      "required_documents": [
        { "document_name": "Class Certificate", "is_mandatory": true },
        { "document_name": "Safety Equipment Cert", "is_mandatory": false }
      ]
    }
  ]
}
```

### GET `/api/v1/certificates/types/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "name": "Safety Management Certificate",
    "issuing_authority": "CLASS", "validity_years": 5, "status": "ACTIVE",
    "description": "SMC for ISM Code compliance", "requires_survey": true,
    "required_documents": [{ "document_name": "Class Certificate", "is_mandatory": true }]
  }
}
```

### GET `/api/v1/certificates/expiring`
**Query:** `?days=30`
**Response `200`:**
```json
{
  "success": true,
  "message": "Certificates expiring within 30 days fetched successfully",
  "data": {
    "expirations": [
      {
        "id": "uuid", "certificate_number": "GR-CLASS-2026-0010",
        "vessel_id": "uuid", "expiry_date": "2026-04-01", "status": "VALID",
        "Vessel": { "vessel_name": "MV Star" },
        "CertificateType": { "name": "SMC" }
      }
    ],
    "count": 3, "days": 30
  }
}
```

### GET `/api/v1/certificates/vessel/:vesselId`
**Response `200`:**
```json
{
  "success": true,
  "message": "Vessel certificates fetched successfully",
  "data": [
    { "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID", "issue_date": "2026-01-15", "expiry_date": "2031-01-15", "CertificateType": { "name": "SMC" } }
  ]
}
```

### GET `/api/v1/certificates/job/:jobId`
**Response `200`:**
```json
{ "success": true, "message": "Certificate for job fetched successfully", "data": { "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID", "issue_date": "2026-01-15", "expiry_date": "2031-01-15" } }
```

### GET `/api/v1/certificates/:id`
**Response `200`:**
```json
{
  "success": true,
  "message": "Certificate details fetched successfully",
  "data": {
    "id": "uuid", "certificate_number": "GR-CLASS-2026-0042",
    "vessel_id": "uuid", "certificate_type_id": "uuid", "job_id": "uuid",
    "issue_date": "2026-01-15", "expiry_date": "2031-01-15", "status": "VALID",
    "issued_by_user_id": "uuid", "qr_code_url": "https://...", "pdf_file_url": "https://...",
    "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
    "CertificateType": { "name": "SMC", "issuing_authority": "CLASS" }
  }
}
```

### GET `/api/v1/certificates/:id/download`
**Response `302`** → Redirects to signed PDF URL

### GET `/api/v1/certificates/:id/preview`
**Response `200`:**
```json
{
  "success": true, "message": "Certificate preview data fetched",
  "data": {
    "certificate_number": "GR-CLASS-2026-0042", "vessel_name": "MV Star",
    "imo_number": "1234567", "certificate_type": "Safety Management Certificate",
    "issue_date": "2026-01-15", "expiry_date": "2031-01-15", "issuing_authority": "CLASS"
  }
}
```

### GET `/api/v1/certificates/:id/signature`
**Response `200`:**
```json
{ "success": true, "message": "Certificate signature fetched", "data": { "public_key": "KEY-XYZ", "signature": "SHA256-SIG" } }
```

### GET `/api/v1/certificates/:id/history`
**Response `200`:**
```json
{
  "success": true, "message": "Certificate history fetched",
  "data": [
    { "action": "ISSUED", "performed_by": "uuid", "timestamp": "2026-01-15T00:00:00.000Z", "details": {} }
  ]
}
```

---

## 💰 PAYMENTS (Own Only)

### GET `/api/v1/payments`
**Query:** `?page=1&limit=20&payment_status=UNPAID`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "job_id": "uuid", "invoice_number": "INV-2026-001",
        "amount": "5000.00", "currency": "USD", "payment_status": "UNPAID",
        "payment_date": null, "receipt_url": null, "verified_by_user_id": null,
        "JobRequest": { "id": "uuid", "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }
      }
    ],
    "count": 3
  }
}
```

### GET `/api/v1/payments/summary`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_invoiced": "50000.00", "total_paid": "40000.00",
    "total_outstanding": "10000.00", "total_on_hold": "0.00",
    "count_paid": 8, "count_unpaid": 2, "count_on_hold": 0
  }
}
```

### GET `/api/v1/payments/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "job_id": "uuid", "invoice_number": "INV-2026-001",
    "amount": "5000.00", "currency": "USD", "payment_status": "UNPAID",
    "payment_date": null, "receipt_url": null, "verified_by_user_id": null,
    "JobRequest": { "id": "uuid", "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } },
    "verifier": null
  }
}
```

---

## 📂 DOCUMENTS

### GET `/api/v1/documents/get-upload-url`
**Query:** `?fileName=report.pdf&fileType=application/pdf&folder=documents`
**Response `200`:**
```json
{
  "success": true,
  "data": { "uploadUrl": "https://s3.../presigned?...", "fileKey": "documents/report.pdf", "expiresIn": 3600 }
}
```

### POST `/api/v1/documents/upload` — `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| `file` | file | ✅ |
| `folder` | string | optional |

**Response `201`:**
```json
{ "success": true, "data": { "fileKey": "misc/1709672200000-report.pdf", "url": "https://storage.grclass.com/misc/report.pdf" } }
```

### POST `/api/v1/documents/register`
**Request:**
```json
{ "fileKey": "uploads/abc/report.pdf", "fileType": "application/pdf", "document_type": "Survey Report", "description": "Final report" }
```
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "entity_type": "STANDALONE", "file_key": "uploads/abc/report.pdf", "document_type": "Survey Report" } }
```

### GET `/api/v1/documents/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "entity_type": "JOB", "entity_id": "uuid",
    "document_type": "Class Certificate", "description": "Current class certificate",
    "file_name": "class_cert.pdf", "signedUrl": "https://signed-url...",
    "created_at": "2026-01-15T00:00:00.000Z"
  }
}
```

### GET `/api/v1/documents/:entityType/:entityId`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "entity_type": "VESSEL", "entity_id": "uuid", "document_type": "Class Certificate", "signedUrl": "https://...", "created_at": "2026-01-15T00:00:00.000Z" }
  ]
}
```

### POST `/api/v1/documents/:entityType/:entityId` — `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| `files` | file(s) | ✅ |
| `document_type` | string | optional |
| `description` | string | optional |

**Response `201`:**
```json
{ "success": true, "count": 2, "data": [{ "id": "uuid", "entity_type": "VESSEL", "entity_id": "uuid", "document_type": "Class Certificate", "signedUrl": "https://..." }] }
```

---

## 🔔 NOTIFICATIONS

### GET `/api/v1/notifications`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "user_id": "uuid", "title": "Job Status Updated",
      "message": "Your job request for MV Star has been approved.",
      "type": "INFO", "is_read": false, "created_at": "2026-03-05T18:00:00.000Z"
    }
  ]
}
```

### PUT `/api/v1/notifications/:id/read`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "is_read": true } }
```

### PUT `/api/v1/notifications/read-all`
**Response `200`:**
```json
{ "success": true, "data": { "updated": 5 } }
```

---

## 📊 DASHBOARD

### GET `/api/v1/dashboard`
(Same as `/api/v1/clients/dashboard` response above.)

---

## 🎫 SUPPORT TICKETS

### POST `/api/v1/support`
**Request:**
```json
{ "subject": "Cannot upload documents", "description": "Getting 500 error when uploading PDF files for vessel MV Star.", "priority": "HIGH", "category": "Technical" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `subject` | string | ✅ | — |
| `description` | string | ✅ | — |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `category` | string | optional | — |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "user_id": "uuid", "subject": "Cannot upload documents",
    "description": "Getting 500 error...", "status": "OPEN",
    "priority": "HIGH", "category": "Technical",
    "resolved_at": null, "resolved_by": null,
    "created_at": "2026-03-05T18:00:00.000Z", "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### GET `/api/v1/support`
**Query:** `?page=1&limit=20&status=OPEN`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "user_id": "uuid", "subject": "Cannot upload documents",
        "description": "Getting 500 error...", "status": "OPEN", "priority": "HIGH",
        "category": "Technical", "created_at": "2026-03-05T18:00:00.000Z",
        "Creator": { "name": "Ahmed Ali", "email": "ahmed@abcshipping.com" }
      }
    ],
    "count": 2
  }
}
```

### GET `/api/v1/support/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "user_id": "uuid", "subject": "Cannot upload documents",
    "description": "Getting 500 error...", "status": "OPEN", "priority": "HIGH",
    "category": "Technical", "resolved_at": null, "resolved_by": null,
    "created_at": "2026-03-05T18:00:00.000Z",
    "Creator": { "name": "Ahmed Ali" }, "Resolver": null
  }
}
```

---

## ⭐ CUSTOMER FEEDBACK

### POST `/api/v1/customer-feedback`
**Request:**
```json
{
  "job_id": "uuid", "rating": 5, "timeliness": 4,
  "professionalism": 5, "documentation": 4, "remarks": "Excellent service!"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | — |
| `rating` | integer | ✅ | 1–5 |
| `timeliness` | integer | ✅ | 1–5 |
| `professionalism` | integer | ✅ | 1–5 |
| `documentation` | integer | ✅ | 1–5 |
| `remarks` | string | optional | — |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "job_id": "uuid", "client_id": "uuid",
    "rating": 5, "timeliness": 4, "professionalism": 5, "documentation": 4,
    "remarks": "Excellent service!", "submitted_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### GET `/api/v1/customer-feedback/job/:jobId`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "rating": 5, "timeliness": 4, "professionalism": 5, "documentation": 4, "remarks": "Excellent service!" } }
```

---

## 📝 ACTIVITY REQUESTS

### POST `/api/v1/activity-requests`
**Request:**
```json
{
  "vessel_id": "uuid", "activity_type": "INSPECTION",
  "requested_service": "Annual Safety Inspection", "priority": "HIGH",
  "description": "Annual safety inspection required before departure",
  "location_port": "Dubai Port", "proposed_date": "2026-04-10T00:00:00.000Z"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `vessel_id` | UUID | optional | — |
| `activity_type` | string | ✅ | `INSPECTION`, `AUDIT`, `TRAINING`, `VISIT`, `OTHER` |
| `requested_service` | string | optional | — |
| `priority` | string | optional | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `description` | string | optional | — |
| `location_port` | string | optional | — |
| `proposed_date` | ISO date | optional | — |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "request_number": "AR-2026-001", "requested_by": "uuid",
    "vessel_id": "uuid", "activity_type": "INSPECTION",
    "requested_service": "Annual Safety Inspection", "priority": "HIGH",
    "description": "Annual safety inspection required...",
    "location_port": "Dubai Port", "proposed_date": "2026-04-10T00:00:00.000Z",
    "status": "PENDING", "linked_job_id": null, "rejection_reason": null,
    "attachments": [], "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### GET `/api/v1/activity-requests`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "request_number": "AR-2026-001", "activity_type": "INSPECTION",
        "requested_service": "Annual Safety Inspection", "priority": "HIGH",
        "status": "PENDING", "proposed_date": "2026-04-10",
        "Requester": { "name": "Ahmed Ali" }, "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "count": 2
  }
}
```

### GET `/api/v1/activity-requests/:id`
Same structure as create response with associations.

---

## 🔄 CHANGE REQUESTS

### POST `/api/v1/change-requests`
**Request:**
```json
{
  "entity_type": "VESSEL", "entity_id": "uuid",
  "change_description": "Update port of registry from Dubai to Singapore",
  "old_value": { "port_of_registry": "Dubai" },
  "new_value": { "port_of_registry": "Singapore" }, "priority": "MEDIUM"
}
```
**Response `201`:**
```json
{
  "message": "Change request created successfully",
  "change_request": {
    "id": "uuid", "entity_type": "VESSEL", "entity_id": "uuid",
    "requested_by": "uuid", "change_description": "Update port of registry...",
    "old_value": { "port_of_registry": "Dubai" }, "new_value": { "port_of_registry": "Singapore" },
    "status": "PENDING", "priority": "MEDIUM", "approved_by": null,
    "approval_remarks": null, "approved_at": null, "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 🚨 INCIDENTS

### POST `/api/v1/incidents`
**Request:**
```json
{ "vessel_id": "uuid", "title": "Engine Room Fire Alarm", "description": "Smoke detected in engine room starboard side at 14:30 local time." }
```
| Field | Type | Required |
|-------|------|----------|
| `vessel_id` | UUID | ✅ |
| `title` | string | ✅ |
| `description` | string | ✅ |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "vessel_id": "uuid", "reported_by": "uuid",
    "title": "Engine Room Fire Alarm", "description": "Smoke detected...",
    "status": "OPEN", "remarks": null,
    "created_at": "2026-03-05T18:00:00.000Z", "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### GET `/api/v1/incidents`
**Query:** `?page=1&limit=20&status=OPEN&vessel_id=uuid`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "reported_by": "uuid",
        "title": "Engine Room Fire Alarm", "description": "Smoke detected...",
        "status": "OPEN", "remarks": null, "created_at": "2026-03-05T18:00:00.000Z",
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "User": { "name": "Ahmed Ali" }
      }
    ],
    "count": 1
  }
}
```

### GET `/api/v1/incidents/:id`
Same full incident object with associations.

---

## 🛡️ COMPLIANCE

### GET `/api/v1/compliance/export/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "Ahmed Ali", "email": "ahmed@abcshipping.com", "role": "CLIENT", "phone": "+971501234567", "status": "ACTIVE" },
    "client": { "company_name": "ABC Shipping", "company_code": "ABC-001" },
    "activity_logs": [...], "notifications": [...], "support_tickets": [...]
  }
}
```

---

## 🔍 SEARCH

### GET `/api/v1/search?q=star`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "vessels": [{ "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567", "class_status": "ACTIVE", "Client": { "company_name": "ABC Shipping" } }],
    "jobs": [{ "id": "uuid", "job_status": "ASSIGNED", "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }],
    "certificates": [{ "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID", "Vessel": { "vessel_name": "MV Star" } }],
    "clients": []
  }
}
```

---

## ✅ CHECKLISTS

### GET `/api/v1/checklists/jobs/:jobId`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid", "template_id": "uuid", "status": "SUBMITTED",
    "items": [
      { "id": "uuid", "question_code": "FS-001", "question_text": "Fire extinguishers inspected?", "answer": "YES", "remarks": "All good", "file_url": "https://...", "created_at": "2026-03-05T19:00:00.000Z" },
      { "id": "uuid", "question_code": "FS-002", "question_text": "Fire alarm functional?", "answer": "NO", "remarks": "Deck 3 faulty", "file_url": null, "created_at": "2026-03-05T19:01:00.000Z" }
    ]
  }
}
```
