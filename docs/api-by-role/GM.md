# GM (General Manager) Role — All APIs with Full Schemas

> **GM** manages operations — approves jobs, assigns surveyors, oversees payments, manages clients.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE

### POST `/api/v1/auth/logout`
**Response `200`:** `{ "message": "Logged out successfully", "accessToken": null, "refreshToken": null }`

### GET `/api/v1/users/me`
**Response `200`:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "GM User", "email": "gm@girik.com", "role": "GM", "phone": "+971502222222", "status": "ACTIVE", "client_id": null, "profile_pic_url": null, "last_login_at": "2026-03-05T08:00:00.000Z" }
}
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "profile_pic_url": "https://..." } }`

### PUT `/api/v1/users/fcm-token`
**Request:** `{ "fcmToken": "token" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "fcm_token": "token" } }`

---

## 🏢 CLIENT MANAGEMENT

### POST `/api/v1/clients`
**Request:**
```json
{
  "company_name": "New Shipping Corp", "company_code": "NSC-001",
  "email": "info@newshipping.com", "address": "Marina Walk, Dubai", "country": "AE",
  "phone": "+971504444444", "contact_person_name": "Mohammed",
  "user": { "name": "Mohammed", "email": "mohammed@newshipping.com", "password": "Secure@123", "role": "CLIENT" }
}
```
**Response `201`:**
```json
{
  "success": true, "message": "Client created successfully",
  "data": {
    "client": { "id": "uuid", "company_name": "New Shipping Corp", "company_code": "NSC-001", "status": "ACTIVE", "created_at": "2026-03-05T18:00:00.000Z" },
    "user": { "id": "uuid", "name": "Mohammed", "email": "mohammed@newshipping.com", "role": "CLIENT", "status": "ACTIVE" }
  }
}
```

### GET `/api/v1/clients`
**Query:** `?page=1&limit=20&status=ACTIVE&search=abc`
**Response `200`:**
```json
{
  "success": true, "data": {
    "rows": [
      { "id": "uuid", "company_name": "ABC Shipping Ltd", "company_code": "ABC-001", "email": "info@abcshipping.com", "phone": "+971501234567", "country": "AE", "status": "ACTIVE", "created_at": "2026-01-01T00:00:00.000Z" }
    ],
    "count": 30
  }
}
```

### GET `/api/v1/clients/:id`
**Response `200`:**
```json
{
  "success": true, "data": {
    "id": "uuid", "company_name": "ABC Shipping Ltd", "company_code": "ABC-001",
    "address": "Business Bay, Dubai", "country": "AE", "email": "info@abcshipping.com",
    "phone": "+971501234567", "contact_person_name": "Ahmed Ali", "status": "ACTIVE",
    "Users": [{ "id": "uuid", "name": "Ahmed Ali", "email": "ahmed@abcshipping.com", "role": "CLIENT" }],
    "Vessels": [{ "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567" }]
  }
}
```

### PUT `/api/v1/clients/:id`
**Request:** `{ "phone": "+971509999999", "contact_person_name": "Updated" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "phone": "+971509999999", "contact_person_name": "Updated" } }`

---

## 🚢 VESSEL MANAGEMENT

### POST `/api/v1/vessels`
**Request:**
```json
{
  "client_id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567",
  "flag_administration_id": "uuid", "ship_type": "Bulk Carrier",
  "call_sign": "ABCD", "mmsi_number": "123456789", "port_of_registry": "Dubai",
  "year_built": 2015, "gross_tonnage": 50000, "net_tonnage": 30000, "deadweight": 85000,
  "class_status": "ACTIVE", "current_class_society": "Lloyd's Register"
}
```
**Response `201`:**
```json
{
  "success": true, "message": "Vessel created successfully",
  "data": { "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567", "class_status": "ACTIVE", "created_at": "2026-03-05T18:00:00.000Z" }
}
```

### GET `/api/v1/vessels` | GET `/api/v1/vessels/client/:clientId` | GET `/api/v1/vessels/:id`
Same responses as CLIENT role docs (see CLIENT.md).

### PUT `/api/v1/vessels/:id`
**Request:** `{ "port_of_registry": "Singapore", "class_status": "SUSPENDED" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "port_of_registry": "Singapore", "class_status": "SUSPENDED" } }`

---

## 📋 JOB WORKFLOW

### POST `/api/v1/jobs`
Same as CLIENT (see CLIENT.md).

### GET `/api/v1/jobs` | GET `/api/v1/jobs/:id`
Same responses as CLIENT but returns ALL jobs (not scoped).

### PUT `/api/v1/jobs/:id/approve-request`
**Request:** `{ "remarks": "Documents verified, approved for survey" }`
**Response `200`:**
```json
{ "success": true, "message": "Job approved.", "data": { "id": "uuid", "job_status": "APPROVED", "approved_by_user_id": "uuid", "updated_at": "2026-03-05T19:00:00.000Z" } }
```

### PUT `/api/v1/jobs/:id/finalize`
**Request:** `{ "remarks": "Non-survey job finalized" }`
**Response `200`:**
```json
{ "success": true, "message": "Job finalized.", "data": { "id": "uuid", "job_status": "FINALIZED", "updated_at": "2026-03-05T19:00:00.000Z" } }
```

### PUT `/api/v1/jobs/:id/assign`
**Request:** `{ "surveyorId": "uuid" }`
**Response `200`:**
```json
{ "success": true, "message": "Surveyor assigned.", "data": { "id": "uuid", "job_status": "ASSIGNED", "assigned_surveyor_id": "uuid", "assigned_by_user_id": "uuid" } }
```

### PUT `/api/v1/jobs/:id/reassign`
**Request:** `{ "surveyorId": "uuid", "reason": "Original surveyor unavailable" }`
**Response `200`:**
```json
{ "success": true, "message": "Surveyor reassigned.", "data": { "id": "uuid", "assigned_surveyor_id": "uuid" } }
```

### PUT `/api/v1/jobs/:id/reschedule`
**Request:** `{ "new_target_date": "2026-05-10", "new_target_port": "Mumbai Port", "reason": "Vessel delayed" }`
**Response `200`:**
```json
{ "success": true, "message": "Job rescheduled.", "data": { "id": "uuid", "target_date": "2026-05-10", "target_port": "Mumbai Port", "reschedule_count": 1 } }
```

### PUT `/api/v1/jobs/:id/reject`
**Request:** `{ "reason": "Incomplete documentation" }`
**Response `200`:**
```json
{ "success": true, "message": "Job rejected.", "data": { "id": "uuid", "job_status": "REJECTED", "remarks": "Incomplete documentation" } }
```

### PUT `/api/v1/jobs/:id/cancel`
**Request:** `{ "reason": "Cancelled by management" }`
**Response `200`:**
```json
{ "success": true, "message": "Job cancelled.", "data": { "id": "uuid", "job_status": "REJECTED" } }
```

### PUT `/api/v1/jobs/:id/priority`
**Request:** `{ "priority": "URGENT", "reason": "Client escalation" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "priority": "URGENT" } }
```

### GET `/api/v1/jobs/:id/history`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "job_id": "uuid", "from_status": "CREATED", "to_status": "DOCUMENT_VERIFIED", "remarks": null, "changed_by_user_id": "uuid", "created_at": "2026-03-05T18:30:00.000Z", "user": { "name": "TO User" } },
    { "id": "uuid", "job_id": "uuid", "from_status": "DOCUMENT_VERIFIED", "to_status": "APPROVED", "remarks": "Approved for survey", "changed_by_user_id": "uuid", "created_at": "2026-03-05T19:00:00.000Z", "user": { "name": "GM User" } }
  ]
}
```

