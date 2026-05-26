# Surveyors Module API (Actual)

Source YAML: `src/docs/paths/surveyors.yaml`

## Routes

### 1. GET /api/v1/surveyors
- Summary: List all surveyors
- Operation ID: `getSurveyors`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `status` (query, optional, string)
- `is_available` (query, optional, boolean)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of surveyors fetched successfully (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Surveyors fetched successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/surveyors/surveyor.routes.js:37`
- Controller: `src/modules/surveyors/surveyor.controller.js:110`
- Service: `src/modules/surveyors/surveyor.service.js:352` (`surveyorService.getSurveyors`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/surveyors
- Summary: Create surveyor
- Operation ID: `createSurveyor`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/UserCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createSurveyor`
- Joi schema source: `src/middlewares/validate.middleware.js:265`
```js
Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and digit' }),
        phone: Joi.string().optional().allow(''),
        license_number: Joi.string().optional().allow(''),
        authorized_ship_types: Joi.array().items(Joi.string()).optional(),
        authorized_certificates: Joi.array().items(Joi.string()).optional(),
        valid_from: Joi.date().iso().optional(),
        nationality: Joi.string().optional().allow(''),
        qualification: Joi.string().optional().allow(''),
        qualifications: Joi.string().optional().allow(''), // Support both
        years_of_experience: Joi.alternatives().try(Joi.number().integer(), Joi.string().pattern(/^\d+$/).custom(v => parseInt(v))).optional(), // More flexible
    })
```

Response (Actual)
- YAML response map:
- `201`: Surveyor created
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Surveyor created successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/surveyors/surveyor.routes.js:38`
- Controller: `src/modules/surveyors/surveyor.controller.js:78`
- Service: `src/modules/surveyors/surveyor.service.js:207` (`surveyorService.createSurveyor`)
- Models touched: SurveyorProfile.create
- Service returns (detected): await fileAccessService.resolveEntity({ user, profile })

### 3. POST /api/v1/surveyors/apply
- Summary: Public surveyor application
- Operation ID: `applySurveyorPublic`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `multipart/form-data`: #/components/schemas/SurveyorApplyMultipartRequest
- `application/json`: #/components/schemas/SurveyorApplyRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Application submitted
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/surveyors/applications
- Summary: Get surveyor applications
- Operation ID: `getSurveyorApplications`
- Access Roles: ADMIN, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of applications (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. GET /api/v1/surveyors/applications/{id}
- Summary: Get surveyor application
- Operation ID: `getSurveyorApplication`
- Access Roles: ADMIN, TM
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
- `200`: Application details (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 6. PUT /api/v1/surveyors/applications/{id}/review
- Summary: Review application
- Operation ID: `reviewSurveyorApplication`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/SurveyorReviewRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Application reviewed successfully
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 7. GET /api/v1/surveyors/{id}/profile
- Summary: Get surveyor profile
- Operation ID: `getSurveyorProfile`
- Access Roles: ADMIN, TM, SURVEYOR
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
- `200`: Surveyor profile
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 8. PUT /api/v1/surveyors/{id}/profile
- Summary: Update surveyor profile
- Operation ID: `updateSurveyorProfile`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/SurveyorProfileUpdateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Profile updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 9. GET /api/v1/surveyors/{id}/authorization-checklist
- Summary: Get surveyor authorization checklist
- Operation ID: `getSurveyorAuthorizationChecklist`
- Access Roles: ADMIN, TM, GM, SURVEYOR
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
- `200`: Authorization checklist fetched successfully (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Surveyor not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 10. PUT /api/v1/surveyors/{id}/status
- Summary: Update surveyor status (Suspend/Activate)
- Operation ID: `updateSurveyorStatus`
- Access Roles: ADMIN, TM
- Change Access: ADMIN, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UserStatusUpdateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Status updated successfully
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 11. POST /api/v1/surveyors/availability
- Summary: Update availability
- Operation ID: `updateSurveyorAvailability`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/SurveyorAvailabilityRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Availability updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 12. POST /api/v1/surveyors/location
- Summary: Report location
- Operation ID: `reportSurveyorLocation`
- Access Roles: SURVEYOR
- Change Access: SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/SurveyorLocationRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Location reported
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 13. GET /api/v1/surveyors/{id}/location-history
- Summary: Get GPS history
- Operation ID: `getSurveyorGPSHistory`
- Access Roles: ADMIN, TM
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
- `200`: Location history (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A