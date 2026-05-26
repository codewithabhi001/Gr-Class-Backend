# Checklists Module API (Actual)

Source YAML: `src/docs/paths/checklists.yaml`

## Routes

### 1. GET /api/v1/checklists/jobs/{jobId}
- Summary: Get checklist for a job
- Operation ID: `getChecklist`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- `answer` (query, optional, string)
- `question_code` (query, optional, string)
- `search` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Checklist retrieved successfully (application/json => #/components/schemas/ChecklistResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:12`
- Controller: `src/modules/checklists/checklist.controller.js:3`
- Service: `src/modules/checklists/checklist.service.js:27` (`checklistService.getChecklist`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. PUT /api/v1/checklists/jobs/{jobId}
- Summary: Submit checklist (answers + optional signed-scan files)
- Operation ID: `submitChecklist`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ChecklistSubmission
- Req usage in controller: params=[jobId], query=[], body=[items, signed_checklist_files], user=[], files=[]
- Validation schema key: `submitChecklist`
- Joi schema source: `src/middlewares/validate.middleware.js:193`
```js
Joi.object({
        items: Joi.array().items(Joi.object({
            question_code: Joi.string().required(),
            question_text: Joi.string().required(),
            answer: Joi.string().valid('YES', 'NO', 'NA').required(),
            remarks: Joi.string().allow('').optional(),
            file_url: Joi.string().allow('', null).optional()
        })).required(),
        // Optional: S3 keys (returned earlier from /checklists/jobs/:jobId/signed-checklist-upload-url)
        // for the full scanned + signed checklist document(s).
        signed_checklist_files: Joi.array().items(Joi.string()).optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Checklist submitted successfully (application/json => #/components/schemas/ChecklistResponse)
- `400`: Bad Request (invalid state, terminal job, etc.) (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:19`
- Controller: `src/modules/checklists/checklist.controller.js:10`
- Service: `src/modules/checklists/checklist.service.js:119` (`checklistService.submitChecklist`)
- Models touched: JobRequest.findByPk, Survey.findOne, ActivityPlanning.findOne, ActivityPlanning.create
- Service returns (detected): {
            items: resolvedItems,
            signed_checklist_files: signedFilesResolved
        }

### 3. GET /api/v1/checklists/jobs/{jobId}/get-upload-url
- Summary: Get upload URL for a single checklist-item evidence photo
- Operation ID: `getChecklistItemUploadUrl`
- Access Roles: SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Upload URL generated successfully (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Bad Request (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/checklists/jobs/{jobId}/signed-checklist-upload-url
- Summary: Get upload URL for the full signed-checklist scan
- Operation ID: `getSignedChecklistUploadUrl`
- Access Roles: SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Upload URL generated successfully (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Bad Request (job not survey-eligible / terminal state) (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: false, message: 'fileName and contentType are required query parameters.' }
```
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:42`
- Controller: `src/modules/checklists/checklist.controller.js:48`
- Service: `src/modules/checklists/checklist.service.js:420` (`checklistService.getSignedChecklistUploadUrl`)
- Models touched: JobRequest.findByPk
- Service returns (detected): {
        uploadUrl: signedUrl,
        fileKey: key,
    }

### 5. PUT /api/v1/checklists/jobs/{jobId}/signed-checklist-files
- Summary: Update signed checklist scan files (keys only)
- Operation ID: `updateSignedChecklistFiles`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[jobId], query=[], body=[signed_checklist_files], user=[], files=[]
- Validation schema key: `updateSignedChecklistFiles`
- Joi schema source: `src/middlewares/validate.middleware.js:205`
```js
Joi.object({
        signed_checklist_files: Joi.array().items(Joi.string()).required()
    })
```

Response (Actual)
- YAML response map:
- `200`: Updated signed checklist files (application/json => object)
- `400`: Bad Request (invalid state, terminal job, etc.) (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — caller is not the assigned surveyor (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:27`
- Controller: `src/modules/checklists/checklist.controller.js:22`
- Service: `src/modules/checklists/checklist.service.js:258` (`checklistService.updateSignedChecklistFiles`)
- Models touched: JobRequest.findByPk, Survey.findOne
- Service returns (detected): { signed_checklist_files: signedFilesResolved }