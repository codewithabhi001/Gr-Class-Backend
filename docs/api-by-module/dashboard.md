# Dashboard Module API (Actual)

Source YAML: `src/docs/paths/dashboard.yaml`

## Routes

### 1. GET /api/v1/dashboard
- Summary: Get dashboard
- Operation ID: `getDashboard`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[client_id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Dashboard data (application/json => #/components/schemas/DashboardResponse)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:17`
- Controller: `src/modules/clients/client.controller.js:72`
- Service: `src/modules/clients/client.service.js:111` (`clientService.getDashboardData`)
- Models touched: Vessel.findAll, JobRequest.findAll, Certificate.findAll, Payment.findAll
- Service returns (detected): daysToExpiry <= 60 && daysToExpiry > 0 | {
        stats,
        recent_jobs: jobs.slice(0, 5),
        expiring_certificates: certificates
            .filter(c => {
                const daysToExpiry = Math.floor((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))