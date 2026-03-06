# ADMIN Role — Part 1: Auth, Users, Clients, Vessels, Jobs

> **ADMIN** has full system access. This is Part 1 of 3.
> - [Part 2: Surveys, Certificates, Payments, Surveyors](./ADMIN_PART2.md)
> - [Part 3: Everything Else](./ADMIN_PART3.md)

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
    "id": "uuid", "name": "Admin User", "email": "admin@girik.com",
    "role": "ADMIN", "phone": "+971501234567", "status": "ACTIVE",
    "client_id": null, "profile_pic_url": null,
    "force_password_reset": false, "last_login_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z", "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
Field: `profile_pic` (file)
**Response `200`:**
```json
{ "success": true, "message": "Profile picture updated successfully", "data": { "id": "uuid", "profile_pic_url": "https://storage.girik.com/profiles/new.jpg" } }
```

### PUT `/api/v1/users/fcm-token`
**Request:** `{ "fcmToken": "firebase-device-token" }`
**Response `200`:**
```json
{ "success": true, "message": "FCM token updated successfully", "data": { "id": "uuid", "fcm_token": "firebase-device-token" } }
```

---

## 👤 USER MANAGEMENT (ADMIN Only)

### GET `/api/v1/users`
**Query:** `?page=1&limit=20&role=TO&status=ACTIVE&search=john`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "name": "TO User", "email": "to@girik.com",
        "role": "TO", "phone": "+971503333333", "status": "ACTIVE",
        "client_id": null, "profile_pic_url": null,
        "last_login_at": "2026-03-05T08:00:00.000Z",
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "count": 15
  }
}
```

### POST `/api/v1/users`
**Request:**
```json
{
  "name": "New User",
  "email": "newuser@girik.com",
  "password": "Secure@123",
  "role": "TO",
  "phone": "+971501234567",
  "client_id": null
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `email` | string | ✅ | Valid email, unique |
| `password` | string | ✅ | Min 8, uppercase+lowercase+digit |
| `role` | string | ✅ | `ADMIN`, `GM`, `TM`, `TO`, `TA`, `SURVEYOR`, `CLIENT`, `FLAG_ADMIN` |
| `phone` | string | optional | — |
| `client_id` | UUID | optional | Required for CLIENT role |

**Response `201`:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid", "name": "New User", "email": "newuser@girik.com",
    "role": "TO", "phone": "+971501234567", "status": "ACTIVE",
    "client_id": null, "profile_pic_url": null,
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### PUT `/api/v1/users/:id`
**Request:**
```json
{ "name": "Updated Name", "phone": "+971509999999", "role": "TM" }
```
**Response `200`:**
```json
{
  "success": true, "message": "User updated successfully",
  "data": { "id": "uuid", "name": "Updated Name", "phone": "+971509999999", "role": "TM" }
}
```

### PUT `/api/v1/users/:id/status`
**Request:**
```json
{ "status": "SUSPENDED" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `ACTIVE`, `SUSPENDED`, `INACTIVE` |

**Response `200`:**
```json
{ "success": true, "message": "User status updated", "data": { "id": "uuid", "status": "SUSPENDED" } }
```

### DELETE `/api/v1/users/:id`
**Response `200`:**
```json
{ "success": true, "message": "User deleted successfully" }
```

---

## 🏢 CLIENT MANAGEMENT

### POST `/api/v1/clients`
**Request:**
```json
{
  "company_name": "New Shipping Corp", "company_code": "NSC-001",
  "email": "info@newshipping.com", "address": "Marina Walk, Dubai", "country": "AE",
  "phone": "+971504444444", "contact_person_name": "Mohammed",
  "contact_person_email": "mohammed@newshipping.com",
  "user": {
    "name": "Mohammed", "email": "mohammed@newshipping.com",
    "password": "Secure@123", "role": "CLIENT"
  }
}
```
| Field | Type | Required |
|-------|------|----------|
| `company_name` | string | ✅ |
| `company_code` | string | ✅ |
| `email` | string | ✅ |
| `address` | string | optional |
| `country` | string | optional |
| `phone` | string | optional |
| `contact_person_name` | string | optional |
| `user` | object | optional |
| `user.name` | string | ✅ (if user) |
| `user.email` | string | ✅ (if user) |
| `user.password` | string | ✅ (if user) |

**Response `201`:**
```json
{
  "success": true, "message": "Client created successfully",
  "data": {
    "client": {
      "id": "uuid", "company_name": "New Shipping Corp", "company_code": "NSC-001",
      "email": "info@newshipping.com", "address": "Marina Walk, Dubai",
      "country": "AE", "phone": "+971504444444", "status": "ACTIVE",
      "created_at": "2026-03-05T18:00:00.000Z"
    },
    "user": {
      "id": "uuid", "name": "Mohammed", "email": "mohammed@newshipping.com",
      "role": "CLIENT", "status": "ACTIVE"
    }
  }
}
```

### GET `/api/v1/clients`
**Query:** `?page=1&limit=20&status=ACTIVE&search=abc`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "company_name": "ABC Shipping Ltd", "company_code": "ABC-001",
        "email": "info@abcshipping.com", "phone": "+971501234567",
        "address": "Business Bay, Dubai", "country": "AE",
        "contact_person_name": "Ahmed Ali", "status": "ACTIVE",
        "created_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "count": 30
  }
}
```

### GET `/api/v1/clients/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "company_name": "ABC Shipping Ltd", "company_code": "ABC-001",
    "address": "Business Bay, Dubai", "country": "AE",
    "email": "info@abcshipping.com", "phone": "+971501234567",
    "contact_person_name": "Ahmed Ali", "status": "ACTIVE",
    "Users": [{ "id": "uuid", "name": "Ahmed Ali", "email": "ahmed@abcshipping.com", "role": "CLIENT" }],
    "Vessels": [{ "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567", "class_status": "ACTIVE" }]
  }
}
```

### GET `/api/v1/clients/:id/documents`
**Response `200`:**
```json
{
  "success": true, "count": 3,
  "data": [
    { "id": "uuid", "entity_type": "CLIENT", "entity_id": "uuid", "document_type": "Registration Certificate", "file_name": "reg_cert.pdf", "signedUrl": "https://signed-url...", "created_at": "2026-01-15T00:00:00.000Z" }
  ]
}
```

### PUT `/api/v1/clients/:id`
**Request:** `{ "phone": "+971509999999", "contact_person_name": "Updated Contact" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "phone": "+971509999999", "contact_person_name": "Updated Contact" } }
```

### DELETE `/api/v1/clients/:id` (ADMIN only)
**Response `200`:**
```json
{ "success": true, "message": "Client deleted successfully" }
```

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
  "class_status": "ACTIVE", "current_class_society": "Lloyd's Register",
  "engine_type": "MAN B&W 6S60ME-C8.5", "builder_name": "Hyundai Heavy Industries"
}
```
| Field | Type | Required |
|-------|------|----------|
| `client_id` | UUID | ✅ |
| `vessel_name` | string | ✅ |
| `imo_number` | string | ✅ (unique, 7 digits) |
| `flag_administration_id` | UUID | ✅ |
| `ship_type` | string | ✅ |
| `call_sign` | string | optional |
| `mmsi_number` | string | optional |
| `port_of_registry` | string | optional |
| `year_built` | number | optional |
| `gross_tonnage` | decimal | optional |
| `net_tonnage` | decimal | optional |
| `deadweight` | decimal | optional |
| `class_status` | string | optional |
| `current_class_society` | string | optional |

