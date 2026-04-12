# SURVEYOR Role — All APIs with Full Schemas

> **SURVEYOR** conducts on-site surveys: check-in, checklist, evidence, submit report. 

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
    "id": "uuid", "name": "John Surveyor", "email": "john@grclass.com",
    "role": "SURVEYOR", "phone": "+971501234567", "status": "ACTIVE",
    "client_id": null, "profile_pic_url": "https://...",
    "force_password_reset": false, "last_login_at": "2026-03-05T08:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z", "updated_at": "2026-03-05T08:00:00.000Z"
  }
}
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
Field: `profile_pic` (file)
**Response `200`:**
```json
{ "success": true, "message": "Profile picture updated successfully", "data": { "id": "uuid", "profile_pic_url": "https://storage.grclass.com/profiles/new.jpg" } }
```

### PUT `/api/v1/users/fcm-token`
**Request:**
```json
{ "fcmToken": "firebase-device-token" }
```
**Response `200`:**
```json
{ "success": true, "message": "FCM token updated successfully", "data": { "id": "uuid", "fcm_token": "firebase-device-token" } }
```

---

## 📋 JOBS (Assigned Only)

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20&status=ASSIGNED`
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
        "job_status": "SURVEY_AUTHORIZED", "priority": "NORMAL",
        "is_survey_required": true, "assigned_surveyor_id": "uuid",
        "reschedule_count": 0, "created_at": "2026-03-05T18:30:00.000Z",
        "Vessel": { "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "id": "uuid", "name": "Safety Management Certificate" },
        "requester": { "id": "uuid", "name": "Ahmed Ali" },
        "surveyor": { "id": "uuid", "name": "John Surveyor" }
      }
    ],
    "count": 3
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
    "job_status": "SURVEY_AUTHORIZED", "priority": "NORMAL",
    "is_survey_required": true, "assigned_surveyor_id": "uuid",
    "assigned_by_user_id": "uuid", "approved_by_user_id": "uuid",
    "generated_certificate_id": null, "remarks": null, "reschedule_count": 0,
    "Vessel": {
      "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567",
      "Client": { "company_name": "ABC Shipping Ltd" }
    },
    "CertificateType": { "name": "Safety Management Certificate" },
    "requester": { "name": "Ahmed Ali" }, "surveyor": { "name": "John Surveyor" },
    "survey": { "id": "uuid", "survey_status": "NOT_STARTED" }
  }
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
      "message": "Please bring your ID for port security.",
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
    "message": "Arriving at port tomorrow 08:00 AM.",
    "is_internal": false, "attachment_url": null,
    "created_at": "2026-03-05T20:45:00.000Z"
  }
}
```

---

## 🔍 SURVEY WORKFLOW ⭐ (Core Surveyor Process)

### Step 1: POST `/api/v1/surveys/start` — Check-in
**Request:**
```json
{ "job_id": "uuid", "latitude": 25.2048, "longitude": 55.2708 }
```
| Field | Type | Required |
|-------|------|----------|
| `job_id` | UUID | ✅ |
| `latitude` | number | ✅ |
| `longitude` | number | ✅ |

