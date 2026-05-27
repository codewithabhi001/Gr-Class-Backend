# Change Requests Module API

Source: `src/docs/paths/change_requests.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, TM
- Roles with read access: ADMIN, CLIENT, GM, TM
- Roles with change access: ADMIN, CLIENT, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/change-requests` -> CLIENT, ADMIN, GM, TM
2. `PUT /api/v1/change-requests/{id}/approve` -> ADMIN, GM
3. `PUT /api/v1/change-requests/{id}/reject` -> ADMIN, GM

## Routes

### 1. GET /api/v1/change-requests
- Summary: Get change requests
- Operation ID: `getChangeRequests`
- Access Roles: ADMIN, GM, TM, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of change requests
- `403`: Forbidden

### 2. POST /api/v1/change-requests
- Summary: Create change request
- Operation ID: `createChangeRequest`
- Access Roles: CLIENT, ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Change request created successfully
- `403`: Forbidden

### 3. GET /api/v1/change-requests/{id}
- Summary: Get change request by ID
- Operation ID: `getChangeRequestById`
- Access Roles: ADMIN, GM, TM, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Change request details
- `403`: Forbidden
- `404`: Change request not found

### 4. PUT /api/v1/change-requests/{id}/approve
- Summary: Approve change request
- Operation ID: `approveChangeRequest`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Request approved
- `403`: Forbidden

### 5. PUT /api/v1/change-requests/{id}/reject
- Summary: Reject change request
- Operation ID: `rejectChangeRequest`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Request rejected
- `403`: Forbidden
