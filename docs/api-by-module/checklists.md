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
- `400`: Bad Request (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Not Found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:10`
- Controller: `src/modules/checklists/checklist.controller.js:3`
- Service: `src/modules/checklists/checklist.service.js:12` (`checklistService.getChecklist`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. PUT /api/v1/checklists/jobs/{jobId}
- Summary: Submit checklist for a job
- Operation ID: `submitChecklist`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ChecklistSubmission
- Req usage in controller: params=[jobId], query=[], body=[items], user=[id], files=[]
- Validation schema key: `submitChecklist`
- Joi schema source: `src/middlewares/validate.middleware.js:140`
```js
Joi.object({
        items: Joi.array().items(Joi.object({
            question_code: Joi.string().required(),
            question_text: Joi.string().required(),
            answer: Joi.string().valid('YES', 'NO', 'NA').required(),
            remarks: Joi.string().allow('').optional(),
            file_url: Joi.string().allow('', null).optional()
        })).required()
    })
```

Response (Actual)
- YAML response map:
- `200`: Checklist submitted successfully (application/json => #/components/schemas/ChecklistResponse)
- `400`: Bad Request (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Not Found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist.routes.js:11`
- Controller: `src/modules/checklists/checklist.controller.js:10`
- Service: `src/modules/checklists/checklist.service.js:48` (`checklistService.submitChecklist`)
- Models touched: JobRequest.findByPk, Survey.findOne, ActivityPlanning.destroy, ActivityPlanning.bulkCreate
- Service returns (detected): await fileAccessService.resolveEntity(results, { id: userId })

### 3. GET /api/v1/checklists/jobs/{jobId}/get-upload-url
- Summary: Get upload URL for checklist item evidence
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
- `200`: Upload URL generated successfully (application/json => object)
- `400`: Bad Request (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job Not Found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A