**Response `201`:**
```json
{
  "success": true,
  "message": "Survey started successfully.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000200",
    "job_id": "uuid", "surveyor_id": "uuid",
    "survey_status": "STARTED",
    "start_latitude": 25.2048, "start_longitude": 55.2708,
    "submit_latitude": null, "submit_longitude": null,
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": null, "finalized_at": null,
    "attendance_photo_url": null, "signature_url": null,
    "evidence_proof_url": null, "survey_statement": null,
    "submission_count": 0,
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

### Step 2: PUT `/api/v1/checklists/jobs/:jobId` — Submit Checklist
**Request:**
```json
{
  "items": [
    {
      "question_code": "FS-001",
      "question_text": "Fire extinguishers inspected and within service date?",
      "answer": "YES",
      "remarks": "All 15 extinguishers in good condition",
      "file_url": "https://storage.grclass.com/checklists/photo1.jpg"
    },
    {
      "question_code": "FS-002",
      "question_text": "Fire alarm system functional?",
      "answer": "YES",
      "remarks": null,
      "file_url": null
    },
    {
      "question_code": "FS-003",
      "question_text": "Emergency exits clearly marked?",
      "answer": "NO",
      "remarks": "Exit sign on deck 3 is broken",
      "file_url": "https://storage.grclass.com/checklists/broken-sign.jpg"
    }
  ]
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `items` | array | ✅ | — |
| `items[].question_code` | string | ✅ | Code from template |
| `items[].question_text` | string | ✅ | — |
| `items[].answer` | string | ✅ | `YES`, `NO`, `NA` |
| `items[].remarks` | string | optional | — |
| `items[].file_url` | string | optional | Evidence photo URL |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid", "items_count": 3,
    "items": [
      { "id": "uuid", "question_code": "FS-001", "question_text": "Fire extinguishers inspected?", "answer": "YES", "remarks": "All 15 extinguishers in good condition", "file_url": "https://...", "created_at": "2026-03-05T19:00:00.000Z" },
      { "id": "uuid", "question_code": "FS-002", "question_text": "Fire alarm functional?", "answer": "YES", "remarks": null, "file_url": null, "created_at": "2026-03-05T19:01:00.000Z" },
      { "id": "uuid", "question_code": "FS-003", "question_text": "Emergency exits marked?", "answer": "NO", "remarks": "Exit sign on deck 3 broken", "file_url": "https://...", "created_at": "2026-03-05T19:02:00.000Z" }
    ]
  }
}
```

### Step 3: POST `/api/v1/surveys/jobs/:jobId/proof` — Upload Evidence
**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `proof` | file | ✅ (or `fileKey`) |
| `fileKey` | string | ✅ (or `proof`) |

**Response `200`:**
```json
{
  "success": true,
  "message": "Proof uploaded successfully.",
  "data": {
    "id": "uuid", "survey_status": "PROOF_UPLOADED",
    "evidence_proof_url": "https://storage.grclass.com/surveys/proof-001.pdf",
    "updated_at": "2026-03-05T19:30:00.000Z"
  }
}
```

### Step 3b: POST `/api/v1/surveys/jobs/:jobId/location` — Stream GPS
**Request:**
```json
{ "latitude": 25.2050, "longitude": 55.2710 }
```
**Response `200`:**
```json
{
  "success": true,
  "data": { "latitude": 25.2050, "longitude": 55.2710, "recorded_at": "2026-03-05T19:15:00.000Z" }
}
```

### Step 4: POST `/api/v1/surveys` — Submit Final Report (Check-out)
**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `job_id` | UUID | ✅ |
| `submit_latitude` | number | ✅ |
| `submit_longitude` | number | ✅ |
| `photoKey` | string | ✅ (or `photo` file) |
| `signatureKey` | string | ✅ (or `signature` file) |
| `photo` | file | ✅ (or `photoKey`) |
| `signature` | file | ✅ (or `signatureKey`) |
| `survey_statement` | string | optional |

**Response `201`:**
```json
{
  "success": true,
  "message": "Survey report submitted successfully.",
  "data": {
    "id": "uuid", "job_id": "uuid", "surveyor_id": "uuid",
    "survey_status": "SUBMITTED",
    "start_latitude": 25.2048, "start_longitude": 55.2708,
    "submit_latitude": 25.2050, "submit_longitude": 55.2710,
    "started_at": "2026-03-05T18:00:00.000Z",
    "submitted_at": "2026-03-05T20:00:00.000Z",
    "finalized_at": null,
    "attendance_photo_url": "https://storage.grclass.com/surveys/photo-001.jpg",
    "signature_url": "https://storage.grclass.com/surveys/sig-001.png",
    "evidence_proof_url": "https://storage.grclass.com/surveys/proof-001.pdf",
    "survey_statement": "The vessel MV Star was inspected at Dubai Port...",
    "submission_count": 1,
    "created_at": "2026-03-05T18:00:00.000Z",
    "updated_at": "2026-03-05T20:00:00.000Z"
  }
}
```

### POST `/api/v1/surveys/jobs/:jobId/statement/draft` — Draft Statement
**Request:**
```json
{ "survey_statement": "The vessel MV Star was inspected at Dubai Port on 05-Mar-2026. All safety systems found in order." }
```
**Response `200`:**
```json
{
  "success": true,
  "message": "Statement drafted successfully.",
  "data": { "id": "uuid", "survey_statement": "The vessel MV Star was inspected...", "updated_at": "2026-03-05T19:30:00.000Z" }
}
```

---

## 🔍 SURVEY DATA (Read)

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
    "submitted_at": "2026-03-05T20:00:00.000Z",
    "attendance_photo_url": "https://...", "signature_url": "https://...",
    "evidence_proof_url": "https://...", "survey_statement": "...",
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
    { "event": "SURVEY_STARTED", "timestamp": "2026-03-05T18:00:00.000Z", "latitude": 25.2048, "longitude": 55.2708 },
    { "event": "CHECKLIST_SUBMITTED", "timestamp": "2026-03-05T19:00:00.000Z" },
    { "event": "PROOF_UPLOADED", "timestamp": "2026-03-05T19:30:00.000Z" },
    { "event": "SURVEY_SUBMITTED", "timestamp": "2026-03-05T20:00:00.000Z", "latitude": 25.2050, "longitude": 55.2710 }
  ]
}
```

