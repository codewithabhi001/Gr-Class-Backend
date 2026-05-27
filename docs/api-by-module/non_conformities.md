# Non Conformities Module API

Source: `src/docs/paths/non_conformities.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with change access: SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/non-conformities` -> SURVEYOR, TO
2. `PUT /api/v1/non-conformities/{id}/close` -> TO, TM

## Routes

### 1. GET /api/v1/non-conformities
- Summary: Get all NCs
- Operation ID: `getNCs`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `job_id` (query, optional, string)
- `status` (query, optional, string)
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: List of NCs (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/non-conformities
- Summary: Create NC
- Operation ID: `createNC`
- Access Roles: SURVEYOR, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: NC created
- `403`: Forbidden

### 3. GET /api/v1/non-conformities/{id}
- Summary: Get NC by ID
- Operation ID: `getNCById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: NC detail (application/json => object)
- `404`: Not found

### 4. PUT /api/v1/non-conformities/{id}/close
- Summary: Close NC
- Operation ID: `closeNC`
- Access Roles: TO, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: NC closed
- `403`: Forbidden

### 5. GET /api/v1/non-conformities/job/{jobId}
- Summary: Get NCs by job
- Operation ID: `getNCsByJob`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: List of NCs (application/json => object)
- `403`: Forbidden
