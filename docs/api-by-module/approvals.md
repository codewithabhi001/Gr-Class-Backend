# Approvals Module API

Source: `src/docs/paths/approvals.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, TM
- Roles with read access: N/A
- Roles with change access: ADMIN, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/approvals` -> ADMIN, GM, TM
2. `PUT /api/v1/approvals/{id}/step` -> ADMIN, GM, TM

## Routes

### 1. POST /api/v1/approvals
- Summary: Create approval
- Operation ID: `createApproval`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Approval created
- `403`: Forbidden

### 2. PUT /api/v1/approvals/{id}/step
- Summary: Update approval step
- Operation ID: `updateApprovalStep`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Step updated
- `403`: Forbidden
