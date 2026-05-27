# Search Module API

Source: `src/docs/paths/search.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: N/A

## Role Action Matrix (Change Endpoints)
- No write/change endpoint in this module.

## Routes

### 1. GET /api/v1/search
- Summary: Global search
- Operation ID: `globalSearch`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `q` (query, required, string)
- `type` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Search results (application/json => object)
