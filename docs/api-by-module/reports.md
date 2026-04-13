# Reports Module API (Actual)

Source YAML: `src/docs/paths/reports.yaml`

## Routes

### 1. GET /api/v1/reports/certificates
- Summary: Certificate report
- Operation ID: `getCertificateReport`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Certificate report
- `403`: Forbidden
- Controller response envelope(s):
```js
report
```

Implementation Trace
- Route file: `src/modules/reports/report.routes.js:10`
- Controller: `src/modules/reports/report.controller.js:3`
- Service: `src/modules/reports/report.service.js:6` (`reportService.getCertificateReport`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. GET /api/v1/reports/surveyors
- Summary: Surveyor report
- Operation ID: `getSurveyorReport`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Surveyor report
- `403`: Forbidden
- Controller response envelope(s):
```js
report
```

Implementation Trace
- Route file: `src/modules/reports/report.routes.js:11`
- Controller: `src/modules/reports/report.controller.js:12`
- Service: `src/modules/reports/report.service.js:43` (`reportService.getSurveyorPerformanceReport`)
- Models touched: N/A
- Service returns (detected): N/A

### 3. GET /api/v1/reports/non-conformities
- Summary: Non-conformity report
- Operation ID: `getNonConformityReport`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: NC report
- `403`: Forbidden
- Controller response envelope(s):
```js
report
```

Implementation Trace
- Route file: `src/modules/reports/report.routes.js:12`
- Controller: `src/modules/reports/report.controller.js:21`
- Service: `src/modules/reports/report.service.js:75` (`reportService.getNonConformityReport`)
- Models touched: N/A
- Service returns (detected): N/A

### 4. GET /api/v1/reports/financials
- Summary: Financial report
- Operation ID: `getFinancialReport`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Financial report
- `403`: Forbidden
- Controller response envelope(s):
```js
report
```

Implementation Trace
- Route file: `src/modules/reports/report.routes.js:13`
- Controller: `src/modules/reports/report.controller.js:30`
- Service: `src/modules/reports/report.service.js:101` (`reportService.getFinancialReport`)
- Models touched: N/A
- Service returns (detected): N/A