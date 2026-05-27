# Surveys Module API

Source: `src/docs/paths/surveys.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/surveys/start` -> SURVEYOR
2. `POST /api/v1/surveys` -> SURVEYOR
3. `PUT /api/v1/surveys/jobs/{jobId}/finalize` -> TM, ADMIN
4. `PUT /api/v1/surveys/jobs/{jobId}/rework` -> GM, TM, TO, ADMIN
5. `POST /api/v1/surveys/jobs/{jobId}/location` -> SURVEYOR
6. `POST /api/v1/surveys/jobs/{jobId}/proof` -> SURVEYOR
7. `POST /api/v1/surveys/jobs/{jobId}/violation` -> TM
8. `POST /api/v1/surveys/jobs/{jobId}/statement/draft` -> SURVEYOR, TM, ADMIN
9. `POST /api/v1/surveys/jobs/{jobId}/statement/issue` -> TM
10. `POST /api/v1/surveys/jobs/{jobId}/sync` -> SURVEYOR

## Routes

### 1. POST /api/v1/surveys/start
- Summary: Start survey / Check-in (per certificate)
- Operation ID: `startSurvey`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Survey started for this certificate (application/json => object)
- `400`: Survey already started or invalid state
- `403`: Forbidden — not the assigned surveyor

### 2. GET /api/v1/surveys
- Summary: List survey reports
- Operation ID: `getSurveyReports`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `survey_status` (query, optional, string)
- `surveyor_id` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of survey reports (application/json => object)

### 3. POST /api/v1/surveys
- Summary: Submit survey report / Check-out (per certificate)
- Operation ID: `submitSurveyReport`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `201`: Survey submitted for this certificate (application/json => object)
- `400`: Checklist/proof incomplete or invalid state
- `403`: Forbidden

### 4. GET /api/v1/surveys/jobs/{jobId}
- Summary: Get all surveys for a job
- Operation ID: `getSurveyDetails`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `job_certificate_id` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Survey details (array for multi-cert jobs) (application/json => object)
- `404`: Survey not found

### 5. PUT /api/v1/surveys/jobs/{jobId}/finalize
- Summary: Finalize submitted surveys for a job (TM/ADMIN)
- Operation ID: `finalizeSurvey`
- Access Roles: TM, ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Survey(s) finalized successfully (application/json => object)
- `400`: No submitted surveys found to finalize
- `403`: Forbidden — not a TM or ADMIN

### 6. PUT /api/v1/surveys/jobs/{jobId}/rework
- Summary: Request rework on a survey (GM/TM/TO/ADMIN)
- Operation ID: `requestRework`
- Access Roles: GM, TM, TO, ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `job_certificate_id` (query, optional, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Rework requested successfully (application/json => object)
- `400`: Job is not in REVIEWED state, or job is already finalized
- `403`: Forbidden — caller does not have GM/TM/TO/ADMIN privileges

### 7. POST /api/v1/surveys/jobs/{jobId}/location
- Summary: Stream live GPS location (per certificate)
- Operation ID: `streamLocation`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Location updated

### 8. POST /api/v1/surveys/jobs/{jobId}/proof
- Summary: Upload survey evidence proof (per certificate)
- Operation ID: `uploadProof`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `201`: Proof uploaded

### 9. GET /api/v1/surveys/jobs/{jobId}/timeline
- Summary: Get survey execution timeline (all certificates)
- Operation ID: `getSurveyTimeline`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Survey timeline (application/json => object)

### 10. POST /api/v1/surveys/jobs/{jobId}/violation
- Summary: Flag survey violation
- Operation ID: `flagViolation`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Violation flagged

### 11. POST /api/v1/surveys/jobs/{jobId}/statement/draft
- Summary: Draft survey statement / Generate preview
- Operation ID: `draftSurveyStatement`
- Access Roles: SURVEYOR, TM, ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Statement drafted (application/json => object)

### 12. POST /api/v1/surveys/jobs/{jobId}/statement/issue
- Summary: Issue signed survey statement (PDF)
- Operation ID: `issueSurveyStatement`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `200`: Issued

### 13. POST /api/v1/surveys/jobs/{jobId}/sync
- Summary: Offline sync — replay batched data
- Operation ID: `syncOfflineData`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Offline data synced (application/json => object)
- `400`: Invalid job state or surveyor mismatch
- `403`: Forbidden
- `404`: Job not found
