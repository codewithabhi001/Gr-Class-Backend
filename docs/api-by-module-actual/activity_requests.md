# Activity Requests Module API (Actual)

Source YAML: `src/docs/paths/activity_requests.yaml`

## Routes

### 1. GET /api/v1/activity-requests
- Summary: Get activity requests (List)
- Operation ID: `getActivityRequests`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of requests (application/json => object)
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
- `201`: Request created (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/activity-requests/{id}
- Summary: Get request by ID (Detailed)
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
- `200`: Request details (application/json => object)
- `403`: Forbidden
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/activity-requests/{id}/status
- Summary: Update request status
- Operation ID: `updateActivityRequestStatus`
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
- `200`: Status updated (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A