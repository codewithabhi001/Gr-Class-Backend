# Change Requests Module API (Actual)

Source YAML: `src/docs/paths/change_requests.yaml`

## Routes

### 1. GET /api/v1/change-requests
- Summary: Get change requests
- Operation ID: `getChangeRequests`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[status, entity_type, requested_by], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of change requests
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            change_requests: changeRequests,
            total: changeRequests.length
        }
```

Implementation Trace
- Route file: `src/modules/change_requests/change_request.routes.js:10`
- Controller: `src/modules/change_requests/change_request.controller.js:27`
- Service: `src/modules/change_requests/change_request.service.js:27` (`changeRequestService.getChangeRequests`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/change-requests
- Summary: Create change request
- Operation ID: `createChangeRequest`
- Access Roles: CLIENT, ADMIN, GM, TM
- Change Access: CLIENT, ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Change request created
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            message: 'Change request created successfully',
            change_request: changeRequest
        }
```

Implementation Trace
- Route file: `src/modules/change_requests/change_request.routes.js:9`
- Controller: `src/modules/change_requests/change_request.controller.js:7`
- Service: `src/modules/change_requests/change_request.service.js:9` (`changeRequestService.createChangeRequest`)
- Models touched: ChangeRequest.create
- Service returns (detected): changeRequest

### 3. PUT /api/v1/change-requests/{id}/approve
- Summary: Approve change request
- Operation ID: `approveChangeRequest`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Request approved
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            message: 'Change request approved',
            change_request: changeRequest
        }
```

Implementation Trace
- Route file: `src/modules/change_requests/change_request.routes.js:11`
- Controller: `src/modules/change_requests/change_request.controller.js:50`
- Service: `src/modules/change_requests/change_request.service.js:49` (`changeRequestService.approveChangeRequest`)
- Models touched: ChangeRequest.findByPk
- Service returns (detected): changeRequest

### 4. PUT /api/v1/change-requests/{id}/reject
- Summary: Reject change request
- Operation ID: `rejectChangeRequest`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Request rejected
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            message: 'Change request rejected',
            change_request: changeRequest
        }
```

Implementation Trace
- Route file: `src/modules/change_requests/change_request.routes.js:12`
- Controller: `src/modules/change_requests/change_request.controller.js:74`
- Service: `src/modules/change_requests/change_request.service.js:76` (`changeRequestService.rejectChangeRequest`)
- Models touched: ChangeRequest.findByPk
- Service returns (detected): changeRequest