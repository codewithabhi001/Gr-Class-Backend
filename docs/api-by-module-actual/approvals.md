# Approvals Module API (Actual)

Source YAML: `src/docs/paths/approvals.yaml`

## Routes

### 1. POST /api/v1/approvals
- Summary: Create approval
- Operation ID: `createApproval`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Approval created
- `403`: Forbidden
- Controller response envelope(s):
```js
201
```

Implementation Trace
- Route file: `src/modules/approvals/approval.routes.js:9`
- Controller: `src/modules/approvals/approval.controller.js:3`
- Service: `src/modules/approvals/approval.service.js:4` (`approvalService.createApproval`)
- Models touched: Approval.create
- Service returns (detected): await Approval.create({ ...data, status: 'PENDING' })

### 2. PUT /api/v1/approvals/{id}/step
- Summary: Update approval step
- Operation ID: `updateApprovalStep`
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
- `200`: Step updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A