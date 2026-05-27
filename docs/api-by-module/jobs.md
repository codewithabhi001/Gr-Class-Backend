# Jobs Module API

Source: `src/docs/paths/jobs.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/jobs` -> CLIENT, ADMIN, GM
2. `PUT /api/v1/jobs/{id}/verify-documents` -> ADMIN, GM, TO
3. `PUT /api/v1/jobs/{id}/approve-request` -> ADMIN, GM
4. `PUT /api/v1/jobs/{id}/finalize` -> ADMIN, GM, TM
5. `PUT /api/v1/jobs/{id}/assign` -> ADMIN, GM
6. `PUT /api/v1/jobs/{id}/reassign` -> ADMIN, GM, TM
7. `PUT /api/v1/jobs/{id}/authorize-survey` -> ADMIN, TM
8. `PUT /api/v1/jobs/{id}/review` -> ADMIN, TO
9. `PUT /api/v1/jobs/{id}/reschedule` -> GM
10. `PUT /api/v1/jobs/{id}/reject` -> ADMIN, GM, TM
11. `PUT /api/v1/jobs/{id}/cancel` -> CLIENT, GM, TM, ADMIN
12. `PUT /api/v1/jobs/{id}/priority` -> ADMIN, GM, TM
13. `POST /api/v1/jobs/{id}/documents` -> CLIENT, ADMIN, GM, TM
14. `PUT /api/v1/jobs/{id}/documents/{documentId}` -> CLIENT, ADMIN, GM, TM
15. `POST /api/v1/jobs/{id}/notes` -> ADMIN, GM, TM, TO
16. `POST /api/v1/jobs/{id}/messages/external` -> CLIENT, ADMIN, GM, TM, TO, SURVEYOR
17. `POST /api/v1/jobs/{id}/messages/internal` -> ADMIN, GM, TM, TO

## Routes

### 1. GET /api/v1/jobs/upload-url
- Summary: Get presigned S3 upload URL for job documents
- Operation ID: `getJobUploadUrl`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `fileName` (query, required, string)
- `fileType` (query, required, string)
- `folder` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Presigned URL generated (application/json => object)