**Response `201`:**
```json
{
  "success": true, "message": "Vessel created successfully",
  "data": {
    "id": "uuid", "client_id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567",
    "call_sign": "ABCD", "mmsi_number": "123456789", "port_of_registry": "Dubai",
    "year_built": 2015, "ship_type": "Bulk Carrier",
    "gross_tonnage": "50000.00", "net_tonnage": "30000.00", "deadweight": "85000.00",
    "class_status": "ACTIVE", "current_class_society": "Lloyd's Register",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### GET `/api/v1/vessels`
**Query:** `?page=1&limit=20&class_status=ACTIVE&client_id=uuid&search=star`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "client_id": "uuid", "vessel_name": "MV Star",
        "imo_number": "1234567", "call_sign": "ABCD", "ship_type": "Bulk Carrier",
        "gross_tonnage": "50000.00", "class_status": "ACTIVE",
        "Client": { "company_name": "ABC Shipping Ltd" },
        "FlagAdministration": { "flag_state_name": "Panama", "country": "PA" }
      }
    ],
    "count": 200
  }
}
```

### GET `/api/v1/vessels/client/:clientId`
Same response structure as GET `/vessels`.

### GET `/api/v1/vessels/:id`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "client_id": "uuid", "vessel_name": "MV Star",
    "imo_number": "1234567", "call_sign": "ABCD", "mmsi_number": "123456789",
    "port_of_registry": "Dubai", "year_built": 2015, "ship_type": "Bulk Carrier",
    "gross_tonnage": "50000.00", "net_tonnage": "30000.00", "deadweight": "85000.00",
    "class_status": "ACTIVE", "current_class_society": "Lloyd's Register",
    "engine_type": "MAN B&W 6S60ME-C8.5", "builder_name": "Hyundai Heavy Industries",
    "Client": { "id": "uuid", "company_name": "ABC Shipping Ltd" },
    "FlagAdministration": { "flag_state_name": "Panama", "country": "PA", "authority_name": "Panama Maritime Authority" },
    "Documents": [{ "id": "uuid", "document_type": "Class Certificate", "signedUrl": "https://..." }],
    "JobRequests": [{ "id": "uuid", "job_status": "CREATED", "reason": "Annual survey" }],
    "Certificates": [{ "id": "uuid", "certificate_number": "GIRIK-2026-0042", "status": "VALID" }]
  }
}
```

### PUT `/api/v1/vessels/:id`
**Request:** `{ "port_of_registry": "Singapore", "class_status": "SUSPENDED" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "port_of_registry": "Singapore", "class_status": "SUSPENDED" } }
```

---

## 📋 JOB WORKFLOW

### POST `/api/v1/jobs` — Create Job
**Request:**
```json
{
  "vessel_id": "uuid", "certificate_type_id": "uuid",
  "reason": "Annual survey due", "target_port": "Dubai Port, Jebel Ali",
  "target_date": "2026-04-15",
  "uploaded_documents": [{ "required_document_id": "uuid", "file_url": "https://..." }]
}
```
**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "vessel_id": "uuid", "certificate_type_id": "uuid",
    "requested_by_user_id": "uuid", "reason": "Annual survey due",
    "target_port": "Dubai Port", "target_date": "2026-04-15",
    "job_status": "CREATED", "priority": "NORMAL",
    "is_survey_required": true, "assigned_surveyor_id": null,
    "created_at": "2026-03-05T18:30:00.000Z"
  }
}
```

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20&status=CREATED&priority=NORMAL&vessel_id=uuid&surveyor_id=uuid`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "certificate_type_id": "uuid",
        "reason": "Annual survey due", "target_port": "Dubai Port",
        "target_date": "2026-04-15", "job_status": "CREATED", "priority": "NORMAL",
        "is_survey_required": true, "assigned_surveyor_id": null, "reschedule_count": 0,
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" },
        "requester": { "name": "Ahmed Ali" }, "surveyor": null
      }
    ],
    "count": 500
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
    "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567", "Client": { "company_name": "ABC Shipping" } },
    "CertificateType": { "name": "Safety Management Certificate" },
    "requester": { "name": "Ahmed Ali" }, "surveyor": { "name": "John Surveyor" },
    "approver": { "name": "Admin User" },
    "survey": { "id": "uuid", "survey_status": "NOT_STARTED" }
  }
}
```

