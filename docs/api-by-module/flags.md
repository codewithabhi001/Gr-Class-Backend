# Flags Module API

Source: `src/docs/paths/flags.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, TM, TO
- Roles with read access: ADMIN, GM, TM, TO
- Roles with change access: ADMIN

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/flags` -> ADMIN
2. `PUT /api/v1/flags/{id}` -> ADMIN
3. `DELETE /api/v1/flags/{id}` -> ADMIN

## Routes

### 1. GET /api/v1/flags
- Summary: Get flags
- Operation ID: `getFlags`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `search` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of flags (application/json => array<#/components/schemas/FlagAdministrationListItem>)
- `403`: Forbidden

### 2. POST /api/v1/flags
- Summary: Create flag
- Operation ID: `createFlag`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Flag created
- `403`: Forbidden

### 3. GET /api/v1/flags/{id}
- Summary: Get flag by ID
- Operation ID: `getFlag`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Flag details (application/json => object)
- `403`: Forbidden
- `404`: Flag not found

### 4. PUT /api/v1/flags/{id}
- Summary: Update flag
- Operation ID: `updateFlag`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Flag updated
- `403`: Forbidden

### 5. DELETE /api/v1/flags/{id}
- Summary: Delete flag
- Operation ID: `deleteFlag`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Flag deleted successfully (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — ADMIN role required (application/json => #/components/schemas/ErrorResponse)
- `404`: Flag not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Conflict — flag is still in use.
Message describes exactly how many vessels or certificates reference it.
 (application/json => #/components/schemas/ErrorResponse)
