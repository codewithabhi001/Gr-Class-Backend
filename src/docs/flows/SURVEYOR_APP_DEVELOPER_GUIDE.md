Surveyor App Developer Guide (Login → Survey Done)

**Audience:** Mobile / Web developers building the SURVEYOR app.

This is a practical, API-first guide that explains:

- **Why** each API exists
- **When** to call it in the workflow
- **How** to call it (payloads + examples)
- **What** to store locally (keys, ids, status)

For the overall system state machine and rework loop, also read:
`src/docs/flows/SURVEY_AUTHORIZE_TO_FINALIZE.md`.

---

## 0) Base setup (required for every call)

### Base URL

- Use your environment base, e.g. `https://api.<env>.grclass.com`

### Auth header

All SURVEYOR APIs require a Bearer token:

- `Authorization: Bearer <accessToken>`

### Common response shape

Most endpoints return:

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

Error responses commonly return:

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Validation failed. Please correct the highlighted fields.",
  "errors": { "field": "message" },
  "trace_id": "..."
}
```

---

## 1) Login (get access token)

### 1.1 `POST /api/v1/auth/login`

**Why:** Starts the session (SURVEYOR uses the same login endpoint as other roles).

**Request**

Required fields:

- `email` (string, email) **required**
- `password` (string) **required**

```json
{
  "email": "surveyor@example.com",
  "password": "your-password"
}
```

**Response**

Fields:

- `user` (object) **present**
  - `id` (uuid)
  - `name` (string)
  - `email` (string)
  - `role` (string: `ADMIN|GM|TM|TO|SURVEYOR|CLIENT`)
  - `status` (string: `ACTIVE|INACTIVE|SUSPENDED`)
  - `client_id` (uuid|null) optional
  - `profile_pic_url` (url|null) optional
  - `force_password_reset` (boolean)
  - `last_login_at` (date-time|null) optional
- `accessToken` (string) **present**
- `refreshToken` (string) **present**

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "John Doe",
    "email": "surveyor@example.com",
    "role": "SURVEYOR",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": null,
    "force_password_reset": false,
    "last_login_at": "2026-04-28T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Store locally**

- `accessToken` (used on every request)
- `refreshToken` (for silent re-login)
- `me` user object if returned by backend (id, role, name)

### 1.2 `POST /api/v1/auth/refresh-token`

**Why:** Get a new access token when it expires.

**Request**

At least one of the following is required:

- `refreshToken` (string) optional
- `token` (string) optional (legacy alias for `refreshToken`)

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**

Same shape as login:

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "John Doe",
    "email": "surveyor@example.com",
    "role": "SURVEYOR"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2) Home screen / dashboard

### `GET /api/v1/dashboard`

**Why:** Quick counts and “what needs attention” cards for the surveyor.

**Request**

- No body

**Response**

This endpoint is **role-specific**. The surveyor app should treat these as “cards” that may evolve. Typical fields:

- `success` (boolean) **present**
- `data` (object) **present**
  - `stats` (object) **present** (dynamic keys, backend may add/remove)
  - `recentJobs` (array) optional
  - `expiringCertificates` (array) optional
  - `alerts` (array) optional

```json
{
  "success": true,
  "data": {
    "stats": {
      "pendingJobs": 5
    },
    "recentJobs": [],
    "expiringCertificates": [],
    "alerts": []
  }
}
```

---

## 3) Job list (SURVEYOR sees only assigned jobs)

### 3.1 `GET /api/v1/jobs`

**Why:** This is the surveyor’s job inbox.

**Common filters**

- `?status=ASSIGNED,SURVEY_AUTHORIZED,IN_PROGRESS,REWORK_REQUESTED`

**Request**

Query params (all optional unless marked):

- `page` (number, default `1`) optional
- `limit` (number, default `10`) optional
- `status` (string) optional (single status or comma-separated list)
- `vessel_id` (uuid) optional
- `certificate_type_id` (uuid) optional
- `assigned_surveyor_id` (uuid) optional (backend will still enforce “me” for SURVEYOR)
- `target_port` (string) optional
- `created_from` (date `YYYY-MM-DD`) optional
- `created_to` (date `YYYY-MM-DD`) optional
- `recent_days` (number) optional

**Response**

- `success` (boolean)
- `data` (object)
  - `total` (number)
  - `page` (number)
  - `limit` (number)
  - `totalPages` (number)
  - `status_counts` (array) optional
    - items: `{ status: string, count: number }`
  - `jobs` (array)

```json
{
  "success": true,
  "data": {
    "total": 48,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "status_counts": [{ "status": "ASSIGNED", "count": 10 }],
    "jobs": [
      {
        "id": "019d3ac5-3464-74f9-891e-f6eda7ee366c",
        "job_status": "ASSIGNED",
        "vessel_id": "019cbf1d-d9c1-732d-8d10-f866bb6e9dec",
        "certificate_type_id": "019cbf1d-bdc2-75e8-9fc8-3d161ae90ede",
        "target_port": "Mumbai",
        "target_date": "2026-12-31",
        "priority": "NORMAL",
        "createdAt": "2026-03-29T18:04:55.000Z",
        "Vessel": { "id": "019cbf1d-d9c1-732d-8d10-f866bb6e9dec", "vessel_name": "MV Pacific Guardian", "imo_number": "9876501" },
        "CertificateType": { "id": "019cbf1d-bdc2-75e8-9fc8-3d161ae90ede", "name": "Safety Equipment Certificate" },
        "survey": { "id": "019d7c59-7f7e-768d-a9a5-00cb91079432", "survey_status": "NOT_STARTED" },
        "payment_status": "N/A"
      }
    ]
  }
}
```

**Important behavior**

- Backend filters the list for SURVEYOR to **only assigned jobs**.

### 3.2 `GET /api/v1/jobs/{jobId}`

**Why:** Job detail screen (vessel, certificate type, job status, documents, etc.).

**Updated Info:** This detail response now also includes **`ActivityPlannings`** (the digital checklist answers) and **`survey`** details in one call.

**Request**

Path params:

- `jobId` (uuid) **required**

**Response**

- `success` (boolean)
- `data` (object) a `JobResponse` with (all fields may appear; some are nullable):
  - `id` (uuid)
  - `vessel_id` (uuid)
  - `requested_by_user_id` (uuid)
  - `certificate_type_id` (uuid)
  - `reason` (string)
  - `target_port` (string)
  - `target_date` (date)
  - `job_status` (string)
  - `priority` (string)
  - `assigned_surveyor_id` (uuid|null)
  - `assigned_by_user_id` (uuid|null)
  - `approved_by_user_id` (uuid|null)
  - `generated_certificate_id` (uuid|null)
  - `remarks` (string|null)
  - `is_survey_required` (boolean)
  - `reschedule_count` (number)
  - `payment_status` (string)
  - `certificate_url` (url|null)
  - `certificate_number` (string|null)
  - `created_at` (date-time)
  - `updated_at` (date-time)
  - `Vessel` (object)
  - `CertificateType` (object)
  - `survey` (object)
  - `Payments` (array) optional
  - `requester` (object) optional
  - `surveyor` (object|null) optional
  - `approver` (object|null) optional

```json
{
  "success": true,
  "data": {
    "id": "019d3ac5-3464-74f9-891e-f6eda7ee366c",
    "job_status": "ASSIGNED",
    "vessel_id": "019cbf1d-d9c1-732d-8d10-f866bb6e9dec",
    "certificate_type_id": "019cbf1d-bdc2-75e8-9fc8-3d161ae90ede",
    "requested_by_user_id": "019c79a4-3eee-731a-9eff-b0eed303e215",
    "assigned_surveyor_id": "019c79a4-4930-71fd-aa73-887301791935",
    "target_port": "Mumbai",
    "target_date": "2026-12-31",
    "priority": "NORMAL",
    "remarks": null,
    "is_survey_required": true,
    "reschedule_count": 0,
    "payment_status": "N/A",
    "certificate_url": null,
    "certificate_number": null,
    "Vessel": { "id": "019cbf1d-d9c1-732d-8d10-f866bb6e9dec", "vessel_name": "MV Pacific Guardian", "imo_number": "9876501" },
    "CertificateType": { "id": "019cbf1d-bdc2-75e8-9fc8-3d161ae90ede", "name": "Safety Equipment Certificate", "issuing_authority": "CLASS" },
    "survey": { "id": "019d7c59-7f7e-768d-a9a5-00cb91079432", "survey_status": "NOT_STARTED", "survey_statement_status": "NOT_PREPARED" }
  }
}
```

---

---

## 4) Survey workflow (the required order)

The backend enforces a sequence:

1. **Start survey (check-in)** → `POST /surveys/start`
2. **Checklist screen** → `GET /checklists/jobs/:jobId` + uploads + `PUT /checklists/jobs/:jobId`
3. **Proof upload** → `POST /surveys/jobs/:jobId/proof`
4. **(Optional) Draft statement PDF** → `POST /surveys/jobs/:jobId/statement/draft`
5. **Submit survey (check-out)** → `POST /surveys` (final submission)

Rework can happen after submission; surveyor repeats checklist/proof/submit.

---

## 5) Start survey (Check-in)

### `POST /api/v1/surveys/start`

**Why:** Marks the on-site start of the survey; moves job into `IN_PROGRESS`.

**Request**

Required fields:

- `job_id` (uuid) **required**
- `latitude` (number) **required**
- `longitude` (number) **required**

```json
{
  "job_id": "job-uuid",
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

**Response**

- `success` (boolean)
- `message` (string)
- `data` (object)
  - `message` (string)
  - `job_id` (uuid)
  - `started_at` (date-time)

```json
{
  "success": true,
  "message": "Survey started successfully.",
  "data": {
    "message": "Survey started.",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "started_at": "2026-03-15T10:00:00.000Z"
  }
}
```
**UI notes**

- Only show this button when job status is `SURVEY_AUTHORIZED`.
- If user is outside allowed radius, backend may require “reason” depending on config/rules (handle 400 with message).

---

---

## 6) Checklist screen (Single API to load everything)

### 6.1 `GET /api/v1/checklists/jobs/{jobId}`

**Why:** Load the entire checklist screen in one call.
- If it's the **first time** (no survey started), the `items` array will be empty. The `sections` array (the template structure) is provided so you can build the UI to collect answers for the first time.
- If it's a **resume**, use the `items` array to populate previously saved answers.

**Response (shape)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "question_code": "LSE001",
        "question_text": "Are life jackets available?",
        "answer": "YES",
        "remarks": "Verified",
        "file_url": "https://signed-url-to-evidence.jpg",
        "status": "REJECTED",
        "rejection_reason": "Photo is blurry, please re-upload."
      }
    ],
    "sections": [
       {
         "title": "Life-Saving Equipment",
         "items": [
           { "code": "LSE001", "text": "Are life jackets available?", "type": "YES_NO_NA" }
         ]
       }
    ],
    "signed_checklist_files": [
      {
        "url": "https://signed-url-to-signed-checklist.pdf",
        "status": "REJECTED",
        "rejection_reason": "Page 3 missing signature."
      }
    ],
    "template_files": [
      "https://signed-url-to-blank-template.docx"
    ],
    "template": {
      "id": "uuid",
      "name": "BOTTOM INSPECTION",
      "code": "BOTTOM_INSPECTION"
    }
  }
}
```

**Request**

Path params:

- `jobId` (uuid) **required**

Optional query params:

- `answer` (string: `YES|NO|NA`) optional
- `question_code` (string) optional
- `search` (string) optional

**Response fields**

- `success` (boolean)
- `data` (object)
  - `items` (array of checklist item objects)
    - `id` (uuid)
    - `job_id` (uuid)
    - `question_code` (string)
    - `question_text` (string)
    - `answer` (string: `YES|NO|NA`)
    - `remarks` (string|null)
    - `file_url` (url|null) (**resolved HTTPS URL**)
    - `status` (string: `PENDING|APPROVED|REJECTED`)
    - `rejection_reason` (string|null)
    - `createdAt` (date-time)
    - `updatedAt` (date-time)
  - `signed_checklist_files` (array of objects)
    - `url` (url)
    - `status` (string: `PENDING|APPROVED|REJECTED`)
    - `rejection_reason` (string|null)
  - `template_files` (array of url) (**resolved HTTPS URLs**)
  - `template` (object|null)
    - `id` (uuid)
    - `name` (string)
    - `code` (string)

**Important behavior**

- This endpoint returns **URLs** (not raw S3 keys). Keep those URLs for preview/download only.
- To update checklist answers and attachments you still send **S3 keys** in the PUT step below.

---

## 7) Checklist Template (Fetch Questions Only)

### 7.1 `GET /api/v1/checklist-templates/job/{jobId}`

**Why:** Use this if you only need the **questions/sections** (the template) without current survey answers. This is what you call when you first need to know what questions to display to the surveyor.

**Response**
Returns the full `ChecklistTemplate` object with `sections` and `items`.

---

## 8) Upload checklist evidence (per question)

Checklist evidence is uploaded **directly to S3** via a pre-signed URL, then the returned `fileKey` is saved against the checklist item.

### 8.1 `GET /api/v1/checklists/jobs/{jobId}/get-upload-url`

**Why:** Get a pre-signed S3 PUT URL for a single evidence file (photo).

**Query**

- `fileName` (string) **required**: e.g. `engine_room.jpg`
- `contentType` (string) **required**: e.g. `image/jpeg`

**Response (example)**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3-presigned-put-url",
    "fileKey": "surveys/checklist-evidence/<jobId>/1714000000000_engine_room.jpg"
  }
}
```

