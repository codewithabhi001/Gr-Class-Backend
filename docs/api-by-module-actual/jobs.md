# Jobs Module API (Actual)

Source YAML: `src/docs/paths/jobs.yaml`

## Routes

### 1. GET /api/v1/jobs
- Summary: List jobs (role-filtered)
- Operation ID: `getJobs`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, TA, FLAG_ADMIN, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- `vessel_id` (query, optional, string)
- `certificate_type_id` (query, optional, string)
- `assigned_surveyor_id` (query, optional, string)
- `target_port` (query, optional, string)
- `created_from` (query, optional, string)
- `created_to` (query, optional, string)
- `recent_days` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[role], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of jobs (application/json => object)
- `401`: Unauthorized – missing or invalid token (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – role not allowed (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:15`
- Controller: `src/modules/jobs/job.controller.js:34`
- Service: `src/modules/jobs/job.service.js:222` (`jobService.getJobs`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/jobs
- Summary: Create job request
- Operation ID: `createJob`
- Access Roles: CLIENT, ADMIN, GM
- Change Access: CLIENT, ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/JobCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[role, client_id, id], files=[]
- Validation schema key: `createJob`
- Joi schema source: `src/middlewares/validate.middleware.js:65`
```js
Joi.object({
        vessel_id: Joi.string().guid().required(),
        certificate_type_id: Joi.string().guid().required(),
        reason: Joi.string().required(),
        target_port: Joi.string().required(),
        target_date: Joi.date().iso().required(),
        uploaded_documents: Joi.array().items(Joi.object({
            required_document_id: Joi.string().guid().required(),
            file_url: Joi.string().required()
        })).optional()
    })
```

Response (Actual)
- YAML response map:
- `201`: Job created successfully (status = CREATED) (application/json => object)
- `400`: Validation error or missing mandatory documents (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
201
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:21`
- Controller: `src/modules/jobs/job.controller.js:22`
- Service: `src/modules/jobs/job.service.js:198` (`jobService.createJobForClient`)
- Models touched: Vessel.findOne
- Service returns (detected): createJob(data, userId)
- Service: `src/modules/jobs/job.service.js:100` (`jobService.createJob`)
- Models touched: CertificateType.findByPk, CertificateRequiredDocument.findAll, Vessel.findByPk, JobRequest.create, JobDocument.bulkCreate, JobStatusHistory.create, JobRequest.findByPk, User.findOne
- Service returns (detected): job

### 3. GET /api/v1/jobs/{id}
- Summary: Get job details
- Operation ID: `getJobById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job details (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:16`
- Controller: `src/modules/jobs/job.controller.js:42`
- Service: `src/modules/jobs/job.service.js:290` (`jobService.getJobById`)
- Models touched: N/A
- Service returns (detected): N/A

### 4. PUT /api/v1/jobs/{id}/verify-documents
- Summary: TO: Verify documents → DOCUMENT_VERIFIED
- Operation ID: `verifyJobDocuments`
- Access Roles: TO
- Change Access: TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Documents verified. Job moved to DOCUMENT_VERIFIED. (application/json => object)
- `400`: Job not in CREATED state, or mandatory documents are missing (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only TO can call this endpoint (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Documents verified by TO.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:25`
- Controller: `src/modules/jobs/job.controller.js:62`
- Service: `src/modules/jobs/job.service.js:451` (`jobService.verifyJobDocuments`)
- Models touched: CertificateRequiredDocument.findAll, JobDocument.findAll
- Service returns (detected): updated

### 5. PUT /api/v1/jobs/{id}/approve-request
- Summary: GM/ADMIN: Approve request → APPROVED
- Operation ID: `approveRequest`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job approved. Status → APPROVED. (application/json => object)
- `400`: Job not in DOCUMENT_VERIFIED state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job approved.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:28`
- Controller: `src/modules/jobs/job.controller.js:70`
- Service: `src/modules/jobs/job.service.js:496` (`jobService.approveRequest`)
- Models touched: User.findOne
- Service returns (detected): updated

### 6. PUT /api/v1/jobs/{id}/finalize
- Summary: ADMIN/GM/TM: Finalize non-survey job → FINALIZED
- Operation ID: `finalizeJob`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job finalized. Status → FINALIZED. (application/json => object)
- `400`: Job requires a survey (is_survey_required=true), or not in APPROVED state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job finalized.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:31`
- Controller: `src/modules/jobs/job.controller.js:78`
- Service: `src/modules/jobs/job.service.js:522` (`jobService.finalizeJob`)
- Models touched: N/A
- Service returns (detected): await finalizeSurvey(id, user.id) | await lifecycleService.updateJobStatus(id, 'FINALIZED', user.id, remarks || `${user.role} finalized non-survey job`)

### 7. PUT /api/v1/jobs/{id}/assign
- Summary: ADMIN/GM: Assign surveyor → ASSIGNED
- Operation ID: `assignSurveyor`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/AssignSurveyorRequest
- Req usage in controller: params=[id], query=[], body=[surveyorId, surveyor_id], user=[], files=[]
- Validation schema key: `assignJob`
- Joi schema source: `src/middlewares/validate.middleware.js:275`
```js
Joi.object({
        surveyorId: Joi.string().guid().optional(),
        surveyor_id: Joi.string().guid().optional(),
        remarks: Joi.string().optional().allow(''),
    })
```

Response (Actual)
- YAML response map:
- `200`: Surveyor assigned. Status → ASSIGNED. (application/json => object)
- `400`: Job not in APPROVED state, or surveyorId is invalid / not a SURVEYOR (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Surveyor assigned.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:34`
- Controller: `src/modules/jobs/job.controller.js:86`
- Service: `src/modules/jobs/job.service.js:541` (`jobService.assignSurveyor`)
- Models touched: User.findByPk
- Service returns (detected): updated

### 8. PUT /api/v1/jobs/{id}/reassign
- Summary: GM/TM: Reassign surveyor (no status change)
- Operation ID: `reassignSurveyor`
- Access Roles: GM, TM
- Change Access: GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ReassignJobRequest
- Req usage in controller: params=[id], query=[], body=[surveyorId, surveyor_id, reason], user=[], files=[]
- Validation schema key: `reassignJob`
- Joi schema source: `src/middlewares/validate.middleware.js:280`
```js
Joi.object({
        surveyorId: Joi.string().guid().optional(),
        surveyor_id: Joi.string().guid().optional(),
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Surveyor reassigned successfully (status unchanged). (application/json => object)
- `400`: Job is in terminal state, or surveyorId is invalid (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only GM or TM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Surveyor reassigned.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:36`
- Controller: `src/modules/jobs/job.controller.js:95`
- Service: `src/modules/jobs/job.service.js:573` (`jobService.reassignSurveyor`)
- Models touched: JobStatusHistory.create, Survey.findOne
- Service returns (detected): job

### 9. PUT /api/v1/jobs/{id}/authorize-survey
- Summary: ADMIN/TM: Authorize survey → SURVEY_AUTHORIZED
- Operation ID: `authorizeSurvey`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Survey authorized. Status → SURVEY_AUTHORIZED. (application/json => object)
- `400`: Job not in ASSIGNED state, or no surveyor assigned (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or TM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Survey authorized. Surveyor can now begin field work.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:42`
- Controller: `src/modules/jobs/job.controller.js:104`
- Service: `src/modules/jobs/job.service.js:608` (`jobService.authorizeSurvey`)
- Models touched: User.findOne
- Service returns (detected): updated

### 10. PUT /api/v1/jobs/{id}/review
- Summary: TO: Technical review → REVIEWED
- Operation ID: `reviewJob`
- Access Roles: TO
- Change Access: TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job reviewed. Status → REVIEWED. (application/json => object)
- `400`: Job not in SURVEY_DONE state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only TO (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job marked as reviewed.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:47`
- Controller: `src/modules/jobs/job.controller.js:112`
- Service: `src/modules/jobs/job.service.js:641` (`jobService.reviewJob`)
- Models touched: N/A
- Service returns (detected): updated

### 11. PUT /api/v1/jobs/{id}/send-back
- Summary: ADMIN/TM/TO: Request rework → REWORK_REQUESTED
- Operation ID: `sendBackJob`
- Access Roles: ADMIN, TM, TO
- Change Access: ADMIN, TM, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Rework requested. Status → REWORK_REQUESTED. (application/json => object)
- `400`: Role-state constraint violation (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Rework requested. Surveyor has been notified.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:51`
- Controller: `src/modules/jobs/job.controller.js:120`
- Service: `src/modules/jobs/job.service.js:741` (`jobService.sendBackJob`)
- Models touched: N/A
- Service returns (detected): updated

### 12. PUT /api/v1/jobs/{id}/reschedule
- Summary: ADMIN/GM: Reschedule job date/port
- Operation ID: `rescheduleJob`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/RescheduleJobRequest
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `rescheduleJob`
- Joi schema source: `src/middlewares/validate.middleware.js:285`
```js
Joi.object({
        new_target_date: Joi.date().iso().required(),
        new_target_port: Joi.string().required(),
        reason: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Job rescheduled successfully. (application/json => object)
- `400`: Rescheduling not allowed in current state (e.g. IN_PROGRESS or terminal),
or `reason` is missing.
 (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job rescheduled successfully.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:39`
- Controller: `src/modules/jobs/job.controller.js:128`
- Service: `src/modules/jobs/job.service.js:669` (`jobService.rescheduleJob`)
- Models touched: JobRequest.findByPk, JobReschedule.create, JobStatusHistory.create
- Service returns (detected): job

### 13. PUT /api/v1/jobs/{id}/reject
- Summary: ADMIN/GM/TM: Reject job → REJECTED (terminal)
- Operation ID: `rejectJob`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job rejected. Status → REJECTED (terminal). (application/json => object)
- `400`: Job already in terminal state, or role-state constraint violated (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job rejected.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:58`
- Controller: `src/modules/jobs/job.controller.js:136`
- Service: `src/modules/jobs/job.service.js:770` (`jobService.rejectJob`)
- Models touched: N/A
- Service returns (detected): await lifecycleService.updateJobStatus(id, 'REJECTED', user.id, remarks || `${role} rejected job`)

### 14. PUT /api/v1/jobs/{id}/cancel
- Summary: CLIENT/GM/TM/ADMIN: Cancel job → REJECTED (terminal)
- Operation ID: `cancelJob`
- Access Roles: CLIENT, GM, TM, ADMIN
- Change Access: CLIENT, GM, TM, ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[reason], user=[role, client_id, id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job cancelled. Status → REJECTED. (application/json => object)
- `400`: Job already in terminal state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – CLIENT trying to cancel a job for a vessel they don't own (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Job cancelled.', data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:61`
- Controller: `src/modules/jobs/job.controller.js:144`
- Service: `src/modules/jobs/job.service.js:800` (`jobService.cancelJobForClient`)
- Models touched: JobRequest.findByPk
- Service returns (detected): await lifecycleService.updateJobStatus(id, 'REJECTED', userId, reason || 'Cancelled by client')
- Service: `src/modules/jobs/job.service.js:792` (`jobService.cancelJob`)
- Models touched: N/A
- Service returns (detected): await lifecycleService.updateJobStatus(id, 'REJECTED', userId, reason || 'Job cancelled')

### 15. PUT /api/v1/jobs/{id}/priority
- Summary: ADMIN/GM/TM: Update job priority
- Operation ID: `updateJobPriority`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Priority updated successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 16. GET /api/v1/jobs/{id}/history
- Summary: ADMIN/GM/TM/TO: Job status history & audit trail
- Operation ID: `getJobHistory`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Status history list (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 17. POST /api/v1/jobs/{id}/notes
- Summary: ADMIN/GM/TM/TO: Add internal staff note
- Operation ID: `addInternalNote`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: ADMIN, GM, TM, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/AddNoteRequest
- Req usage in controller: params=[id], query=[], body=[note_text], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Note added successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
201
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:68`
- Controller: `src/modules/jobs/job.controller.js:173`
- Service: `src/modules/jobs/job.service.js:850` (`jobService.addInternalNote`)
- Models touched: JobNote.create
- Service returns (detected): await db.JobNote.create({ job_id: jobId, user_id: userId, note_text: noteText, is_internal: true })

### 18. GET /api/v1/jobs/{id}/messages/external
- Summary: Get external (client-visible) messages
- Operation ID: `getExternalMessages`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: External message thread (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 19. GET /api/v1/jobs/{id}/messages/internal
- Summary: ADMIN/GM/TM/TO: Get internal (staff-only) messages
- Operation ID: `getInternalMessages`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Internal message thread (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 20. POST /api/v1/jobs/{id}/messages
- Summary: Send message (with optional attachment)
- Operation ID: `sendJobMessage`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, TO, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Message sent successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A