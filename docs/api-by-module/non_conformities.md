# Non Conformities Module API (Actual)

Source YAML: `src/docs/paths/non_conformities.yaml`

## Routes

### 1. GET /api/v1/non-conformities
- Summary: Get all NCs
- Operation ID: `getNCs`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `job_id` (query, optional, string)
- `status` (query, optional, string)
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of NCs (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:11`
- Controller: `src/modules/non_conformities/nc.controller.js:22`
- Service: `src/modules/non_conformities/nc.service.js:38` (`ncService.getNCs`)
- Models touched: NonConformity.findAndCountAll, NonConformity.findAll
- Service returns (detected): {
        total: count,
        page: parseInt(page),
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit),
        status_counts: buildFullStatusCounts(statusCounts, NC_STATUSES),
        rows: rows.map(flatNcListRow),
    }

### 2. POST /api/v1/non-conformities
- Summary: Create NC
- Operation ID: `createNC`
- Access Roles: SURVEYOR, TO
- Change Access: SURVEYOR, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createNC`
- Joi schema source: `src/middlewares/validate.middleware.js:185`
```js
Joi.object({
        job_id: Joi.string().guid().required(),
        description: Joi.string().required(),
        severity: Joi.string().valid('MINOR', 'MAJOR', 'CRITICAL').required(),
    })
```

Response (Actual)
- YAML response map:
- `201`: NC created
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: nc }
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:10`
- Controller: `src/modules/non_conformities/nc.controller.js:3`
- Service: `src/modules/non_conformities/nc.service.js:18` (`ncService.createNC`)
- Models touched: NonConformity.create
- Service returns (detected): nc

### 3. GET /api/v1/non-conformities/{id}
- Summary: Get NC by ID
- Operation ID: `getNCById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: NC detail (application/json => object)
- `404`: Not found
- Controller response envelope(s):
```js
{ success: true, data: nc }
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:12`
- Controller: `src/modules/non_conformities/nc.controller.js:31`
- Service: `src/modules/non_conformities/nc.service.js:79` (`ncService.getNCById`)
- Models touched: NonConformity.findByPk
- Service returns (detected): flatNcDetailRow(nc)

### 4. PUT /api/v1/non-conformities/{id}/close
- Summary: Close NC
- Operation ID: `closeNC`
- Access Roles: TO, TM
- Change Access: TO, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[closure_remarks], user=[], files=[]
- Validation schema key: `closeNC`
- Joi schema source: `src/middlewares/validate.middleware.js:190`
```js
Joi.object({
        closure_remarks: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: NC closed
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: nc }
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:13`
- Controller: `src/modules/non_conformities/nc.controller.js:12`
- Service: `src/modules/non_conformities/nc.service.js:27` (`ncService.closeNC`)
- Models touched: NonConformity.findByPk
- Service returns (detected): nc

### 5. GET /api/v1/non-conformities/job/{jobId}
- Summary: Get NCs by job
- Operation ID: `getNCsByJob`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of NCs (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A