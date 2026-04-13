# Health Module API (Actual)

Source YAML: `src/docs/paths/health.yaml`

## Routes

### 1. GET /api/v1/health
- Summary: Health check
- Operation ID: `getHealth`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: Server is healthy (application/json => object)
- Controller response envelope(s):
```js
{ success: true, data: { status: 'UP', timestamp: new Date() } }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:11`
- Controller: `src/modules/system/system.controller.js:45`
- Services: N/A