### 8.2 Upload binary to S3

**Why:** This avoids sending big files through backend; faster and cheaper.

**Do**

- HTTP `PUT` the file to `uploadUrl` with `Content-Type` header.

**Store**

- Save the returned `fileKey` to use as `file_url` in checklist submission.

---

## 9) Upload “signed checklist scan” (filled + signed doc(s))

This is the scanned / signed checklist PDF/JPG that must be attached before final survey submission.

**Important clarification (common confusion):**

- `template_files` / `download` APIs are for **reference or prefilled blank forms** (DOCX/PDF) that the surveyor downloads to fill.
- `signed_checklist_files` are **new uploads created by the surveyor** after filling & signing the checklist (scan/photo/export-to-PDF).
  They are **not expected** to be “download the same file and re-upload it”.

### 9.1 `GET /api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url`

**Why:** Get a pre-signed S3 PUT URL for the full signed checklist scan.

**Query**

- `fileName` (string) **required**: e.g. `signed_checklist.pdf`
- `contentType` (string) **required**: e.g. `application/pdf`

**Response**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3-presigned-put-url",
    "fileKey": "surveys/signed-checklists/<jobId>/1714000000000_signed_checklist.pdf"
  }
}
```

### 9.2 Upload to S3 (PUT)

Same as evidence upload.

---

## 10) Save checklist answers + attach uploaded file keys

### `PUT /api/v1/checklists/jobs/{jobId}`

**Why:** This is the **only** API that persists checklist state:

- Answers (YES/NO/NA etc.)
- Per-item evidence keys (`file_url`)
- Signed checklist scan keys (`signed_checklist_files`)

**Important**

- `signed_checklist_files` is treated as a **full replace** array. To “remove”, send `[]`.
- You can update checklist multiple times.
- **Granular Rejection Behavior**: If an item is `REJECTED`, re-sending it in the `items` array will reset its `status` to `PENDING` and clear the `rejection_reason`.
- `signed_checklist_files` must contain the **S3 keys returned by** `signed-checklist-upload-url`.
  The UI should show the *resolved URLs* from `GET /checklists/jobs/:jobId`, but should *store/send keys* on this PUT.

**Request**

Required fields:

- `items` (array) **required**

Each item:

- `question_code` (string) **required**
- `question_text` (string) **required**
- `answer` (string: `YES|NO|NA`) **required**
- `remarks` (string) optional (can be empty)
- `file_url` (string|null) optional
  - Send the **S3 key** returned by `GET /api/v1/checklists/jobs/{jobId}/get-upload-url` (after uploading to S3).
  - Empty string is allowed when you have no evidence.

Optional fields:

- `signed_checklist_files` (array of string) optional
  - Send the **S3 keys** returned by `GET /api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url` (after uploading to S3).

Example:

```json
{
  "items": [
    {
      "question_code": "LSE001",
      "question_text": "Are life jackets available?",
      "answer": "YES",
      "remarks": "Verified",
      "file_url": ""
    },
    {
      "question_code": "LSE002",
      "question_text": "Is the fire extinguisher charged?",
      "answer": "NO",
      "remarks": "Pressure low, needs replacement",
      "file_url": "surveys/checklist-evidence/<jobId>/1714000000000_fire_ext.jpg"
    }
  ],
  "signed_checklist_files": [
    "surveys/signed-checklists/<jobId>/1714000000000_signed_checklist.pdf"
  ]
}
```

**Response**

Same as `GET /api/v1/checklists/jobs/{jobId}`: `ChecklistResponse`.

**Recommended UX (your preferred flow)**

- Screen 1 (Checklist answers): call this endpoint with only `items` (skip `signed_checklist_files`)
- Screen 2 (Signed checklist documents): use the dedicated endpoint below to attach scans

### `PUT /api/v1/checklists/jobs/{jobId}/signed-checklist-files` (keys-only)

**Why:** Attach/replace/remove signed checklist scan keys **without** re-sending checklist items.

Required fields:

- `signed_checklist_files` (array of string) **required** (full replace)

```json
{
  "signed_checklist_files": [
    "surveys/signed-checklists/<jobId>/1714000000000_signed_checklist.pdf"
  ]
}
```

**Response**

Same as `GET /api/v1/checklists/jobs/{jobId}`: `ChecklistResponse`.

---

## 11) (Optional) Download auto-filled checklist DOCX (job-specific)

This is optional (UX feature): backend generates a filled DOCX using job/vessel data, caches it, and returns a signed URL.

### `GET /api/v1/checklist-templates/job/{jobId}/download?force=false`

**Why:** Provide a “Download filled checklist” button.

**Request**

Path params:

- `jobId` (uuid) **required**

Query params:

- `force` (boolean, default `false`) optional

**Response**

```json
{
  "success": true,
  "data": [
    {
      "fileName": "BOTTOM-INSPECTION-FILLED.docx",
      "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "expiresAt": "2026-04-26T10:00:00.000Z",
      "signedUrl": "https://signed-url"
    }
  ]
}
```

---

## 12) Upload proof (survey evidence package)

### `POST /api/v1/surveys/jobs/{jobId}/proof`

**Why:** Upload additional survey evidence after checklist is submitted.

**Option A — multipart upload**

- Form field: `proof` (binary)

**Option B — JSON with already-uploaded S3 key**

```json
{ "fileKey": "surveys/proofs/<jobId>/1714000000000_proof.jpg" }
```

**Response**

- `success` (boolean)
- `message` (string)
- `data` (object)
  - `url` (string)

```json
{
  "success": true,
  "message": "Proof uploaded successfully.",
  "data": { "url": "surveys/proofs/<jobId>/1714000000000_proof.jpg" }
}
```

**Notes**

- Multiple proof uploads are allowed before final submission.

---

## 13) Live GPS tracking (optional but recommended)

### `POST /api/v1/surveys/jobs/{jobId}/location`

**Why:** Keep updating location while survey is in progress.

```json
{
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

**Response**

- `success` (boolean)
- `message` (string)
- `data` (object)
  - `id` (uuid)
  - `job_id` (uuid)
  - `surveyor_id` (uuid)
  - `latitude` (number)
  - `longitude` (number)
  - `timestamp` (date-time)

---

## 14) Offline sync (optional)

### `POST /api/v1/surveys/jobs/{jobId}/sync`

**Why:** If mobile app collects checklist answers / GPS points offline, replay them in one call when network returns.

**Request**

All fields are optional (send what you have). Payload:

- `checklist` (array) optional
  - each item:
    - `question_code` (string) **required per item**
    - `question_text` (string) **required per item**
    - `answer` (string) **required per item** (same values as checklist: `YES|NO|NA`)
    - `remarks` (string|null) optional
- `gps_points` (array) optional
  - each point:
    - `latitude` (number) **required per point**
    - `longitude` (number) **required per point**
    - `captured_at` (date-time string) optional

```json
{
  "checklist": [
    { "question_code": "LSE001", "question_text": "Are life jackets available?", "answer": "YES", "remarks": "ok" }
  ],
  "gps_points": [
    { "latitude": 1.3521, "longitude": 103.8198, "captured_at": "2026-04-28T10:00:00.000Z" }
  ]
}
```

**Response**

- `success` (boolean)
- `message` (string)
- `synced` (object)
  - `checklist_items` (number)
  - `gps_points` (number)

```json
{
  "success": true,
  "message": "Offline data synced successfully.",
  "synced": { "checklist_items": 1, "gps_points": 1 }
}
```

---

## 15) Draft survey statement PDF (combined PDF includes signed checklist scans)

### `POST /api/v1/surveys/jobs/{jobId}/statement/draft`

**Why:** Generate a draft PDF the surveyor (and TM) can preview before final submission.

**Request**

Path params:

- `jobId` (uuid) **required**

Body (optional for TM/ADMIN, required in practice for SURVEYOR):

- `survey_statement` (string) optional

```json
{
  "survey_statement": "Inspection completed. No major findings."
}
```

**Response**

- `success` (boolean)
- `data` (object)
  - `message` (string)
  - `status` (string, example: `DRAFTED`)
  - `pdf_url` (url) optional (**only returned for TM/ADMIN**)

```json
{
  "success": true,
  "data": {
    "message": "Drafted successfully",
    "status": "DRAFTED",
    "pdf_url": "https://signed-url"
  }
}
```

**Important behavior**

- Draft PDF includes:
  - checklist table (with evidence links)
  - and **physically merged** pages from `signed_checklist_files` (PDFs)

**Do we “need” this?**

- If your UI is simple, you can treat this as **optional** and only show it as a “Preview” button.
- It is useful when you want one combined PDF preview before final submit / TM review.

---

## 16) Submit survey report (Check-out / final submit)

### `POST /api/v1/surveys`

**Why:** Final submission. Moves job to `SURVEY_DONE`.

**Pre-conditions (backend enforced)**

- Checklist must be submitted.
- Proof should be uploaded (optional if status is already `CHECKLIST_SUBMITTED` or `REWORK_REQUIRED`).
- Signed checklist scans should be attached.
- **NO REJECTED ITEMS**: All checklist items must be `PENDING` or `APPROVED`.
- **NO REJECTED DOCUMENTS**: All signed documents must be `PENDING` or `APPROVED`.

**Option A — multipart/form-data**

Fields:

- `job_id` (uuid) **required**
- `submit_latitude` (number) **required**
- `submit_longitude` (number) **required**
- `survey_statement` (string) optional
- `reason_if_outside` (string) optional
- `photo` (binary) optional if using `photoKey`
- `signature` (binary) optional if using `signatureKey`
- `photoKey` (string) optional alternative to uploading `photo`
- `signatureKey` (string) optional alternative to uploading `signature`

**Option B — application/json (direct-to-S3 already done)**

```json
{
  "job_id": "job-uuid",
  "submit_latitude": 1.3521,
  "submit_longitude": 103.8198,
  "survey_statement": "Inspection completed. No major findings.",
  "photoKey": "surveys/attendance/<jobId>/1714000000000_photo.jpg",
  "signatureKey": "surveys/signatures/<jobId>/1714000000000_signature.png"
}
```

**Response**
```json
{
  "success": true,
  "message": "Survey report submitted successfully.",
  "data": {
    "id": "survey-uuid",
    "job_id": "job-uuid",
    "survey_status": "SUBMITTED",
    "submission_count": 1,
    "declared_at": "2026-05-06T12:00:00Z",
    "attendance_photo_url": "https://...",
    "signature_url": "https://...",
    "survey_statement": "Inspection completed. No major findings.",
    "survey_statement_status": "DRAFTED"
  }
}
```

**Error Example (Granular Rejection Guard)**
If any checklist items or files are still `REJECTED`:
```json
{
  "success": false,
  "message": "Cannot submit report: 1 checklist items are still marked as REJECTED. Please correct them first.",
  "error_code": "REJECTION_OUTSTANDING"
}
```

**Locking Behavior**

- Once the survey is **`SUBMITTED`**, the checklist and proof become **read-only** in the app.
- The surveyor can only edit them if the job moves back to **`REWORK_REQUESTED`** (see §18).
- Once the TM **`FINALIZES`** the survey, it is locked forever (terminal state).

---

## 17) Reporting Non-Conformities (NCs)

### 17.1 `POST /api/v1/non-conformities`

**Why:** If the surveyor finds a major safety or technical violation during the survey, they should raise an NC. This alerts the Technical Manager (TM) immediately.

**Request**

```json
{
  "job_id": "job-uuid",
  "vessel_id": "vessel-uuid",
  "description": "Lifeboat engine failing to start after 3 attempts.",
  "severity": "HIGH"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "nc-uuid",
    "job_id": "job-uuid",
    "vessel_id": "vessel-uuid",
    "description": "Lifeboat engine failing to start after 3 attempts.",
    "severity": "HIGH",
    "status": "OPEN",
    "createdAt": "2026-05-06T10:00:00Z"
  }
}
```

### 17.2 `GET /api/v1/non-conformities/job/{jobId}`

**Why:** See all NCs currently active for this specific job.

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "nc-uuid",
      "severity": "HIGH",
      "status": "OPEN",
      "description": "...",
      "createdAt": "2026-05-06T10:00:00Z"
    }
  ]
}
```

---

## 17) Accessing Vessel History & Documents

### 17.1 `GET /api/v1/documents/vessel/{vesselId}`
**Why:** View all existing certificates or documents for the vessel to prepare for the survey.

---

## 18) Read survey data + timeline

### 18.1 `GET /api/v1/surveys/jobs/{jobId}`

**Why:** Survey detail screen (status, proof, statement URLs, etc.). Now includes the nested `JobRequest` with its **`ActivityPlannings`** (checklist findings).

**Response**
```json
{
  "success": true,
  "data": {
    "id": "survey-uuid",
    "job_id": "job-uuid",
    "survey_status": "SUBMITTED",
    "submission_count": 1,
    "declared_at": "2026-05-06T12:00:00Z",
    "attendance_photo_url": "https://...",
    "signature_url": "https://...",
    "survey_statement": "Completed successfully.",
    "survey_statement_status": "DRAFTED",
    "survey_statement_pdf_url": "https://...",
    "JobRequest": {
      "id": "job-uuid",
      "job_status": "SURVEY_DONE",
      "ActivityPlannings": [
        {
          "question_code": "LSE001",
          "answer": "YES",
          "remarks": "Verified"
        }
      ]
    }
  }
}
```

### 18.2 `GET /api/v1/surveys/jobs/{jobId}/timeline`

**Why:** Show “when each step happened” (start, checklist, proof, submit, rework).

**Response**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid",
    "gps_trace": [
      {
        "latitude": 1.3521,
        "longitude": 103.8198,
        "timestamp": "2026-05-06T10:00:00Z"
      }
    ],
    "survey_details": {
       "started_at": "2026-05-06T10:00:00Z",
       "submitted_at": "2026-05-06T12:00:00Z"
    }
  }
}
```

