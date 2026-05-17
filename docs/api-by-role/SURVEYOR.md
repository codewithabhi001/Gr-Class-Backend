# Fully Detailed API Documentation: SURVEYOR Role

> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **SURVEYOR** role.

## 🚀 Auth

---

### POST `/api/v1/auth/login`
**Summary:** Login
**Description:** Authenticate with email and password. Returns user, **accessToken** (short-lived, for API calls), and **refreshToken** (long-lived, for getting new access tokens).
Use **accessToken** in header: `Authorization: Bearer &lt;accessToken&gt;`. Store tokens securely.


**Note:** Default credentials for **SURVEYOR** have been pre-filled for testing.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "email": "admin@grclass.com",
  "password": "SecurePass123!"
}
```

#### Responses
<details><summary><strong>200</strong> - Login successful</summary>

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "profile_pic_url": "string",
    "force_password_reset": true,
    "last_login_at": "2026-03-07T12:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Invalid credentials</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/logout`
**Summary:** Logout
**Description:** Invalidate current session. Clears tokens; response includes accessToken and refreshToken as null.

#### Responses
<details><summary><strong>200</strong> - Logged out successfully</summary>

```json
{
  "message": "Logged out successfully",
  "accessToken": "string",
  "refreshToken": "string"
}
```

</details>

<details><summary><strong>401</strong> - Not authenticated</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/refresh-token`
**Summary:** Refresh token
**Description:** Get new **accessToken** and **refreshToken** using a valid refresh token. Send refresh token in body (`refreshToken` or `token`) or in cookie. Response returns both tokens.


#### Request Body
**Content-Type:** `application/json`

```json
{
  "refreshToken": "string",
  "token": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Tokens refreshed</summary>

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "profile_pic_url": "string",
    "force_password_reset": true,
    "last_login_at": "2026-03-07T12:00:00Z"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

</details>

<details><summary><strong>401</strong> - Invalid or expired refresh token</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/forgot-password`
**Summary:** Forgot password
**Description:** Request password reset email.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "email": "user@grclass.com"
}
```

#### Responses
<details><summary><strong>200</strong> - Password reset email sent</summary>

```json
{
  "message": "Password reset email sent"
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/reset-password`
**Summary:** Reset password
**Description:** Reset password using token from email.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "token": "string",
  "newPassword": "SecurePass123"
}
```

#### Responses
<details><summary><strong>200</strong> - Password reset successfully</summary>

```json
{
  "message": "Password reset successfully"
}
```

</details>

<details><summary><strong>400</strong> - Invalid or expired token</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/change-password`
**Summary:** Change password
**Description:** Change password for currently logged-in user.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Password changed successfully</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Checklist Templates

---

### GET `/api/v1/checklist-templates/job/{jobId}`
**Summary:** Get template for a specific job

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Template for job</summary>

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "string",
    "code": "string",
    "description": "string",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "sections": [
      {
        "title": "string",
        "items": [
          "..."
        ]
      }
    ],
    "status": "string",
    "template_files": [
      "string"
    ],
    "metadata": {},
    "created_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "updated_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - No active template for this certificate type</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/checklist-templates/job/{jobId}/download`
**Summary:** Download auto-filled checklist DOCX for a job
**Description:** Generates a job-specific DOCX by filling Word content-controls (by Tag) with vessel/job data, caches it as a JOB document, and returns signed URLs.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 
- **force** (`query` | `boolean` | *Optional*): Regenerate even if a cached document already exists

#### Responses
<details><summary><strong>200</strong> - Signed URL(s) for filled DOCX</summary>

```json
{
  "success": true,
  "data": [
    {
      "fileName": "string",
      "contentType": "string",
      "expiresAt": "2026-03-07T12:00:00Z",
      "signedUrl": "string"
    }
  ]
}
```

</details>

<details><summary><strong>400</strong> - Template has no template_files configured</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job or active template not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Checklists

---

### GET `/api/v1/checklists/jobs/{jobId}`
**Summary:** Get checklist for a job
**Description:** Returns the checklist items for a job **plus** the resolved (signed)
HTTPS URLs of any full signed-checklist scan documents that were
attached to the underlying survey.

All `file_url` fields and `signed_checklist_files` entries are guaranteed
to be either fully-qualified HTTPS URLs or `null` — raw S3 keys are never
returned to the client.


#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job
- **answer** (`query` | `string` | *Optional*): Filter by answer status
- **question_code** (`query` | `string` | *Optional*): Filter by specific question code
- **search** (`query` | `string` | *Optional*): Search in question text or remarks

#### Responses
<details><summary><strong>200</strong> - Checklist retrieved successfully</summary>

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "job_id": "...",
        "question_code": "...",
        "question_text": "...",
        "answer": "...",
        "remarks": "...",
        "file_url": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "signed_checklist_files": [
      "string"
    ],
    "template_files": [
      "string"
    ],
    "template": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "code": "string"
    }
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/checklists/jobs/{jobId}`
**Summary:** Submit checklist (answers + optional signed-scan files)
**Description:** Submit / replace the checklist answers for a job. In the **same call**
the surveyor can also attach the S3 keys of the full signed-checklist
scan document(s) — obtained earlier from
`GET /checklists/jobs/{jobId}/signed-checklist-upload-url`.