### POST `/api/v1/jobs/:id/notes`
**Request:** `{ "note": "Called client to confirm vessel location." }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "user_id": "uuid", "note": "Called client to confirm vessel location.", "created_at": "2026-03-05T19:30:00.000Z" } }
```

### Messages
Same as CLIENT (see CLIENT.md) — GM also has access to `/messages/internal`.

---

## 🔍 SURVEYS

### GET `/api/v1/surveys` | GET `/api/v1/surveys/jobs/:jobId` | GET `/api/v1/surveys/jobs/:jobId/timeline`
Same responses as SURVEYOR role docs.

### PUT `/api/v1/surveys/jobs/:jobId/rework`
**Request:** `{ "reason": "Checklist section 3 incomplete, photos missing for fire safety" }`
**Response `200`:**
```json
{ "success": true, "message": "Rework requested.", "data": { "id": "uuid", "survey_status": "REWORK_REQUIRED", "updated_at": "2026-03-05T21:00:00.000Z" } }
```

---

## 📜 CERTIFICATES

### POST `/api/v1/certificates`
**Request:** `{ "job_id": "uuid", "validity_years": 5 }`
**Response `201`:**
```json
{
  "success": true, "message": "Certificate generated successfully",
  "data": { "id": "uuid", "certificate_number": "GIRIK-2026-0042", "status": "VALID", "issue_date": "2026-03-05", "expiry_date": "2031-03-05", "qr_code_url": "https://...", "pdf_file_url": "https://..." }
}
```

