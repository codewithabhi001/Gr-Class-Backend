# Surveys Module API (Actual)

Source YAML: `src/docs/paths/surveys.yaml`

## Routes

### 1. POST /api/v1/surveys/start
- Summary: Start survey (Check-in)
- Operation ID: `startSurvey`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `startSurvey`
- Joi schema source: `src/middlewares/validate.middleware.js:328`
```js
Joi.object({
        job_id: Joi.string().guid().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    })
```

Response (Actual)
- YAML response map:
- `201`: Survey started (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Survey started successfully.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:18`
- Controller: `src/modules/surveys/survey.controller.js:4`
- Service: `src/modules/surveys/survey.service.js:72` (`surveyService.startSurvey`)
- Models touched: GpsTracking.create, JobRequest.findByPk, User.findByPk
- Service returns (detected): { message: 'Survey started.', ...surveyResult }

### 2. GET /api/v1/surveys
- Summary: List survey reports
- Operation ID: `getSurveyReports`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `survey_status` (query, optional, string)
- `surveyor_id` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of survey reports (application/json => object)
- Controller response envelope(s):
```js
{ success: true, message: 'Survey reports fetched successfully.', data: reports }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:112`
- Controller: `src/modules/surveys/survey.controller.js:64`
- Service: `src/modules/surveys/survey.service.js:572` (`surveyService.getSurveyReports`)
- Models touched: Survey.findAndCountAll, Survey.findAll
- Service returns (detected): {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        status_counts: buildFullStatusCounts(statusCounts, SURVEY_STATUSES),
        rows: (await fileAccessService.resolveEntity(rows, { id: user?.id })).map(flatSurveyReportListRow),
    }

### 3. POST /api/v1/surveys
- Summary: Submit survey report (Check-out)
- Operation ID: `submitSurveyReport`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[file]
- Validation schema key: `submitSurvey`
- Joi schema source: `src/middlewares/validate.middleware.js:76`
```js
Joi.object({
        job_id: Joi.string().guid().required(),
        submit_latitude: Joi.number().required(),
        submit_longitude: Joi.number().required(),
        survey_statement: Joi.string().allow('').optional(),
        photoKey: Joi.string().required(),
        signatureKey: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `201`: Survey submitted (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Survey report submitted successfully.', data: report }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:57`
- Controller: `src/modules/surveys/survey.controller.js:32`
- Service: `src/modules/surveys/survey.service.js:195` (`surveyService.submitSurveyReport`)
- Models touched: ActivityPlanning.count, ActivityPlanning.findAll, GpsTracking.create, JobRequest.findByPk
- Service returns (detected): await fileAccessService.resolveEntity(survey, { id: userId })

### 4. GET /api/v1/surveys/jobs/{jobId}
- Summary: Get survey details
- Operation ID: `getSurveyDetails`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Survey details fetched (application/json => object)
- `404`: Survey not found
- Controller response envelope(s):
```js
{ success: true, message: 'Survey details fetched successfully.', data: details }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:127`
- Controller: `src/modules/surveys/survey.controller.js:72`
- Service: `src/modules/surveys/survey.service.js:615` (`surveyService.getSurveyDetails`)
- Models touched: Survey.findOne
- Service returns (detected): await fileAccessService.resolveEntity(survey, { id: user?.id })

### 5. PUT /api/v1/surveys/jobs/{jobId}/finalize
- Summary: Finalize survey
- Operation ID: `finalizeSurvey`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Survey finalized (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Survey finalized. Job is now FINALIZED.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:70`
- Controller: `src/modules/surveys/survey.controller.js:40`
- Service: `src/modules/surveys/survey.service.js:333` (`surveyService.finalizeSurvey`)
- Models touched: JobRequest.findByPk
- Service returns (detected): { message: 'Survey finalized. Job is now FINALIZED.' }

### 6. PUT /api/v1/surveys/jobs/{jobId}/rework
- Summary: Request Rework
- Operation ID: `requestRework`
- Access Roles: GM, TM
- Change Access: GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[jobId], query=[], body=[reason], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Rework requested (application/json => object)
- `400`: Invalid transition
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Rework requested.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:78`
- Controller: `src/modules/surveys/survey.controller.js:48`
- Service: `src/modules/surveys/survey.service.js:366` (`surveyService.requestRework`)
- Models touched: ActivityPlanning.count, JobRequest.findByPk
- Service returns (detected): { message: 'Rework requested.' }

### 7. POST /api/v1/surveys/jobs/{jobId}/location
- Summary: Stream live location
- Operation ID: `streamLocation`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[jobId], query=[], body=[], user=[id], files=[]
- Validation schema key: `updateGps`
- Joi schema source: `src/middlewares/validate.middleware.js:168`
```js
Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Location updated
- Controller response envelope(s):
```js
{ success: true, message: 'Location recorded.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:38`
- Controller: `src/modules/surveys/survey.controller.js:24`
- Service: `src/modules/surveys/survey.service.js:644` (`surveyService.streamLocation`)
- Models touched: N/A
- Service returns (detected): N/A

### 8. POST /api/v1/surveys/jobs/{jobId}/proof
- Summary: Upload survey evidence
- Operation ID: `uploadProof`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[jobId], query=[], body=[fileKey], user=[id], files=[file]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Proof uploaded
- Controller response envelope(s):
```js
{ success: false, message: 'No proof file or fileKey provided.' }
```
```js
{ success: true, message: 'Proof uploaded successfully.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:30`
- Controller: `src/modules/surveys/survey.controller.js:12`
- Service: `src/modules/surveys/survey.service.js` (`surveyService.uploadProof`)
- Models touched: N/A
- Service returns (detected): N/A

### 9. GET /api/v1/surveys/jobs/{jobId}/timeline
- Summary: Get survey execution timeline
- Operation ID: `getSurveyTimeline`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Survey timeline fetched (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 10. POST /api/v1/surveys/jobs/{jobId}/violation
- Summary: Flag survey violation
- Operation ID: `flagViolation`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Violation flagged
- Controller response envelope(s):
```js
{ success: true, message: 'Violation flagged and admins notified.', data: result }
```

Implementation Trace
- Route file: `src/modules/surveys/survey.routes.js:85`
- Controller: `src/modules/surveys/survey.controller.js:56`
- Service: `src/modules/surveys/survey.service.js:715` (`surveyService.flagViolation`)
- Models touched: AuditLog.create
- Service returns (detected): { message: 'Violation flagged and admins notified.' }

### 11. POST /api/v1/surveys/jobs/{jobId}/statement/draft
- Summary: Draft survey statement / Generate Preview
- Operation ID: `draftSurveyStatement`
- Access Roles: SURVEYOR, TM, ADMIN
- Change Access: SURVEYOR, TM, ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Success. Returns message and, for management, the signed PDF URL. (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 12. POST /api/v1/surveys/jobs/{jobId}/statement/issue
- Summary: Issue signed survey statement (PDF)
- Operation ID: `issueSurveyStatement`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Issued
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A