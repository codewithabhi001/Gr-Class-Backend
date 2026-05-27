# Toca Module API

Source: `src/docs/paths/toca.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, TM
- Roles with read access: ADMIN, GM, TM
- Roles with change access: ADMIN, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/toca` -> TM
2. `PUT /api/v1/toca/{id}/status` -> TM, ADMIN

## Routes

### 1. GET /api/v1/toca
- Summary: Get TOCAs
- Operation ID: `getTocas`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of TOCAs
- `403`: Forbidden

### 2. POST /api/v1/toca
- Summary: Create TOCA
- Operation ID: `createToca`
- Access Roles: TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: TOCA created
- `403`: Forbidden

### 3. PUT /api/v1/toca/{id}/status
- Summary: Update TOCA status
- Operation ID: `updateTocaStatus`
- Access Roles: TM, ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Status updated
- `403`: Forbidden