Re-submission is allowed until the survey is finalized. Only the
assigned `SURVEYOR` can perform this action while the survey is in an
active state (`STARTED`, `CHECKLIST_SUBMITTED`, `PROOF_UPLOADED`,
or `REWORK_REQUIRED`).


#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job

#### Request Body
**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "question_code": "string",
      "question_text": "string",
      "answer": "string",
      "remarks": "string",
      "file_url": "string"
    }
  ],
  "signed_checklist_files": [
    "string"
  ]
}
```

#### Responses
<details><summary><strong>200</strong> - Checklist submitted successfully</summary>

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "job_id": "...",
        "question_code": "...",
        "question_text": "...",
        "answer": "...",
        "remarks": "...",
        "file_url": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "signed_checklist_files": [
      "string"
    ],
    "template_files": [
      "string"
    ],
    "template": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "code": "string"
    }
  }
}
```

</details>

<details><summary><strong>400</strong> - Bad Request (invalid state, terminal job, etc.)</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden — caller is not the assigned surveyor</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/checklists/jobs/{jobId}/get-upload-url`
**Summary:** Get upload URL for a single checklist-item evidence photo
**Description:** Generates a pre-signed S3 URL so the surveyor can directly upload one
photo of evidence for a **single** checklist item (e.g. a failing item).
The returned `fileKey` is then passed back as `file_url` on that item
in the next `PUT /checklists/jobs/{jobId}` call.


#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job
- **fileName** (`query` | `string` | *Required*): The filename with extension (e.g. proof.jpg)
- **contentType** (`query` | `string` | *Required*): The MIME type of the file (e.g. image/jpeg)

#### Responses
<details><summary><strong>200</strong> - Upload URL generated successfully</summary>

```json
{
  "success": true,
  "data": {
    "uploadUrl": "string",
    "fileKey": "jobs/01933c5e.../report.pdf"
  }
}
```

</details>

<details><summary><strong>400</strong> - Bad Request</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden — caller is not the assigned surveyor</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url`
**Summary:** Get upload URL for the full signed-checklist scan
**Description:** Generates a pre-signed S3 URL so the surveyor can upload the full
filled & signed checklist document (PDF / image) — one or more files
representing the actual signed sheet.

After uploading directly to S3 with the returned `uploadUrl`, send the
`fileKey` back inside the `signed_checklist_files` array on the next
`PUT /checklists/jobs/{jobId}` call.


#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job
- **fileName** (`query` | `string` | *Required*): The filename with extension (e.g. signed_checklist.pdf)
- **contentType** (`query` | `string` | *Required*): The MIME type of the file (e.g. application/pdf)

#### Responses
<details><summary><strong>200</strong> - Upload URL generated successfully</summary>

```json
{
  "success": true,
  "data": {
    "uploadUrl": "string",
    "fileKey": "jobs/01933c5e.../report.pdf"
  }
}
```

