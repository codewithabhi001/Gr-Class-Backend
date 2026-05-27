# Compliance Module API

Source: `src/docs/paths/compliance.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT
- Roles with read access: ADMIN, CLIENT
- Roles with change access: ADMIN

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/compliance/anonymize/{id}` -> ADMIN

## Routes

### 1. GET /api/v1/compliance/export/{id}
- Summary: Export data
- Operation ID: `complianceExport`
- Access Roles: ADMIN, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Export data
- `403`: Forbidden

### 2. POST /api/v1/compliance/anonymize/{id}
- Summary: Anonymize data
- Operation ID: `complianceAnonymize`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Data anonymized
- `403`: Forbidden
