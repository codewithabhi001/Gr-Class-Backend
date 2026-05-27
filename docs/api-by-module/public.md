# Public Module API

Source: `src/docs/paths/public.yaml`

## Access Summary
- Roles with any access: PUBLIC
- Roles with read access: PUBLIC
- Roles with change access: N/A

## Role Action Matrix (Change Endpoints)
- No write/change endpoint in this module.

## Routes

### 1. GET /api/v1/public/certificate/verify/{number}
- Summary: Verify certificate (public)
- Operation ID: `verifyCertificatePublic`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- `number` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Certificate verification result

### 2. GET /api/v1/public/vessel/{imo}
- Summary: Verify vessel by IMO (public)
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- `imo` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Vessel verification result

### 3. GET /api/v1/public/flags
- Summary: Get public flags list (public)
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of active flags with minimal info