</details>

<details><summary><strong>400</strong> - Bad Request (job not survey-eligible / terminal state)</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden — caller is not the assigned surveyor</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/checklists/jobs/{jobId}/signed-checklist-files`
**Summary:** Update signed checklist scan files (keys only)
**Description:** Updates **only** the `signed_checklist_files` array for the job's survey.

Use this when your UI flow is split into two screens:
1) Save checklist answers (PUT `/checklists/jobs/{jobId}`)
2) Upload signed checklist scan(s) and attach them here

The array is treated as a **full replace**:
- To replace files: send the new full array
- To remove all: send `[]`

Each entry must be an S3 key obtained from
`GET /checklists/jobs/{jobId}/signed-checklist-upload-url`.


#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job

#### Request Body
**Content-Type:** `application/json`

```json
{
  "signed_checklist_files": [
    "string"
  ]
}
```

#### Responses
<details><summary><strong>200</strong> - Updated signed checklist files</summary>

```json
{
  "success": true,
  "data": {
    "signed_checklist_files": [
      "string"
    ]
  }
}
```

</details>

<details><summary><strong>400</strong> - Bad Request (invalid state, terminal job, etc.)</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden — caller is not the assigned surveyor</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Dashboard

---

### GET `/api/v1/dashboard`
**Summary:** Get dashboard
**Description:** Get role-specific dashboard data. Structure varies by user role:
- ADMIN: System-wide stats, pending approvals
- GM: Management dashboard
- TM: Technical manager view
- TO: Technical officer view
- SURVEYOR: Assigned jobs, availability
- CLIENT: Vessel/job overview


#### Responses
<details><summary><strong>200</strong> - Dashboard data</summary>

```json
{
  "success": true,
  "data": {
    "stats": {},
    "recentJobs": [
      null
    ],
    "expiringCertificates": [
      null
    ],
    "alerts": [
      {
        "type": "string",
        "message": "string"
      }
    ]
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Documents

---

### GET `/api/v1/documents/get-upload-url`
**Summary:** Generate a pre-signed URL for direct S3 upload
**Description:** Returns a temporary S3 URL where the client can PUT the file binary, and a fileKey to be used for registration.

#### Parameters
- **fileName** (`query` | `string` | *Required*): 
- **fileType** (`query` | `string` | *Required*): MIME type of the file
- **folder** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - Pre-signed URL generated</summary>

```json
{
  "success": true,
  "data": {
    "uploadUrl": "string",
    "fileKey": "string"
  }
}
```

</details>

---

### POST `/api/v1/documents/upload`
**Summary:** Upload a standalone document file (Multipart)
**Description:** Standard way to upload a file through the backend server. Use Pre-signed URL for better performance.

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `file` (Required): `FILE` 
- `folder` (Optional): `string` - Optional folder name for grouping (e.g. 'vessels', 'user-docs')

```json
{
  "file": "<FILE_UPLOAD>",
  "folder": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - File uploaded successfully</summary>

```json
{
  "success": true,
  "data": {
    "file_url": "https://bucket.s3.amazonaws.com/temp/my-file.pdf"
  }
}
```

</details>

<details><summary><strong>400</strong> - No file provided</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/register`
**Summary:** Register an already uploaded S3 file (Standalone)
**Description:** Use this after direct-to-S3 upload to register the file in the backend.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileKey": "string",
  "fileType": "string",
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Registered</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/{entityType}/{entityId}/register`
**Summary:** Register an already uploaded S3 file for a specific entity
**Description:** Similar to direct upload but uses JSON registration.

#### Parameters
- **entityType** (`path` | `string` | *Required*): 
- **entityId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileData": {
    "url": "string",
    "type": "string"
  },
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Registered</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/documents/{entityType}/{entityId}`
**Summary:** Get documents

#### Parameters
- **entityType** (`path` | `string` | *Required*): The type of entity (e.g., VESSEL, JOB, CERTIFICATE, USER, SURVEY)
- **entityId** (`path` | `string` | *Required*): The UUID of the specific entity

#### Responses
<details><summary><strong>200</strong> - List of documents retrieved successfully</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_type": "string",
      "entity_id": "123e4567-e89b-12d3-a456-426614174000",
      "file_url": "string",
      "uploaded_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/{entityType}/{entityId}`
**Summary:** Upload document

#### Parameters
- **entityType** (`path` | `string` | *Required*): The type of entity to attach the document to (e.g., VESSEL, JOB, CERTIFICATE, USER, SURVEY)
- **entityId** (`path` | `string` | *Required*): The UUID of the specific entity

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileData": {
    "url": "string",
    "type": "string"
  },
  "document_type": "string",
  "description": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `files` (Required): `array` 
- `document_type` (Optional): `string` - Type of document (e.g., EVIDENCE, REPORT)
- `description` (Optional): `string` - Optional description of the document

```json
{
  "files": [
    "<FILE_UPLOAD>"
  ],
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Documents uploaded successfully</summary>

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "file_url": "string",
      "document_type": "string",
      "description": "string"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/documents/{id}`
**Summary:** Get document by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Document retrieved successfully</summary>

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "entity_type": "string",
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "file_url": "string",
    "uploaded_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Document not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Health

---

### GET `/api/v1/health`
**Summary:** Health check
**Description:** Returns server health status. No authentication required.

#### Responses
<details><summary><strong>200</strong> - Server is healthy</summary>

```json
{
  "status": "UP",
  "timestamp": "2026-03-07T12:00:00Z"
}
```

</details>

---

## 🚀 Jobs

---

### GET `/api/v1/jobs/upload-url`
**Summary:** Get presigned S3 upload URL for job documents
**Description:** Generates a signed URL for uploading files directly to S3. 
Returns the `uploadUrl` (where to PUT the file) and the `fileKey` 
(to be used as `file_url` in subsequent job registration calls).

**Roles:** CLIENT, ADMIN, GM, TM, SURVEYOR


#### Parameters
- **fileName** (`query` | `string` | *Required*): 
- **fileType** (`query` | `string` | *Required*): 
- **folder** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - Presigned URL generated</summary>

```json
{
  "success": true,
  "data": {
    "uploadUrl": "string",
    "fileKey": "jobs/1714398721-cert.pdf"
  }
}
```

</details>

---

### GET `/api/v1/jobs`
**Summary:** List jobs (role-filtered)
**Description:** Returns a paginated list of job requests. Visible set depends on caller role:
- **CLIENT** – Only jobs for their fleet (vessel_id filtered to client).
- **SURVEYOR** – Only jobs assigned to them (`assigned_surveyor_id = me`).
- **ADMIN / GM / TM / TO** – All jobs; defaults to last 30 days
  unless explicit filters are supplied.

Supply `status` as a **comma-separated** string to filter by multiple statuses,
e.g. `?status=ASSIGNED,SURVEY_AUTHORIZED`.


#### Parameters
- **page** (`query` | `integer` | *Optional*): Page number (1-indexed)
- **limit** (`query` | `integer` | *Optional*): Records per page
- **status** (`query` | `string` | *Optional*): Filter by status (single value or comma-separated list)
- **vessel_id** (`query` | `string` | *Optional*): 
- **certificate_type_id** (`query` | `string` | *Optional*): 
- **assigned_surveyor_id** (`query` | `string` | *Optional*): 
- **target_port** (`query` | `string` | *Optional*): 
- **created_from** (`query` | `string` | *Optional*): ISO date string – start of creation window
- **created_to** (`query` | `string` | *Optional*): ISO date string – end of creation window
- **recent_days** (`query` | `integer` | *Optional*): (Internal roles only) Shortcut to filter to last N days when no other date
filter is given. Default is 30.


#### Responses
<details><summary><strong>200</strong> - List of jobs</summary>

```json
{
  "success": true,
  "data": {
    "total": 48,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "status_counts": [
      {
        "status": "CREATED",
        "count": 5
      }
    ],
    "jobs": [
      {
        "id": "...",
        "job_request_number": "GRJ-B1C2D3E4",
        "job_status": "string",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "target_port": "string",
        "target_date": "string",
        "priority": "string",
        "createdAt": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
        },
        "survey": {
          "id": "...",
          "survey_status": "..."
        },
        "payment_status": "string"
      }
    ]
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized – missing or invalid token</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden – role not allowed</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/jobs/{id}`
**Summary:** Get job details
**Description:** Returns full job detail including vessel, certificate type, status history,
uploaded documents, reschedule records, and certificate (with signed URL if
applicable).
- **CLIENT** – Own fleet only.
- **SURVEYOR** – Only if assigned to them.
- **ADMIN / GM / TM / TO** – Any job.


#### Parameters
- **id** (`path` | `string` | *Required*): Job UUID

#### Responses
<details><summary><strong>200</strong> - Job details</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_request_number": "GRJ-B1C2D3E4",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "requested_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "job_status": "string",
    "priority": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "is_survey_required": true,
    "reschedule_count": 0,
    "payment_status": "UNPAID",
    "certificate_url": "string",
    "certificate_number": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo",
      "class_status": "string"
    },
    "CertificateType": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "issuing_authority": "string"
    },
    "survey": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "survey_status": "string",
      "survey_statement_status": "string",
      "survey_statement_pdf_url": "string",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "signed_checklist_files": [
        "string"
      ]
    },
    "ActivityPlannings": [
      {
        "id": "...",
        "job_id": "...",
        "question_code": "...",
        "question_text": "...",
        "answer": "...",
        "remarks": "...",
        "file_url": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "Payments": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "amount_collected": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "remaining": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
      }
    ],
    "requester": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "surveyor": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string"
    },
    "approver": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/jobs/{id}/history`
**Summary:** ADMIN/GM/TM/TO/CLIENT/SURVEYOR: Job status history & audit trail
**Description:** Returns a chronological list of all status transitions for the job,
including who made each change and the reason.

**Roles:** ADMIN, GM, TM, TO, CLIENT, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Status history list</summary>

```json
{
  "success": true,
  "data": {
    "job_history": [
      {
        "id": "...",
        "job_id": "...",
        "previous_status": "...",
        "new_status": "...",
        "changed_by": "...",
        "reason": "...",
        "created_at": "...",
        "User": "..."
      }
    ],
    "survey_history": [
      {
        "id": "...",
        "survey_id": "...",
        "previous_status": "...",
        "new_status": "...",
        "changed_by": "...",
        "reason": "...",
        "submission_iteration": "...",
        "created_at": "...",
        "User": "..."
      }
    ]
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/jobs/{id}/messages/external`
**Summary:** Get external (client-visible) messages
**Description:** Returns the external message thread for a job — visible to CLIENT,
staff, and the assigned SURVEYOR.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - External message thread</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "sender_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "message_text": "string",
      "is_internal": true,
      "attachment_url": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "Sender": {
        "name": "string",
        "role": "string"
      }
    }
  ]
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/jobs/{id}/messages`
**Summary:** Send message (with optional attachment)
**Description:** Posts a new message to the job thread. Supports text-only or multipart
with a file attachment.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "content": "Vessel is ready for inspection.",
  "attachment_url": "https://s3.aws.com/girik/attachments/my-image.jpg"
}
```

#### Responses
<details><summary><strong>201</strong> - Message sent successfully.</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "sender_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "message_text": "string",
    "is_internal": true,
    "attachment_url": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "Sender": {
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Non-Conformities

---

### POST `/api/v1/non-conformities`
**Summary:** Create NC

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "string",
  "severity": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - NC created</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/non-conformities/{id}`
**Summary:** Get NC by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - NC detail</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "description": "string",
    "severity": "string",
    "status": "string",
    "closure_remarks": "string",
    "closed_at": "2026-03-07T12:00:00Z",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>404</strong> - Not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/non-conformities/job/{jobId}`
**Summary:** Get NCs by job

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - List of NCs</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "severity": "string",
      "status": "string",
      "created_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Notifications

---

### GET `/api/v1/notifications`
**Summary:** Get notifications

#### Responses
<details><summary><strong>200</strong> - List of notifications retrieved successfully</summary>

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Job Assigned",
    "message": "You have been assigned to survey Sea Star.",
    "type": "JOB_ASSIGNED",
    "is_read": false,
    "created_at": "2026-03-07T12:00:00Z"
  }
]
```

</details>

---

### PUT `/api/v1/notifications/{id}/read`
**Summary:** Mark as read

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Marked as read</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### PUT `/api/v1/notifications/read-all`
**Summary:** Mark all as read

#### Responses
<details><summary><strong>200</strong> - All marked as read</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 Search

---

### GET `/api/v1/search`
**Summary:** Global search
**Description:** Search across vessels, jobs, and certificates. Results are filtered by user's role and scope.

#### Parameters
- **q** (`query` | `string` | *Required*): Search query string (min 3 chars)
- **type** (`query` | `string` | *Optional*): Filter by specific entity type

#### Responses
<details><summary><strong>200</strong> - Search results</summary>

```json
{
  "success": true,
  "data": {
    "vessels": [
      {
        "id": "...",
        "vessel_name": "Ocean Pioneer",
        "imo_number": "9123456",
        "flag_administration_id": "...",
        "ship_type": "Cargo",
        "class_status": "string"
      }
    ],
    "jobs": [
      {
        "id": "...",
        "job_request_number": "GRJ-B1C2D3E4",
        "job_status": "string",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "target_port": "string",
        "target_date": "string",
        "priority": "string",
        "createdAt": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
        },
        "survey": {
          "id": "...",
          "survey_status": "..."
        },
        "payment_status": "string"
      }
    ],
    "certificates": [
      {
        "id": "...",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "certificate_number": "string",
        "issue_date": "string",
        "expiry_date": "string",
        "status": "string",
        "created_at": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
        }
      }
    ]
  }
}
```

</details>

---

## 🚀 Support

---

### POST `/api/v1/support`
**Summary:** Create support ticket

#### Request Body
**Content-Type:** `application/json`

```json
{
  "subject": "string",
  "description": "string",
  "message": "string",
  "priority": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Ticket created</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/support`
**Summary:** Get support tickets

#### Parameters
- **status** (`query` | `string` | *Optional*): 
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of tickets</summary>

```json
{
  "success": true,
  "data": {
    "count": 0,
    "rows": [
      {
        "id": "...",
        "ticket_number": "string",
        "subject": "string",
        "priority": "string",
        "status": "string",
        "category": "string",
        "user_id": "...",
        "created_at": "2026-03-07T12:00:00Z"
      }
    ]
  }
}
```

</details>

---

### GET `/api/v1/support/{id}`
**Summary:** Get ticket by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Ticket detail</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "subject": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "category": "string",
    "resolved_at": "2026-03-07T12:00:00Z",
    "resolved_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>404</strong> - Ticket not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Surveyors

---

### GET `/api/v1/surveyors/{id}/profile`
**Summary:** Get surveyor profile
**Description:** Fetches the surveyor profile. Accepts either User ID or Surveyor Profile ID.

#### Parameters
- **id** (`path` | `string` | *Required*): User ID or Surveyor Profile ID

#### Responses
<details><summary><strong>200</strong> - Surveyor profile</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/surveyors/availability`
**Summary:** Update availability

#### Request Body
**Content-Type:** `application/json`

```json
{
  "is_available": true
}
```

#### Responses
<details><summary><strong>200</strong> - Availability updated</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/surveyors/location`
**Summary:** Report location

#### Request Body
**Content-Type:** `application/json`

```json
{
  "latitude": 0,
  "longitude": 0
}
```

#### Responses
<details><summary><strong>200</strong> - Location reported</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Surveys

---

### POST `/api/v1/surveys/start`
**Summary:** Start survey (Check-in)
**Description:** Surveyor checks in at the vessel location. Sets job status to IN_PROGRESS.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

#### Responses
<details><summary><strong>201</strong> - Survey started</summary>

```json
{
  "success": true,
  "message": "Survey Started",
  "data": {
    "message": "string",
    "job_id": "123e4567-e89b-12d3-a456-426614174000",
    "started_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/surveys`
**Summary:** Submit survey report (Check-out)
**Description:** Surveyor submits final findings and attendance photo. Sets job status to SURVEY_DONE. Requires checklist submission first.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "submit_latitude": 0,
  "submit_longitude": 0,
  "survey_statement": "string",
  "photoKey": "string",
  "signatureKey": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `job_id` (Required): `string` 
- `submit_latitude` (Required): `number` - Latitude at submission (check-out)
- `submit_longitude` (Required): `number` - Longitude at submission (check-out)
- `survey_statement` (Optional): `string` - Final statement (optional if already drafted)
- `reason_if_outside` (Optional): `string` 
- `photo` (Optional): `FILE` - Attendance photo
- `signature` (Optional): `FILE` - Surveyor digital signature
- `photoKey` (Optional): `string` - S3 key for attendance photo (if already uploaded)
- `signatureKey` (Optional): `string` - S3 key for surveyor signature (if already uploaded)

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "submit_latitude": 0,
  "submit_longitude": 0,
  "survey_statement": "string",
  "reason_if_outside": "string",
  "photo": "<FILE_UPLOAD>",
  "signature": "<FILE_UPLOAD>",
  "photoKey": "string",
  "signatureKey": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Survey submitted</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "survey_status": "string",
    "submission_count": 0,
    "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "declared_at": "2026-03-07T12:00:00Z",
    "start_latitude": 0,
    "start_longitude": 0,
    "submit_latitude": 0,
    "submit_longitude": 0,
    "attendance_photo_url": "string",
    "evidence_proof_url": "string",
    "signature_url": "string",
    "declaration_hash": "string",
    "survey_statement": "string",
    "survey_statement_status": "string",
    "survey_statement_pdf_url": "string",
    "signed_checklist_files": [
      "string"
    ],
    "started_at": "2026-03-07T12:00:00Z",
    "submitted_at": "2026-03-07T12:00:00Z",
    "finalized_at": "2026-03-07T12:00:00Z",
    "JobRequest": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_status": "string",
      "ActivityPlannings": [
        "..."
      ]
    }
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/surveys/jobs/{jobId}`
**Summary:** Get survey details
**Description:** Fetches full details of a survey for a specific job, including related objects.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Survey details fetched</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "survey_status": "string",
    "submission_count": 0,
    "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "declared_at": "2026-03-07T12:00:00Z",
    "start_latitude": 0,
    "start_longitude": 0,
    "submit_latitude": 0,
    "submit_longitude": 0,
    "attendance_photo_url": "string",
    "evidence_proof_url": "string",
    "signature_url": "string",
    "declaration_hash": "string",
    "survey_statement": "string",
    "survey_statement_status": "string",
    "survey_statement_pdf_url": "string",
    "signed_checklist_files": [
      "string"
    ],
    "started_at": "2026-03-07T12:00:00Z",
    "submitted_at": "2026-03-07T12:00:00Z",
    "finalized_at": "2026-03-07T12:00:00Z",
    "JobRequest": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_status": "string",
      "ActivityPlannings": [
        "..."
      ]
    }
  }
}
```