### 2. GET /api/v1/jobs
- Summary: List jobs (role-filtered)
- Operation ID: `getJobs`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
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
- Request Body:
- None
- Responses:
- `200`: List of jobs (application/json => object)
- `401`: Unauthorized – missing or invalid token (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – role not allowed (application/json => #/components/schemas/ErrorResponse)

### 3. POST /api/v1/jobs
- Summary: Create job request
- Operation ID: `createJob`
- Access Roles: CLIENT, ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/JobCreateRequest
- Responses:
- `201`: Job created successfully (status = CREATED) (application/json => object)
- `400`: Validation error or missing mandatory documents (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 4. GET /api/v1/jobs/{id}
- Summary: Get job details
- Operation ID: `getJobById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Job details (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 5. PUT /api/v1/jobs/{id}/verify-documents
- Summary: ADMIN/GM/TO: Verify or reject documents
- Operation ID: `verifyJobDocuments`
- Access Roles: ADMIN, GM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Documents processed. If approved, job moves to DOCUMENT_VERIFIED.
If rejected, job stays in CREATED and client is notified.
 (application/json => object)
- `400`: Job not in CREATED state, mandatory documents missing,
or `rejected_documents` array is empty when `approved=false`.
 (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN, GM, or TO can call this endpoint (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 6. PUT /api/v1/jobs/{id}/approve-request
- Summary: GM/ADMIN: Approve request → APPROVED
- Operation ID: `approveRequest`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Job approved. Status → APPROVED. (application/json => object)
- `400`: Job not in DOCUMENT_VERIFIED state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 7. PUT /api/v1/jobs/{id}/finalize
- Summary: ADMIN/GM/TM: Finalize non-survey job → FINALIZED
- Operation ID: `finalizeJob`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Job finalized. Status → FINALIZED. (application/json => object)
- `400`: Job requires a survey (is_survey_required=true), or not in APPROVED state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 8. PUT /api/v1/jobs/{id}/assign
- Summary: ADMIN/GM: Assign surveyor → ASSIGNED
- Operation ID: `assignSurveyor`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/AssignSurveyorRequest
- Responses:
- `200`: Surveyor assigned. Status → ASSIGNED. (application/json => object)
- `400`: Job not in APPROVED state, or surveyorId is invalid / not a SURVEYOR (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 9. PUT /api/v1/jobs/{id}/reassign
- Summary: ADMIN/GM/TM: Reassign surveyor (no status change)
- Operation ID: `reassignSurveyor`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/ReassignJobRequest
- Responses:
- `200`: Surveyor reassigned successfully (status unchanged). (application/json => object)
- `400`: Job is in terminal state, or surveyorId is invalid (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only GM or TM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 10. PUT /api/v1/jobs/{id}/authorize-survey
- Summary: ADMIN/TM: Authorize survey → SURVEY_AUTHORIZED
- Operation ID: `authorizeSurvey`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Survey authorized. Status → SURVEY_AUTHORIZED. (application/json => object)
- `400`: Job not in ASSIGNED state, or no surveyor assigned (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or TM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 11. PUT /api/v1/jobs/{id}/review
- Summary: ADMIN/TO: Technical review → REVIEWED
- Operation ID: `reviewJob`
- Access Roles: ADMIN, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Job reviewed. Status → REVIEWED. (application/json => object)
- `400`: Job not in SURVEY_DONE state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or TO (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 12. PUT /api/v1/jobs/{id}/reschedule
- Summary: ADMIN/GM: Reschedule job date/port
- Operation ID: `rescheduleJob`
- Access Roles: GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/RescheduleJobRequest
- Responses:
- `200`: Job rescheduled successfully. (application/json => object)
- `400`: Rescheduling not allowed in current state (e.g. IN_PROGRESS or terminal),
or `reason` is missing.
 (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – only ADMIN or GM (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 13. PUT /api/v1/jobs/{id}/reject
- Summary: ADMIN/GM/TM: Reject job → REJECTED (terminal)
- Operation ID: `rejectJob`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Job rejected. Status → REJECTED (terminal). (application/json => object)
- `400`: Job already in terminal state, or role-state constraint violated (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 14. PUT /api/v1/jobs/{id}/cancel
- Summary: CLIENT/GM/TM/ADMIN: Cancel job → REJECTED (terminal)
- Operation ID: `cancelJob`
- Access Roles: CLIENT, GM, TM, ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Job cancelled. Status → REJECTED. (application/json => object)
- `400`: Job already in terminal state (application/json => #/components/schemas/ErrorResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – CLIENT trying to cancel a job for a vessel they don't own (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 15. PUT /api/v1/jobs/{id}/priority
- Summary: ADMIN/GM/TM: Update job priority
- Operation ID: `updateJobPriority`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Priority updated successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 16. GET /api/v1/jobs/{id}/eligible-surveyors
- Summary: ADMIN/GM/TM: Get eligible surveyors for a job
- Operation ID: `getEligibleSurveyors`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of surveyors with eligibility (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 17. GET /api/v1/jobs/{id}/documents
- Summary: List job documents with verification status
- Operation ID: `getJobDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Document list with status summary (application/json => object)
- `403`: Forbidden – client can only access their own jobs (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 18. POST /api/v1/jobs/{id}/documents
- Summary: Upload or replace job documents
- Operation ID: `uploadJobDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `201`: Documents uploaded successfully (application/json => object)
- `400`: Job not in CREATED state, document already exists for this requirement,
or missing required fields.
 (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – client can only upload for their own jobs (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 19. PUT /api/v1/jobs/{id}/documents/{documentId}
- Summary: Re-upload a rejected document
- Operation ID: `reuploadJobDocument`
- Access Roles: CLIENT, ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- `documentId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Document re-uploaded successfully (new version in PENDING state) (application/json => object)
- `400`: Job not in CREATED state, or the document is not in REJECTED status.
 (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden – client can only re-upload for their own jobs (application/json => #/components/schemas/ErrorResponse)
- `404`: Job or document not found (application/json => #/components/schemas/ErrorResponse)

### 20. GET /api/v1/jobs/{id}/history
- Summary: ADMIN/GM/TM/TO/CLIENT/SURVEYOR: Job status history & audit trail
- Operation ID: `getJobHistory`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Status history list (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 21. POST /api/v1/jobs/{id}/notes
- Summary: ADMIN/GM/TM/TO: Add internal staff note
- Operation ID: `addInternalNote`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/AddNoteRequest
- Responses:
- `201`: Note added successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 22. GET /api/v1/jobs/{id}/messages/external
- Summary: Get external (client-visible) messages
- Operation ID: `getExternalMessages`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: External message thread (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 23. POST /api/v1/jobs/{id}/messages/external
- Summary: Send external (client-visible) message
- Operation ID: `sendExternalJobMessage`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `201`: Message sent successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)

### 24. GET /api/v1/jobs/{id}/messages/internal
- Summary: ADMIN/GM/TM/TO: Get internal (staff-only) messages
- Operation ID: `getInternalMessages`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Internal message thread (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 25. POST /api/v1/jobs/{id}/messages/internal
- Summary: ADMIN/GM/TM/TO: Send internal (staff-only) message
- Operation ID: `sendInternalJobMessage`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `201`: Message sent successfully. (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Job not found (application/json => #/components/schemas/ErrorResponse)