### PUT `/api/v1/jobs/:id/approve-request`
**Request:** `{ "remarks": "Documents verified, approved for survey" }`
**Response `200`:**
```json
{ "success": true, "message": "Job approved.", "data": { "id": "uuid", "job_status": "APPROVED", "approved_by_user_id": "uuid" } }
```

### PUT `/api/v1/jobs/:id/finalize`
**Request:** `{ "remarks": "Non-survey job finalized" }`
**Response `200`:**
```json
{ "success": true, "message": "Job finalized.", "data": { "id": "uuid", "job_status": "FINALIZED" } }
```

### PUT `/api/v1/jobs/:id/assign`
**Request:** `{ "surveyorId": "uuid" }`
**Response `200`:**
```json
{ "success": true, "message": "Surveyor assigned.", "data": { "id": "uuid", "job_status": "ASSIGNED", "assigned_surveyor_id": "uuid", "assigned_by_user_id": "uuid" } }
```

### PUT `/api/v1/jobs/:id/reschedule`
**Request:** `{ "new_target_date": "2026-05-10", "new_target_port": "Mumbai Port", "reason": "Vessel delayed" }`
**Response `200`:**
```json
{ "success": true, "message": "Job rescheduled.", "data": { "id": "uuid", "target_date": "2026-05-10", "target_port": "Mumbai Port", "reschedule_count": 1 } }
```

