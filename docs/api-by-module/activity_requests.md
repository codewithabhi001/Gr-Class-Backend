# Activity Requests Module API

Source: `src/docs/paths/activity_requests.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/activity-requests` -> CLIENT, ADMIN, GM, TM
2. `PUT /api/v1/activity-requests/{id}/status` -> ADMIN, GM, TM
3. `POST /api/v1/activity-requests/{id}/convert-to-job` -> ADMIN, GM, TM

## Routes

### 1. GET /api/v1/activity-requests
- Summary: List activity requests
- Operation ID: `getActivityRequests`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- `activity_type` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Paginated list (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/activity-requests
- Summary: Create activity request
- Operation ID: `createActivityRequest`
- Access Roles: CLIENT, ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ActivityRequestCreateRequest
- Responses:
- `201`: Flat activity request detail (same shape as GET by id) (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `400`: Validation error
- `403`: Forbidden

### 3. GET /api/v1/activity-requests/{id}
- Summary: Get activity request by ID
- Operation ID: `getActivityRequestById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Activity request detail (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `403`: Forbidden
- `404`: Not found

### 4. PUT /api/v1/activity-requests/{id}/status
- Summary: Approve or reject activity request
- Operation ID: `updateActivityRequestStatus`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/ActivityRequestStatusUpdateRequest
- Responses:
- `200`: Updated flat detail (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `400`: Invalid status (e.g. CONVERTED_TO_JOB) or already converted
- `403`: Forbidden
- `404`: Not found

### 5. POST /api/v1/activity-requests/{id}/convert-to-job
- Summary: Convert approved activity request to job
- Operation ID: `convertActivityRequestToJob`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/ActivityRequestConvertToJobRequest
- Responses:
- `201`: Job created; activity linked (application/json => #/components/schemas/ActivityRequestConvertApiEnvelope)
- `400`: Not APPROVED, missing vessel/port/date, or invalid certificate type
- `403`: Forbidden
- `404`: Activity request not found
- `409`: Already linked to a job
