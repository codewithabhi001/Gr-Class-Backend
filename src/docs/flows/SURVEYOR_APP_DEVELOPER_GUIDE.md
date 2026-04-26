# Surveyor App Developer Guide (Login → Survey Done)

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

```json
{
  "email": "surveyor@example.com",
  "password": "your-password"
}
```

**Store locally**

- `accessToken` (used on every request)
- `refreshToken` (for silent re-login)
- `me` user object if returned by backend (id, role, name)

### 1.2 `POST /api/v1/auth/refresh-token`

**Why:** Get a new access token when it expires.

---

## 2) Home screen / dashboard

### `GET /api/v1/dashboard`

**Why:** Quick counts and “what needs attention” cards for the surveyor.

---

## 3) Job list (SURVEYOR sees only assigned jobs)

### 3.1 `GET /api/v1/jobs`

**Why:** This is the surveyor’s job inbox.

**Common filters**

- `?status=ASSIGNED,SURVEY_AUTHORIZED,IN_PROGRESS,REWORK_REQUESTED`

**Important behavior**

- Backend filters the list for SURVEYOR to **only assigned jobs**.

### 3.2 `GET /api/v1/jobs/{jobId}`

**Why:** Job detail screen (vessel, certificate type, job status, documents, etc.).

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

```json
{
  "job_id": "job-uuid",
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

**UI notes**

- Only show this button when job status is `SURVEY_AUTHORIZED`.
- If user is outside allowed radius, backend may require “reason” depending on config/rules (handle 400 with message).

---

## 6) Checklist screen (single API to load everything)

### 6.1 `GET /api/v1/checklists/jobs/{jobId}`

**Why:** Load the entire checklist screen in one call:

- Digital checklist items (questions + current answers)
- Per-item evidence URLs (`file_url`) as **full HTTPS URLs**
- Signed checklist scan(s) (`signed_checklist_files`) as **full HTTPS URLs**
- Reference/blank template documents (`template_files`) for download (from active checklist template)

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
        "file_url": "https://signed-url-to-evidence.jpg"
      }
    ],
    "signed_checklist_files": [
      "https://signed-url-to-signed-checklist.pdf"
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

**Important behavior**

- This endpoint returns **URLs** (not raw S3 keys). Keep those URLs for preview/download only.
- To update checklist answers and attachments you still send **S3 keys** in the PUT step below.

---

## 7) Upload checklist evidence (per question)

Checklist evidence is uploaded **directly to S3** via a pre-signed URL, then the returned `fileKey` is saved against the checklist item.

### 7.1 `GET /api/v1/checklists/jobs/{jobId}/get-upload-url`

**Why:** Get a pre-signed S3 PUT URL for a single evidence file (photo).

**Query**

- `fileName`: e.g. `engine_room.jpg`
- `contentType`: e.g. `image/jpeg`

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

### 7.2 Upload binary to S3

**Why:** This avoids sending big files through backend; faster and cheaper.

**Do**

- HTTP `PUT` the file to `uploadUrl` with `Content-Type` header.

**Store**

- Save the returned `fileKey` to use as `file_url` in checklist submission.

---

## 8) Upload “signed checklist scan” (filled + signed doc(s))

This is the scanned / signed checklist PDF/JPG that must be attached before final survey submission.

**Important clarification (common confusion):**

- `template_files` / `download` APIs are for **reference or prefilled blank forms** (DOCX/PDF) that the surveyor downloads to fill.
- `signed_checklist_files` are **new uploads created by the surveyor** after filling & signing the checklist (scan/photo/export-to-PDF).
  They are **not expected** to be “download the same file and re-upload it”.

### 8.1 `GET /api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url`

**Why:** Get a pre-signed S3 PUT URL for the full signed checklist scan.

**Query**

- `fileName`: e.g. `signed_checklist.pdf`
- `contentType`: e.g. `application/pdf`

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

### 8.2 Upload to S3 (PUT)

Same as evidence upload.

---

## 9) Save checklist answers + attach uploaded file keys

### `PUT /api/v1/checklists/jobs/{jobId}`

**Why:** This is the **only** API that persists checklist state:

- Answers (YES/NO/NA etc.)
- Per-item evidence keys (`file_url`)
- Signed checklist scan keys (`signed_checklist_files`)

**Important**

- `signed_checklist_files` is treated as a **full replace** array. To “remove”, send `[]`.
- You can update checklist multiple times until final submission / finalization.
- `signed_checklist_files` must contain the **S3 keys returned by** `signed-checklist-upload-url` (after uploading scan/PDF to S3).
  The UI should show the *resolved URLs* from `GET /checklists/jobs/:jobId`, but should *store/send keys* on this PUT.

**Recommended UX (your preferred flow)**

- Screen 1 (Checklist answers): call this endpoint with only `items` (skip `signed_checklist_files`)
- Screen 2 (Signed checklist documents): use the dedicated endpoint below to attach scans

### `PUT /api/v1/checklists/jobs/{jobId}/signed-checklist-files` (keys-only)

**Why:** Attach/replace/remove signed checklist scan keys **without** re-sending checklist items.

```json
{
  "signed_checklist_files": [
    "surveys/signed-checklists/<jobId>/1714000000000_signed_checklist.pdf"
  ]
}
```

**Request**

```json
{
  "items": [
    {
      "question_code": "LSE001",
      "question_text": "Are life jackets available?",
      "answer": "YES",
      "remarks": "Verified count matches record",
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

**What to do after success**

- Re-fetch `GET /checklists/jobs/:jobId` to display resolved URLs again.

---

## 10) (Optional) Download auto-filled checklist DOCX (job-specific)

This is optional (UX feature): backend generates a filled DOCX using job/vessel data, caches it, and returns a signed URL.

### `GET /api/v1/checklist-templates/job/{jobId}/download?force=false`

**Why:** Provide a “Download filled checklist” button.

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

## 11) Upload proof (survey evidence package)

### `POST /api/v1/surveys/jobs/{jobId}/proof`

**Why:** Upload additional survey evidence after checklist is submitted.

**Option A — multipart upload**

- Form field: `proof` (binary)

**Option B — JSON with already-uploaded S3 key**

```json
{ "fileKey": "surveys/proofs/<jobId>/1714000000000_proof.jpg" }
```

**Notes**

- Multiple proof uploads are allowed before final submission.

---

## 12) Live GPS tracking (optional but recommended)

### `POST /api/v1/surveys/jobs/{jobId}/location`

**Why:** Keep updating location while survey is in progress.

```json
{
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

---

## 13) Offline sync (optional)

### `POST /api/v1/surveys/jobs/{jobId}/sync`

**Why:** If mobile app collects checklist answers / GPS points offline, replay them in one call when network returns.

Implementation depends on payload expected by backend. Use this endpoint only if the app has offline batching enabled.

---

## 14) Draft survey statement PDF (combined PDF includes signed checklist scans)

### `POST /api/v1/surveys/jobs/{jobId}/statement/draft`

**Why:** Generate a draft PDF the surveyor (and TM) can preview before final submission.

**Important behavior**

- Draft PDF includes:
  - checklist table (with evidence links)
  - and **physically merged** pages from `signed_checklist_files` (PDFs)

**Do we “need” this?**

- If your UI is simple, you can treat this as **optional** and only show it as a “Preview” button.
- It is useful when you want one combined PDF preview before final submit / TM review.

---

## 15) Submit survey report (Check-out / final submit)

### `POST /api/v1/surveys`

**Why:** Final submission. Moves job to `SURVEY_DONE`.

**Pre-conditions (backend enforced)**

- Checklist must be submitted
- Proof should be uploaded (based on lifecycle rules)
- Signed checklist scans should be attached (`signed_checklist_files.length > 0`) as a hard guard in the workflow

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

---

## 16) Read survey data + timeline

### 16.1 `GET /api/v1/surveys/jobs/{jobId}`

**Why:** Survey detail screen (status, proof, statement URLs, etc.).

### 16.2 `GET /api/v1/surveys/jobs/{jobId}/timeline`

**Why:** Show “when each step happened” (start, checklist, proof, submit, rework).

---

## 17) Rework loop (when TM/GM requests corrections)

When rework is requested, surveyor typically repeats:

- Fix checklist answers and/or replace `signed_checklist_files` via `PUT /checklists/jobs/:jobId`
- Upload additional proof via `POST /surveys/jobs/:jobId/proof`
- Re-submit via `POST /surveys`

The backend treats checklist updates and signed-scan replacement as idempotent full replace operations.

---

## 18) Notifications

### 18.1 `GET /api/v1/notifications`

**Why:** Show rework requests, assignments, status changes.

### 18.2 `PUT /api/v1/notifications/{id}/read`

### 18.3 `PUT /api/v1/notifications/read-all`

---

## 19) Documents module (optional utility)

SURVEYOR can also use generic documents APIs for attaching files to entities (JOB, SURVEY, etc.).

Preferred approach for big files is direct-to-S3:

1) `GET /api/v1/documents/get-upload-url` → returns `{ uploadUrl, fileKey }`
2) `PUT uploadUrl` with binary
3) `POST /api/v1/documents/register` (or entity register) to store metadata if your UI needs it

---

## 20) Surveyor self utilities (optional)

### 20.1 `POST /api/v1/surveyors/availability`

**Why:** Mark surveyor availability (for assignment logic).

### 20.2 `POST /api/v1/surveyors/location`

**Why:** Passive background location updates (separate from survey streaming).

### 20.3 `GET /api/v1/surveyors/{id}/profile`

**Why:** Profile screen (authorized certificates, contact info, etc.).

