# Jobs Module API (Actual)

Source YAML: `src/docs/paths/jobs.yaml`

## Routes

### 1. GET /api/v1/jobs/upload-url
- Summary: Get presigned S3 upload URL for job documents
- Operation ID: `getJobUploadUrl`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `fileName` (query, required, string)
- `fileType` (query, required, string)
- `folder` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Presigned URL generated (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. GET /api/v1/jobs
- Summary: List jobs (role-filtered)
- Operation ID: `getJobs`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
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
- Route file: `src/modules/jobs/job.routes.js:16`
- Controller: `src/modules/jobs/job.controller.js:50`
- Service: `src/modules/jobs/job.service.js:271` (`jobService.getJobs`)
- Models touched: N/A
- Service returns (detected): N/A

### 3. POST /api/v1/jobs
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
{ success: true, data: job }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:22`
- Controller: `src/modules/jobs/job.controller.js:38`
- Service: `src/modules/jobs/job.service.js:246` (`jobService.createJobForClient`)
- Models touched: Vessel.findOne
- Service returns (detected): createJob(data, userId)
- Service: `src/modules/jobs/job.service.js:133` (`jobService.createJob`)
- Models touched: N/A
- Service returns (detected): N/A

### 4. GET /api/v1/jobs/{id}
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
- Route file: `src/modules/jobs/job.routes.js:17`
- Controller: `src/modules/jobs/job.controller.js:58`
- Service: `src/modules/jobs/job.service.js:370` (`jobService.getJobById`)
- Models touched: N/A
- Service returns (detected): N/A

### 5. PUT /api/v1/jobs/{id}/verify-documents
- Summary: TO: Verify or reject documents
- Operation ID: `verifyJobDocuments`
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
- `200`: Documents processed. If approved, job moves to DOCUMENT_VERIFIED.
If rejected, job stays in CREATED and client is notified.
 (application/json => object)
- `400`: Job not in CREATED state, mandatory documents missing,
or `rejected_documents` array is empty when `approved=false`.
 (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only TO can call this endpoint (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: result.message, data: result.data }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:26`
- Controller: `src/modules/jobs/job.controller.js:78`
- Service: `src/modules/jobs/job.service.js:541` (`jobService.verifyJobDocuments`)
- Models touched: CertificateRequiredDocument.findAll, JobDocument.findAll, JobDocument.update, JobStatusHistory.create, User.findOne
- Service returns (detected): const updatedDocs = await JobDocument.findAll({
            where: { job_id: id },
            include: [{ model: CertificateRequiredDocument }]
        }) | {
            message: `${rejectedDocs.length} document(s) rejected. Client has been notified to re-upload.`,
            data: {
                job_id: id,
                job_status: 'CREATED',
                rejected_documents: updatedDocs.filter(d => d.verification_status === 'REJECTED'),
                approved_documents: updatedDocs.filter(d => d.verification_status === 'APPROVED')
            }
        } | { message: 'All documents verified successfully.', data: updated }

### 6. PUT /api/v1/jobs/{id}/approve-request
- Summary: GM/ADMIN: Approve request → APPROVED
- Operation ID: `approveRequest`
- Access Roles: GM
- Change Access: GM

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
- Route file: `src/modules/jobs/job.routes.js:29`
- Controller: `src/modules/jobs/job.controller.js:86`
- Service: `src/modules/jobs/job.service.js:691` (`jobService.approveRequest`)
- Models touched: User.findOne
- Service returns (detected): updated

### 7. PUT /api/v1/jobs/{id}/finalize
- Summary: ADMIN/GM/TM: Finalize non-survey job → FINALIZED
- Operation ID: `finalizeJob`
- Access Roles: GM, TM
- Change Access: GM, TM

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
- Route file: `src/modules/jobs/job.routes.js:32`
- Controller: `src/modules/jobs/job.controller.js:94`
- Service: `src/modules/jobs/job.service.js:717` (`jobService.finalizeJob`)
- Models touched: N/A
- Service returns (detected): await finalizeSurvey(id, user.id) | await lifecycleService.updateJobStatus(id, 'FINALIZED', user.id, remarks || `${user.role} finalized non-survey job`)

### 8. PUT /api/v1/jobs/{id}/assign
- Summary: ADMIN/GM: Assign surveyor → ASSIGNED
- Operation ID: `assignSurveyor`
- Access Roles: GM
- Change Access: GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/AssignSurveyorRequest
- Req usage in controller: params=[id], query=[], body=[surveyorId, surveyor_id], user=[], files=[]
- Validation schema key: `assignJob`
- Joi schema source: `src/middlewares/validate.middleware.js:336`
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
- Route file: `src/modules/jobs/job.routes.js:35`
- Controller: `src/modules/jobs/job.controller.js:102`
- Service: `src/modules/jobs/job.service.js:736` (`jobService.assignSurveyor`)
- Models touched: User.findByPk
- Service returns (detected): updated

### 9. PUT /api/v1/jobs/{id}/reassign
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
- Joi schema source: `src/middlewares/validate.middleware.js:341`
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
- Route file: `src/modules/jobs/job.routes.js:37`
- Controller: `src/modules/jobs/job.controller.js:111`
- Service: `src/modules/jobs/job.service.js:768` (`jobService.reassignSurveyor`)
- Models touched: JobStatusHistory.create, Survey.findOne
- Service returns (detected): job

### 10. PUT /api/v1/jobs/{id}/authorize-survey
- Summary: ADMIN/TM: Authorize survey → SURVEY_AUTHORIZED
- Operation ID: `authorizeSurvey`
- Access Roles: TM
- Change Access: TM

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
- Route file: `src/modules/jobs/job.routes.js:43`
- Controller: `src/modules/jobs/job.controller.js:120`
- Service: `src/modules/jobs/job.service.js:803` (`jobService.authorizeSurvey`)
- Models touched: User.findOne
- Service returns (detected): updated

### 11. PUT /api/v1/jobs/{id}/review
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
- Route file: `src/modules/jobs/job.routes.js:48`
- Controller: `src/modules/jobs/job.controller.js:128`
- Service: `src/modules/jobs/job.service.js:836` (`jobService.reviewJob`)
- Models touched: N/A
- Service returns (detected): updated

### 12. PUT /api/v1/jobs/{id}/reschedule
- Summary: ADMIN/GM: Reschedule job date/port
- Operation ID: `rescheduleJob`
- Access Roles: GM
- Change Access: GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/RescheduleJobRequest
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `rescheduleJob`
- Joi schema source: `src/middlewares/validate.middleware.js:346`
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
- Route file: `src/modules/jobs/job.routes.js:40`
- Controller: `src/modules/jobs/job.controller.js:138`
- Service: `src/modules/jobs/job.service.js:864` (`jobService.rescheduleJob`)
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
- Route file: `src/modules/jobs/job.routes.js:59`
- Controller: `src/modules/jobs/job.controller.js:146`
- Service: `src/modules/jobs/job.service.js:938` (`jobService.rejectJob`)
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
- Route file: `src/modules/jobs/job.routes.js:62`
- Controller: `src/modules/jobs/job.controller.js:154`
- Service: `src/modules/jobs/job.service.js:988` (`jobService.cancelJobForClient`)
- Models touched: JobRequest.findByPk
- Service returns (detected): await lifecycleService.updateJobStatus(id, 'REJECTED', userId, reason || 'Cancelled by client')
- Service: `src/modules/jobs/job.service.js:968` (`jobService.cancelJob`)
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

### 16. GET /api/v1/jobs/{id}/documents
- Summary: List job documents with verification status
- Operation ID: `getJobDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
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
- `200`: Document list with status summary (application/json => object)
- `403`: Forbidden – client can only access their own jobs (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: docs }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:69`
- Controller: `src/modules/jobs/job.controller.js:187`
- Service: `src/modules/jobs/job.service.js:1010` (`jobService.getJobDocuments`)
- Models touched: Vessel.findByPk, JobDocument.findAll, CertificateRequiredDocument.findAll, CertificateType.findByPk
- Service returns (detected): {
            requirement_id: rd.id,
            document_name: rd.document_name,
            is_mandatory: rd.is_mandatory,
            status: status,
            uploaded_versions: docsForReq
        } | {
        certificate_type: certificateType,
        grouped_requirements: groupedRequirements,
        custom_documents: customDocuments,
        documents: resolvedDocs,
        required_documents: requiredDocs,
        missing_documents: missingDocs,
        summary: {
            total_uploaded: docs.length,
            approved: docs.filter(d => d.verification_status === 'APPROVED').length,
            rejected: docs.filter(d => d.verification_status === 'REJECTED').length,
            pending: docs.filter(d => d.verification_status === 'PENDING').length,
            missing: missingDocs.length
        }
    }

### 17. POST /api/v1/jobs/{id}/documents
- Summary: Upload or replace job documents
- Operation ID: `uploadJobDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM
- Change Access: CLIENT, ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[documents], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Documents uploaded successfully (application/json => object)
- `400`: Job not in CREATED state, document already exists for this requirement,
or missing required fields.
 (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – client can only upload for their own jobs (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, message: 'Documents uploaded successfully.', data: docs }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:72`
- Controller: `src/modules/jobs/job.controller.js:194`
- Service: `src/modules/jobs/job.service.js:1092` (`jobService.uploadJobDocuments`)
- Models touched: Vessel.findByPk, JobDocument.findOne, JobDocument.create
- Service returns (detected): created

### 18. GET /api/v1/jobs/{id}/history
- Summary: ADMIN/GM/TM/TO/CLIENT/SURVEYOR: Job status history & audit trail
- Operation ID: `getJobHistory`
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
- `200`: Status history list (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 19. POST /api/v1/jobs/{id}/notes
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
{ success: true, data: note }
```

Implementation Trace
- Route file: `src/modules/jobs/job.routes.js:79`
- Controller: `src/modules/jobs/job.controller.js:208`
- Service: `src/modules/jobs/job.service.js:1279` (`jobService.addInternalNote`)
- Models touched: JobNote.create, Message.create
- Service returns (detected): note

### 20. GET /api/v1/jobs/{id}/messages/external
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

### 21. GET /api/v1/jobs/{id}/messages/internal
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

### 22. POST /api/v1/jobs/{id}/messages
- Summary: Send message (with optional attachment)
- Operation ID: `sendJobMessage`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, TO, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
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