---

## 📜 CERTIFICATES (Read Only)

### GET `/api/v1/certificates`
**Response:** Same as CLIENT's certificate list response.

### GET `/api/v1/certificates/types`
**Response:** Same as CLIENT's certificate types response.

### GET `/api/v1/certificates/:id`
**Response:** Same as CLIENT's certificate detail response.

### GET `/api/v1/certificates/:id/download`
**Response `302`** → Redirects to signed PDF URL.

*(Also: `/types/:id`, `/vessel/:vesselId`, `/job/:jobId`, `/:id/preview`, `/:id/signature`, `/:id/history`)*

---

## 🚢 VESSELS (Read Only)

### GET `/api/v1/vessels/:id`
**Response:** Same as CLIENT's vessel detail response.

---

## 🚨 NON-CONFORMITIES

### POST `/api/v1/non-conformities`
**Request:**
```json
{ "job_id": "uuid", "description": "Fire extinguisher on port side deck expired — last serviced 2024-06-01", "severity": "MAJOR" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | — |
| `description` | string | ✅ | — |
| `severity` | string | ✅ | `MINOR`, `MAJOR`, `CRITICAL` |

**Response `201`:**
```json
{
  "id": "uuid", "job_id": "uuid",
  "description": "Fire extinguisher on port side deck expired...",
  "severity": "MAJOR", "status": "OPEN",
  "closure_remarks": null, "closed_at": null
}
```

### GET `/api/v1/non-conformities/job/:jobId`
**Response `200`:**
```json
[
  { "id": "uuid", "job_id": "uuid", "description": "Fire extinguisher expired", "severity": "MAJOR", "status": "OPEN", "closure_remarks": null },
  { "id": "uuid", "job_id": "uuid", "description": "Navigation light not working", "severity": "MINOR", "status": "CLOSED", "closure_remarks": "Replaced and tested", "closed_at": "2026-03-06T10:00:00.000Z" }
]
```

---

## 📂 DOCUMENTS

### GET `/api/v1/documents/get-upload-url`
**Query:** `?fileName=photo.jpg&fileType=image/jpeg&folder=surveys`
**Response `200`:**
```json
{ "success": true, "data": { "uploadUrl": "https://s3.../presigned", "fileKey": "surveys/photo.jpg", "expiresIn": 3600 } }
```

### POST `/api/v1/documents/upload` — `multipart/form-data`
**Response `201`:**
```json
{ "success": true, "data": { "fileKey": "surveys/1709672200000-photo.jpg", "url": "https://storage.grclass.com/surveys/photo.jpg" } }
```

*(Also: POST `/register`, GET `/:id`, GET `/:entityType/:entityId`, POST `/:entityType/:entityId`, POST `/:entityType/:entityId/register`)*

---

## 👷 SURVEYOR PROFILE & LOCATION

### GET `/api/v1/surveyors/:id/profile`
**Response `200`:**
```json
{
  "success": true, "message": "Profile fetched successfully",
  "data": {
    "id": "uuid", "user_id": "uuid",
    "nationality": "UK", "qualifications": "Master Mariner, Class 1 Certificate",
    "is_available": true,
    "last_known_latitude": 25.2048, "last_known_longitude": 55.2708,
    "User": { "id": "uuid", "name": "John Surveyor", "email": "john@grclass.com", "role": "SURVEYOR", "status": "ACTIVE" }
  }
}
```

### POST `/api/v1/surveyors/availability`
**Request:**
```json
{ "is_available": true }
```
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "is_available": true } }
```