</details>

<details><summary><strong>404</strong> - Survey not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/surveys/jobs/{jobId}/location`
**Summary:** Stream live location
**Description:** Real-time GPS tracking during survey execution.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "latitude": 0,
  "longitude": 0
}
```

#### Responses
<details><summary><strong>200</strong> - Location updated</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### POST `/api/v1/surveys/jobs/{jobId}/proof`
**Summary:** Upload survey evidence
**Description:** Supplemental photos or documents for the survey. Multiple uploads are allowed until final submission. Moves survey status to PROOF_UPLOADED if in a previous state.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileKey": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `proof` (Optional): `FILE` 

```json
{
  "proof": "<FILE_UPLOAD>"
}
```

#### Responses
<details><summary><strong>201</strong> - Proof uploaded</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### POST `/api/v1/surveys/jobs/{jobId}/statement/draft`
**Summary:** Draft survey statement / Generate Preview
**Description:** Saves the survey statement text and/or triggers report generation.
- **SURVEYOR**: Required to provide `survey_statement` text. Cannot see the PDF.
- **TM/ADMIN**: Can provide new text OR leave it empty to trigger/refresh the branded "**DRAFT**" PDF using existing findings.


#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "survey_statement": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Success. Returns message and, for management, the signed PDF URL.</summary>

