# Activity Requests Module API (Actual)

Source YAML: `src/docs/paths/activity_requests.yaml`

## Routes

### 1. GET /api/v1/activity-requests
- Summary: List activity requests
- Operation ID: `getActivityRequests`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- `activity_type` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Paginated list (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/activity-requests
- Summary: Create activity request
- Operation ID: `createActivityRequest`
- Access Roles: CLIENT, ADMIN, GM, TM
- Change Access: CLIENT, ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ActivityRequestCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Flat activity request detail (same shape as GET by id) (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `400`: Validation error
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/activity-requests/{id}
- Summary: Get activity request by ID
- Operation ID: `getActivityRequestById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
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
- `200`: Activity request detail (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `403`: Forbidden
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/activity-requests/{id}/status
- Summary: Approve or reject activity request
- Operation ID: `updateActivityRequestStatus`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ActivityRequestStatusUpdateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Updated flat detail (application/json => #/components/schemas/ActivityRequestApiEnvelope)
- `400`: Invalid status (e.g. CONVERTED_TO_JOB) or already converted
- `403`: Forbidden
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. POST /api/v1/activity-requests/{id}/convert-to-job
- Summary: Convert approved activity request to job
- Operation ID: `convertActivityRequestToJob`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ActivityRequestConvertToJobRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Job created; activity linked (application/json => #/components/schemas/ActivityRequestConvertApiEnvelope)
- `400`: Not APPROVED, missing vessel/port/date, or invalid certificate type
- `403`: Forbidden
- `404`: Activity request not found
- `409`: Already linked to a job
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A