---

## 19) Rework loop (Granular Rejection System)

The system uses a **targeted rework flow**. Instead of rejecting the whole survey, the Technical Manager (TM) marks specific checklist items or files as `REJECTED`.

**How the app should handle this:**

1. **Job Status**: The job moves to `REWORK_REQUESTED`.
2. **Identification**: Call `GET /checklists/jobs/:jobId`.
   - Items with `status: "REJECTED"` must be highlighted in red.
   - Files in `signed_checklist_files` with `status: "REJECTED"` must be highlighted.
3. **Fixing Items**:
   - For a **rejected checklist item**: The surveyor modifies the answer, remarks, or re-uploads the photo, then calls `PUT /checklists/jobs/:jobId` sending that specific item. This resets the item status to `PENDING`.
4. **Fixing Files**:
   - For a **rejected signed file**: The surveyor re-uploads the corrected file and calls `PUT /checklists/jobs/:jobId/signed-checklist-files` with the new S3 key.
5. **Re-submission**:
   - Once all `REJECTED` markers are cleared (reset to `PENDING` via updates), the surveyor can call `POST /api/v1/surveys` again.
   - **Guard**: If the surveyor tries to submit while any item is still `REJECTED`, the backend will return a `400` error specifying the count of rejected items/files.

---

## 20) Notifications