### PUT `/api/v1/jobs/:id/authorize-survey`
**Request:** `{ "remarks": "Survey authorized" }`
**Response `200`:**
```json
{ "success": true, "message": "Survey authorized.", "data": { "id": "uuid", "job_status": "SURVEY_AUTHORIZED" } }
```

### PUT `/api/v1/jobs/:id/send-back`
**Request:** `{ "reason": "Checklist section 3 is incomplete" }`
**Response `200`:**
```json
{ "success": true, "message": "Job sent back for rework.", "data": { "id": "uuid", "job_status": "REWORK_REQUESTED" } }
```

### PUT `/api/v1/jobs/:id/reject`
**Request:** `{ "reason": "Incomplete documentation" }`
**Response `200`:**
```json
{ "success": true, "message": "Job rejected.", "data": { "id": "uuid", "job_status": "REJECTED", "remarks": "Incomplete documentation" } }
```

### PUT `/api/v1/jobs/:id/cancel`
**Request:** `{ "reason": "Cancelled" }`
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
    { "id": "uuid", "job_id": "uuid", "from_status": "DOCUMENT_VERIFIED", "to_status": "APPROVED", "remarks": "Approved for survey", "changed_by_user_id": "uuid", "created_at": "2026-03-05T19:00:00.000Z", "user": { "name": "Admin User" } }
  ]
}
```

### POST `/api/v1/jobs/:id/notes`
**Request:** `{ "note": "Called client to confirm vessel location." }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "user_id": "uuid", "note": "Called client to confirm vessel location.", "created_at": "2026-03-05T19:30:00.000Z" } }
```

### GET `/api/v1/jobs/:id/messages/external`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "job_id": "uuid", "sender_id": "uuid", "message": "Documents uploaded.", "is_internal": false, "attachment_url": null, "created_at": "2026-03-05T18:35:00.000Z" }] }
```

### GET `/api/v1/jobs/:id/messages/internal`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "job_id": "uuid", "sender_id": "uuid", "message": "Client needs follow-up on missing safety cert.", "is_internal": true, "attachment_url": null, "created_at": "2026-03-05T18:40:00.000Z" }] }
```

### POST `/api/v1/jobs/:id/messages` — `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| `message` | string | ✅ |
| `is_internal` | boolean | optional (default false) |
| `attachment` | file | optional |

**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "job_id": "uuid", "sender_id": "uuid", "message": "Noted.", "is_internal": false, "attachment_url": null, "created_at": "2026-03-05T20:00:00.000Z" } }
```
