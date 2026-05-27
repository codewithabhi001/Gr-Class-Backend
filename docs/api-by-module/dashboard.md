# Dashboard Module API

Source: `src/docs/paths/dashboard.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: N/A

## Role Action Matrix (Change Endpoints)
- No write/change endpoint in this module.

## Routes

### 1. GET /api/v1/dashboard
- Summary: Get dashboard
- Operation ID: `getDashboard`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Dashboard data (application/json => #/components/schemas/DashboardResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