### 20.1 `GET /api/v1/notifications`

**Why:** Show rework requests, assignments, status changes.

**Response**
```json
[
  {
    "id": "notif-uuid",
    "title": "Rework Requested",
    "message": "Please re-upload photos for Lifeboat #2. They are blurry.",
    "type": "REWORK",
    "is_read": false,
    "created_at": "2026-05-06T13:00:00Z"
  }
]
```

### 18.2 `PUT /api/v1/notifications/{id}/read`

**Response**

```json
{ "success": true, "message": "Request successful" }
```

### 18.3 `PUT /api/v1/notifications/read-all`

**Response**

```json
{ "success": true, "message": "Request successful" }
```

---

## 21) Documents module (optional utility)

SURVEYOR can also use generic documents APIs for attaching files to entities (JOB, SURVEY, etc.).

Preferred approach for big files is direct-to-S3:

1) `GET /api/v1/documents/get-upload-url` → returns `{ uploadUrl, fileKey }`
2) `PUT uploadUrl` with binary
3) `POST /api/v1/documents/register` (or entity register) to store metadata if your UI needs it

### 21.1 `GET /api/v1/documents/get-upload-url`

**Query**

- `fileName` (string) **required** (example: `report.pdf`)
- `fileType` (string) **required** (MIME type; example: `application/pdf`)
- `folder` (string) optional (example: `surveys`)

