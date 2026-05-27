# Reports Module API

Source: `src/docs/paths/reports.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, TM
- Roles with read access: ADMIN, GM, TM
- Roles with change access: N/A

## Role Action Matrix (Change Endpoints)
- No write/change endpoint in this module.

## Routes

### 1. GET /api/v1/reports/certificates
- Summary: Certificate report
- Operation ID: `getCertificateReport`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Certificate report
- `403`: Forbidden

### 2. GET /api/v1/reports/surveyors
- Summary: Surveyor report
- Operation ID: `getSurveyorReport`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Surveyor report
- `403`: Forbidden

### 3. GET /api/v1/reports/non-conformities
- Summary: Non-conformity report
- Operation ID: `getNonConformityReport`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: NC report
- `403`: Forbidden

### 4. GET /api/v1/reports/financials
- Summary: Financial report
- Operation ID: `getFinancialReport`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Financial report
- `403`: Forbidden