### POST `/api/v1/certificates/:id/sign`
**Request:** `{ "digital_signature": "ADMIN-GM-SIGNATURE" }`
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
**Request:** `{ "reason": "COVID extension granted", "extension_months": 6 }`
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

All GET certificate endpoints — same as CLIENT.

---

## 💰 PAYMENTS

### POST `/api/v1/payments/invoice`
**Request:** `{ "job_id": "uuid", "amount": 5000, "currency": "USD", "invoice_number": "INV-2026-001" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "invoice_number": "INV-2026-001", "amount": "5000.00", "currency": "USD", "payment_status": "UNPAID" } }
```

### PUT `/api/v1/payments/:id/pay` — `multipart/form-data`
**Request:** `receipt` (file), `payment_date` (string)
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "payment_status": "PAID", "payment_date": "2026-03-05", "receipt_url": "https://...", "verified_by_user_id": "uuid" } }
```

### POST `/api/v1/payments/:id/refund`
**Request:** `{ "amount": 2000, "reason": "Job cancelled after partial payment" }`
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
{
  "success": true,
  "data": [
    { "action": "INVOICE_CREATED", "amount": "5000.00", "performed_by": "uuid", "timestamp": "2026-03-05T21:00:00.000Z" },
    { "action": "PARTIAL_PAYMENT", "amount": "2000.00", "performed_by": "uuid", "timestamp": "2026-03-05T22:00:00.000Z" }
  ]
}
```

GET `/payments`, `/payments/summary`, `/payments/:id` — same as CLIENT.

---

## 📂 DOCUMENTS
Full access — same schemas as CLIENT, plus:

### DELETE `/api/v1/documents/:id`
**Response `200`:** `{ "success": true, "message": "Document deleted" }`

---

## 📊 DASHBOARD