**Response**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3-presigned-put-url",
    "fileKey": "surveys/1714000000000_report.pdf"
  }
}
```

### 19.2 `POST /api/v1/documents/register`

**Request**

Required fields:

- `fileKey` (string) **required**

Optional fields:

- `fileType` (string) optional (MIME type)
- `document_type` (string) optional
- `description` (string) optional

```json
{
  "fileKey": "surveys/1714000000000_report.pdf",
  "fileType": "application/pdf",
  "document_type": "EVIDENCE",
  "description": "Survey attachment"
}
```

**Response**

```json
{ "success": true, "message": "Request successful" }
```

---

## 22) Surveyor self utilities (optional)

### 22.1 `POST /api/v1/surveyors/availability`

**Why:** Mark surveyor availability (for assignment logic).

**Request**
- `is_available` (boolean) **required**

```json
{ "is_available": true }
```

**Response**
- `success` (boolean)
- `data` (object) updated surveyor profile (includes `is_available` etc.)

### 22.2 `POST /api/v1/surveyors/location`

**Why:** Passive background location updates (separate from survey streaming).

**Request**
- `latitude` (number) **required**
- `longitude` (number) **required**

```json
{ "latitude": 1.3521, "longitude": 103.8198 }
```

**Response**
```json
{ "success": true, "data": { "success": true } }
```

### 22.3 `GET /api/v1/surveyors/{id}/profile`

**Why:** Profile screen (authorized certificates, contact info, etc.).

**Request**

Path params:

- `id` (uuid) **required** (user id OR surveyor profile id)

**Response**

- `success` (boolean)
- `message` (string)
- `data` (object) surveyor profile:
  - `id` (uuid) (profile id)
  - `user_id` (uuid)
  - `license_number` (string)
  - `authorized_ship_types` (array of string) optional
  - `authorized_certificates` (array of string) optional
  - `valid_from` (date-time)
  - `valid_to` (date-time|null) optional
  - `is_available` (boolean)
  - `nationality` (string|null) optional
  - `qualification` (string|null) optional
  - `years_of_experience` (number|null) optional
  - `cv_url` (url|null) optional
  - `id_proof_url` (url|null) optional
  - `license_copy_url` (url|null) optional
  - `User` (object)
    - `id`, `name`, `email`, `phone`, `role`, `status`
  - `application` (object|null) optional
