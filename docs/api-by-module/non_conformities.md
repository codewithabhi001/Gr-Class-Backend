# Non Conformities Module API (Actual)

Source YAML: `src/docs/paths/non_conformities.yaml`

## Routes

### 1. POST /api/v1/non-conformities
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
- Joi schema source: `src/middlewares/validate.middleware.js:132`
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
nc
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:10`
- Controller: `src/modules/non_conformities/nc.controller.js:3`
- Service: `src/modules/non_conformities/nc.service.js:6` (`ncService.createNC`)
- Models touched: NonConformity.create
- Service returns (detected): nc

### 2. PUT /api/v1/non-conformities/{id}/close
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
- Joi schema source: `src/middlewares/validate.middleware.js:137`
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
nc
```

Implementation Trace
- Route file: `src/modules/non_conformities/nc.routes.js:11`
- Controller: `src/modules/non_conformities/nc.controller.js:12`
- Service: `src/modules/non_conformities/nc.service.js:15` (`ncService.closeNC`)
- Models touched: NonConformity.findByPk
- Service returns (detected): nc

### 3. GET /api/v1/non-conformities/job/{jobId}
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