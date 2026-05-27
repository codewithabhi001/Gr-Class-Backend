# Vessels Module API

Source: `src/docs/paths/vessels.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/vessels` -> ADMIN, GM, TM
2. `PUT /api/v1/vessels/{id}` -> ADMIN, GM, TM

## Routes

### 1. GET /api/v1/vessels/types
- Summary: Get distinct vessel types
- Operation ID: `getVesselTypes`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of distinct vessel ship_type values (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 2. GET /api/v1/vessels
- Summary: List vessels
- Operation ID: `getVessels`
- Access Roles: ADMIN, GM, TM, TO, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of vessels (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)

### 3. POST /api/v1/vessels
- Summary: Create vessel
- Operation ID: `createVessel`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/VesselCreateRequest
- Responses:
- `201`: Vessel created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 4. GET /api/v1/vessels/client/{clientId}
- Summary: Get vessels by client
- Operation ID: `getVesselsByClient`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `clientId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: List of client vessels (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 5. GET /api/v1/vessels/{id}
- Summary: Get vessel by ID
- Operation ID: `getVesselById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Vessel details (application/json => object)
- `404`: Vessel not found (application/json => #/components/schemas/ErrorResponse)

### 6. PUT /api/v1/vessels/{id}
- Summary: Update vessel
- Operation ID: `updateVessel`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/VesselUpdateRequest
- Responses:
- `200`: Vessel updated (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