```json
{
  "success": true,
  "data": {
    "message": "string",
    "status": "DRAFTED",
    "pdf_url": "string"
  }
}
```

</details>

---

## 🚀 System

---

### GET `/api/v1/system/health`
**Summary:** Get system health

#### Responses
<details><summary><strong>200</strong> - Health status</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/system/readiness`
**Summary:** Get system readiness

#### Responses
<details><summary><strong>200</strong> - Readiness status</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/system/version`
**Summary:** Get system version

#### Responses
<details><summary><strong>200</strong> - Version info</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 Users

---

### GET `/api/v1/users/me`
**Summary:** Get current user profile

#### Responses
<details><summary><strong>200</strong> - Current user profile</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/users/me`
**Summary:** Update current user profile

#### Request Body
**Content-Type:** `application/json`

```json
{
  "name": "string",
  "phone": "string",
  "contact_person_name": "string",
  "contact_person_email": "string",
  "address": "string",
  "nationality": "string",
  "qualification": "string",
  "years_of_experience": 0
}
```

#### Responses
<details><summary><strong>200</strong> - Profile updated</summary>

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/users/fcm-token`
**Summary:** Update FCM device token for push notifications
**Description:** Registers or updates the Firebase Cloud Messaging (FCM) token for the currently authenticated user.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fcmToken": "fXz1A2B3C4D5E6F7G8H9I0J..."
}
```

#### Responses
<details><summary><strong>200</strong> - FCM token updated successfully</summary>

```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

