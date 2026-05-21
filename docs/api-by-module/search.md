# Search Module API (Actual)

Source YAML: `src/docs/paths/search.yaml`

## Routes

### 1. GET /api/v1/search
- Summary: Global search
- Operation ID: `globalSearch`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `q` (query, required, string)
- `type` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Search results (application/json => object)
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/search/search.routes.js:8`
- Controller: `src/modules/search/search.controller.js:3`
- Service: `src/modules/search/search.service.js:8` (`searchService.globalSearch`)
- Models touched: Vessel.findAll, JobRequest.findAll, Certificate.findAll
- Service returns (detected): empty jobs
            jobWhere = { id: null } | empty certificates
            certWhere = { id: null } | {
        vessels: vessels.map(flatSearchVesselRow),
        jobs: jobs.map(flatSearchJobRow),
        certificates: certificates.map(flatSearchCertificateRow),
    }