### GET `/api/v1/dashboard`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalClients": 30, "totalVessels": 200, "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "DOCUMENT_VERIFIED": 5, "APPROVED": 8, "ASSIGNED": 12, "SURVEY_AUTHORIZED": 3, "IN_PROGRESS": 7, "SURVEY_DONE": 4, "REVIEWED": 2, "REWORK_REQUESTED": 1, "FINALIZED": 15, "PAYMENT_DONE": 20, "CERTIFIED": 400, "REJECTED": 13 },
    "totalCertificates": 300, "pendingApprovals": 5, "pendingPayments": 50,
    "recentActivity": [{ "action": "JOB_CREATED", "entity_type": "JOB", "entity_id": "uuid", "performed_by": "Client User", "timestamp": "2026-03-05T18:00:00.000Z" }]
  }
}
```

---

## 📈 REPORTS

### GET `/api/v1/reports/certificates`
**Query:** `?from_date=2026-01-01&to_date=2026-12-31&status=VALID`
**Response `200`:**
```json
{ "total": 150, "by_status": { "VALID": 120, "EXPIRED": 20, "SUSPENDED": 5, "REVOKED": 5 }, "by_type": [{ "certificate_type": "SMC", "count": 50 }], "certificates": [{ "id": "uuid", "certificate_number": "GIRIK-2026-0042", "vessel_name": "MV Star", "status": "VALID", "issue_date": "2026-01-15", "expiry_date": "2031-01-15" }] }
```

### GET `/api/v1/reports/surveyors`
**Response `200`:**
```json
{ "total_surveyors": 25, "active_surveyors": 18, "total_surveys_completed": 200, "surveyors": [{ "id": "uuid", "name": "John Surveyor", "total_surveys": 30, "average_completion_days": 2.5, "rework_count": 1, "rating": 4.8 }] }
```

### GET `/api/v1/reports/non-conformities`
**Response `200`:**
```json
{ "total": 45, "by_severity": { "MINOR": 20, "MAJOR": 20, "CRITICAL": 5 }, "by_status": { "OPEN": 15, "CLOSED": 30 }, "items": [{ "id": "uuid", "description": "Fire extinguisher expired", "severity": "MAJOR", "status": "CLOSED", "vessel": "MV Star" }] }
```

### GET `/api/v1/reports/financials`
**Response `200`:**
```json
{ "total_invoiced": "250000.00", "total_collected": "200000.00", "outstanding": "50000.00", "by_month": [{ "month": "2026-01", "invoiced": "50000.00", "collected": "45000.00" }], "by_client": [{ "client": "ABC Shipping", "invoiced": "80000.00", "paid": "70000.00" }] }
```

---

## OTHER MODULES (Full Schemas)

### Support — PUT `/api/v1/support/:id/status`
**Request:** `{ "status": "RESOLVED", "internal_note": "Fixed the issue" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "RESOLVED", "resolved_at": "2026-03-06T10:00:00.000Z", "resolved_by": "uuid" } }`

### Approvals — POST `/api/v1/approvals`
**Request:** `{ "entity_type": "JOB", "entity_id": "uuid", "steps": [{ "role": "TO", "order": 1 }, { "role": "TM", "order": 2 }] }`
**Response `201`:** `{ "id": "uuid", "entity_type": "JOB", "entity_id": "uuid", "status": "PENDING", "steps": [{ "id": "uuid", "role": "TO", "order": 1, "status": "PENDING" }] }`

### Approvals — PUT `/api/v1/approvals/:id/step`
**Request:** `{ "status": "APPROVED" }`
**Response `200`:** `{ "id": "uuid", "status": "APPROVED", "current_step": 2, "overall_status": "PENDING" }`

### Activity Requests — PUT `/api/v1/activity-requests/:id/status`
**Request:** `{ "status": "APPROVED", "remarks": "Converting to job" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "APPROVED" } }`

### Change Requests — PUT `/api/v1/change-requests/:id/approve`
**Request:** `{ "remarks": "Approved — registry updated" }`
**Response `200`:** `{ "message": "Change request approved", "change_request": { "id": "uuid", "status": "APPROVED", "approved_by": "uuid", "approval_remarks": "Approved", "approved_at": "2026-03-06T10:00:00.000Z" } }`

### Change Requests — PUT `/api/v1/change-requests/:id/reject`
**Request:** `{ "remarks": "Insufficient documentation" }`
**Response `200`:** `{ "message": "Change request rejected", "change_request": { "id": "uuid", "status": "REJECTED", "approval_remarks": "Insufficient documentation" } }`

### Incidents — PUT `/api/v1/incidents/:id/status`
**Request:** `{ "status": "INVESTIGATING", "remarks": "Team dispatched" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "INVESTIGATING", "remarks": "Team dispatched" } }`

### Contact — GET `/api/v1/contact`
**Response `200`:**
```json
{ "success": true, "total": 25, "data": [{ "id": "uuid", "full_name": "John Smith", "company": "Smith Shipping", "corporate_email": "john@smith.com", "subject": "Fleet inquiry", "status": "NEW", "created_at": "2026-03-05T18:00:00.000Z" }] }
```

### Contact — PATCH `/api/v1/contact/:id/status`
**Request:** `{ "status": "REPLIED", "internal_note": "Sent proposal via email" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "REPLIED", "replied_by": "uuid", "replied_at": "2026-03-06T10:00:00.000Z" } }`

### Feedback — GET `/api/v1/customer-feedback`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "job_id": "uuid", "rating": 5, "timeliness": 4, "professionalism": 5, "documentation": 4, "remarks": "Excellent!", "JobRequest": { "reason": "Annual survey", "Vessel": { "vessel_name": "MV Star" } }, "Client": { "name": "Ahmed Ali" } }], "count": 20 } }
```

All read endpoints (Notifications, Flags, TOCA, NC, Search, Checklists, System health) — same schemas as previous roles.