</details>

<details><summary><strong>400</strong> - Invalid token provided</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/users/profile-pic`
**Summary:** Update profile picture
**Description:** Upload a new profile picture (multipart) or provide a pre-signed S3 key (JSON).

#### Request Body
**Content-Type:** `application/json`

```json
{
  "profilePicKey": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `profile_pic` (Optional): `FILE` 

```json
{
  "profile_pic": "<FILE_UPLOAD>"
}
```

#### Responses
<details><summary><strong>200</strong> - Profile picture updated</summary>

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Vessels

---

### GET `/api/v1/vessels/{id}`
**Summary:** Get vessel by ID
**Description:** Get vessel details by ID.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Vessel details</summary>

```json
{
  "success": true,
  "data": {
    "id": "019ccbf7-f67a-7443-bd21-17f16ef06cbb",
    "client_id": "019c79a4-3ab9-7055-a1a7-9d7332fb025e",
    "flag_administration_id": "019cbf1d-b478-704f-a4af-7462034a800e",
    "vessel_name": "MT Blue Horizon",
    "imo_number": "9876506",
    "call_sign": "D5IJ6",
    "mmsi_number": "538007106",
    "port_of_registry": "Majuro",
    "year_built": 2021,
    "ship_type": "Oil Tanker",
    "gross_tonnage": "82300.25",
    "net_tonnage": "44100.00",
    "deadweight": "158000.00",
    "class_status": "ACTIVE",
    "current_class_society": "DNV",
    "engine_type": "MAN B&W 7G80ME-C",
    "builder_name": "Hyundai Samho Heavy Industries",
    "createdAt": "2026-03-05T17:48:51.000Z",
    "updatedAt": "2026-03-05T17:48:51.000Z",
    "Client": {
      "id": "019c79a4-3ab9-7055-a1a7-9d7332fb025e",
      "company_name": "Pacific Maritime Corp",
      "company_code": "PMC001",
      "email": "ops@pacificmaritime.com",
      "status": "INACTIVE"
    },
    "FlagAdministration": {
      "flag_state_name": "Marshall Islands Maritime Administrator"
    }
  }
}
```

</details>

<details><summary><strong>404</strong> - Vessel not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