### POST `/api/v1/surveyors/location`
**Request:**
```json
{ "latitude": 25.2048, "longitude": 55.2708 }
```
**Response `200`:**
```json
{ "success": true, "data": { "latitude": 25.2048, "longitude": 55.2708, "recorded_at": "2026-03-05T18:00:00.000Z" } }
```

---

## ✅ CHECKLIST TEMPLATES (Read Only)

### GET `/api/v1/checklist-templates`
**Query:** `?status=ACTIVE`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "name": "ISM Safety Audit Checklist", "code": "ISM-CHK-001",
      "description": "Standard ISM Code safety audit checklist for annual surveys",
      "status": "ACTIVE",
      "sections": [
        { "title": "Fire Safety", "items": [{ "code": "FS-001", "text": "Fire extinguishers inspected?", "type": "YES_NO_NA" }] }
      ]
    }
  ]
}
```

### GET `/api/v1/checklist-templates/job/:jobId`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "name": "ISM Safety Audit Checklist", "code": "ISM-CHK-001",
    "sections": [
      { "title": "Fire Safety", "items": [{ "code": "FS-001", "text": "Fire extinguishers inspected?", "type": "YES_NO_NA" }] },
      { "title": "Life-saving Appliances", "items": [{ "code": "LS-001", "text": "Lifeboats serviceable?", "type": "YES_NO_NA" }] }
    ]
  },
  "message": "Use this template to fill out the checklist for this job"
}
```

---

## 🔔 NOTIFICATIONS

### GET `/api/v1/notifications`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "user_id": "uuid", "title": "New Job Assigned", "message": "You have been assigned to job #JOB-2026-042 for vessel MV Star.", "type": "INFO", "is_read": false, "created_at": "2026-03-05T18:00:00.000Z" },
    { "id": "uuid", "user_id": "uuid", "title": "Survey Authorized", "message": "Survey for job #JOB-2026-042 has been authorized. You may begin field work.", "type": "INFO", "is_read": true, "created_at": "2026-03-05T17:00:00.000Z" }
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
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "assignedJobs": 5, "inProgressJobs": 2, "completedJobs": 20,
    "upcomingJobs": [
      { "id": "uuid", "reason": "Annual survey", "target_date": "2026-04-15", "target_port": "Dubai Port", "Vessel": { "vessel_name": "MV Star" } }
    ],
    "recentSubmissions": [
      { "id": "uuid", "survey_status": "SUBMITTED", "submitted_at": "2026-03-04T20:00:00.000Z" }
    ]
  }
}
```

---

## 🎫 SUPPORT TICKETS

### POST `/api/v1/support`
**Request:**
```json
{ "subject": "App GPS not working", "description": "Location tracking stopped after latest update on Samsung S22.", "priority": "MEDIUM" }
```
**Response `201`:**
```json
{
  "success": true,
  "data": { "id": "uuid", "user_id": "uuid", "subject": "App GPS not working", "status": "OPEN", "priority": "MEDIUM", "created_at": "2026-03-05T18:00:00.000Z" }
}
```

### GET `/api/v1/support`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "subject": "App GPS not working", "status": "OPEN", "priority": "MEDIUM", "created_at": "2026-03-05T18:00:00.000Z" }], "count": 1 } }
```

### GET `/api/v1/support/:id`
Same structure with `Creator` and `Resolver` fields.

---

## 🔍 SEARCH

### GET `/api/v1/search?q=star`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "vessels": [{ "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567" }],
    "jobs": [{ "id": "uuid", "job_status": "ASSIGNED", "reason": "Annual survey" }],
    "certificates": [{ "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "status": "VALID" }],
    "clients": []
  }
}
```

---

## ✅ VIEW CHECKLIST

### GET `/api/v1/checklists/jobs/:jobId`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid", "template_id": "uuid", "status": "SUBMITTED",
    "items": [
      { "id": "uuid", "question_code": "FS-001", "question_text": "Fire extinguishers inspected?", "answer": "YES", "remarks": "All good", "file_url": "https://..." }
    ]
  }
}
```
