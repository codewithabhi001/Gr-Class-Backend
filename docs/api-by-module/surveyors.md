# Surveyors Module API

Source: `src/docs/paths/surveyors.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, PUBLIC, SURVEYOR, TM
- Roles with read access: ADMIN, GM, PUBLIC, SURVEYOR, TM
- Roles with change access: ADMIN, PUBLIC, SURVEYOR, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/surveyors` -> ADMIN, TM
2. `POST /api/v1/surveyors/apply` -> PUBLIC
3. `PUT /api/v1/surveyors/applications/{id}/review` -> ADMIN, TM
4. `PUT /api/v1/surveyors/{id}/profile` -> ADMIN, TM
5. `PUT /api/v1/surveyors/{id}/status` -> ADMIN, TM
6. `POST /api/v1/surveyors/availability` -> SURVEYOR
7. `POST /api/v1/surveyors/location` -> SURVEYOR

## Routes

### 1. GET /api/v1/surveyors
- Summary: List all surveyors
- Operation ID: `getSurveyors`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `status` (query, optional, string)
- `is_available` (query, optional, boolean)
- Request Body:
- None
- Responses:
- `200`: List of surveyors fetched successfully (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/surveyors
- Summary: Create surveyor
- Operation ID: `createSurveyor`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/UserCreateRequest
- Responses:
- `201`: Surveyor created
- `403`: Forbidden

### 3. GET /api/v1/surveyors/get-upload-url
- Summary: Get public upload URLs for surveyor application documents
- Operation ID: `getSurveyorUploadUrls`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- `cv_filename` (query, optional, string)
- `cv_mimetype` (query, optional, string)
- `id_proof_filename` (query, optional, string)
- `id_proof_mimetype` (query, optional, string)
- `certificate_filenames` (query, optional, string)
- `certificate_mimetypes` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Pre-signed upload URLs generated successfully (application/json => object)

### 4. POST /api/v1/surveyors/apply
- Summary: Public surveyor application
- Operation ID: `applySurveyorPublic`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `multipart/form-data`: #/components/schemas/SurveyorApplyMultipartRequest
- `application/json`: #/components/schemas/SurveyorApplyRequest
- Responses:
- `201`: Application submitted

### 5. GET /api/v1/surveyors/applications
- Summary: Get surveyor applications
- Operation ID: `getSurveyorApplications`
- Access Roles: ADMIN, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of applications (application/json => object)
- `403`: Forbidden

### 6. GET /api/v1/surveyors/applications/{id}
- Summary: Get surveyor application
- Operation ID: `getSurveyorApplication`
- Access Roles: ADMIN, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Application details (application/json => object)
- `403`: Forbidden

### 7. PUT /api/v1/surveyors/applications/{id}/review
- Summary: Review application
- Operation ID: `reviewSurveyorApplication`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/SurveyorReviewRequest
- Responses:
- `200`: Application reviewed successfully
- `403`: Forbidden

### 8. GET /api/v1/surveyors/{id}/profile
- Summary: Get surveyor profile
- Operation ID: `getSurveyorProfile`
- Access Roles: ADMIN, TM, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Surveyor profile
- `403`: Forbidden

### 9. PUT /api/v1/surveyors/{id}/profile
- Summary: Update surveyor profile
- Operation ID: `updateSurveyorProfile`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/SurveyorProfileUpdateRequest
- Responses:
- `200`: Profile updated
- `403`: Forbidden

### 10. GET /api/v1/surveyors/{id}/authorization-checklist
- Summary: Get surveyor authorization checklist
- Operation ID: `getSurveyorAuthorizationChecklist`
- Access Roles: ADMIN, TM, GM, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Authorization checklist fetched successfully (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- `404`: Surveyor not found (application/json => #/components/schemas/ErrorResponse)

### 11. PUT /api/v1/surveyors/{id}/status
- Summary: Update surveyor status (Suspend/Activate)
- Operation ID: `updateSurveyorStatus`
- Access Roles: ADMIN, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UserStatusUpdateRequest
- Responses:
- `200`: Status updated successfully
- `403`: Forbidden

### 12. POST /api/v1/surveyors/availability
- Summary: Update availability
- Operation ID: `updateSurveyorAvailability`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/SurveyorAvailabilityRequest
- Responses:
- `200`: Availability updated
- `403`: Forbidden

### 13. POST /api/v1/surveyors/location
- Summary: Report location
- Operation ID: `reportSurveyorLocation`
- Access Roles: SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/SurveyorLocationRequest
- Responses:
- `200`: Location reported
- `403`: Forbidden

### 14. GET /api/v1/surveyors/{id}/location-history
- Summary: Get GPS history
- Operation ID: `getSurveyorGPSHistory`
- Access Roles: ADMIN, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Location history (application/json => object)
- `403`: Forbidden
