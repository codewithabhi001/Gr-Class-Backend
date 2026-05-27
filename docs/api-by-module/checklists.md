# Checklists Module API

Source: `src/docs/paths/checklists.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with change access: SURVEYOR, TO

## Role Action Matrix (Change Endpoints)
1. `PUT /api/v1/checklists/jobs/{jobId}` -> SURVEYOR
2. `PUT /api/v1/checklists/jobs/{jobId}/signed-checklist-files` -> SURVEYOR
3. `PUT /api/v1/checklists/jobs/{jobId}/items/{itemId}/review` -> TO
4. `PUT /api/v1/checklists/jobs/{jobId}/signed-files/{fileIndex}/review` -> TO

## Routes

### 1. GET /api/v1/checklists/jobs/{jobId}
- Summary: Get checklist for a job
- Operation ID: `getChecklist`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `job_certificate_id` (query, optional, string)
- `answer` (query, optional, string)
- `question_code` (query, optional, string)
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Checklist retrieved successfully (application/json => #/components/schemas/ChecklistResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 2. PUT /api/v1/checklists/jobs/{jobId}
- Summary: Submit checklist (answers + optional signed-scan files)
- Operation ID: `submitChecklist`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/ChecklistSubmission
- Responses:
- `200`: Checklist submitted successfully (application/json => #/components/schemas/ChecklistResponse)
- `400`: Bad Request (invalid state, terminal job, etc.) (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 3. GET /api/v1/checklists/jobs/{jobId}/get-upload-url
- Summary: Get upload URL for a single checklist-item evidence photo
- Operation ID: `getChecklistItemUploadUrl`
- Access Roles: SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body:
- None
- Responses:
- `200`: Upload URL generated successfully (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Bad Request (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 4. GET /api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url
- Summary: Get upload URL for the full signed-checklist scan
- Operation ID: `getSignedChecklistUploadUrl`
- Access Roles: SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body:
- None
- Responses:
- `200`: Upload URL generated successfully (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Bad Request (job not survey-eligible / terminal state) (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 5. PUT /api/v1/checklists/jobs/{jobId}/signed-checklist-files
- Summary: Update signed checklist scan files (keys only)
- Operation ID: `updateSignedChecklistFiles`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Updated signed checklist files (application/json => object)
- `400`: Bad Request (invalid state, terminal job, etc.) (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 6. PUT /api/v1/checklists/jobs/{jobId}/items/{itemId}/review
- Summary: TO Review checklist item
- Operation ID: `reviewChecklistItem`
- Access Roles: TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `itemId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Checklist item reviewed successfully (application/json => object)
- `400`: Bad Request (validation error)
- `403`: Forbidden

### 7. PUT /api/v1/checklists/jobs/{jobId}/signed-files/{fileIndex}/review
- Summary: TO Review signed document scan
- Operation ID: `reviewSignedDocument`
- Access Roles: TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `fileIndex` (path, required, integer)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Signed document reviewed successfully (application/json => object)
- `400`: Bad Request (validation error)
- `403`: Forbidden
