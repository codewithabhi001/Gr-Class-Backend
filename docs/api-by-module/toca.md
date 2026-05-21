# Toca Module API (Actual)

Source YAML: `src/docs/paths/toca.yaml`

## Routes

### 1. GET /api/v1/toca
- Summary: Get TOCAs
- Operation ID: `getTocas`
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
- `200`: List of TOCAs
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/toca/toca.routes.js:12`
- Controller: `src/modules/toca/toca.controller.js:17`
- Service: `src/modules/toca/toca.service.js:22` (`tocaService.getTocas`)
- Models touched: Toca.findAll
- Service returns (detected): await Toca.findAll({
        limit: 10,
        attributes: ['id', 'vessel_id', 'losing_class_society', 'gaining_class_society', 'request_date', 'status', 'decision_date']
    })

### 2. POST /api/v1/toca
- Summary: Create TOCA
- Operation ID: `createToca`
- Access Roles: TM
- Change Access: TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `createToca`
- Joi schema source: `src/middlewares/validate.middleware.js:199`
```js
Joi.object({
        vessel_id: Joi.string().guid().required(),
        losing_class_society: Joi.string().required(),
        gaining_class_society: Joi.string().required(),
        request_date: Joi.date().required(),
    })
```

Response (Actual)
- YAML response map:
- `201`: TOCA created
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: toca }
```

Implementation Trace
- Route file: `src/modules/toca/toca.routes.js:10`
- Controller: `src/modules/toca/toca.controller.js:3`
- Service: `src/modules/toca/toca.service.js:6` (`tocaService.createToca`)
- Models touched: Toca.create
- Service returns (detected): toca

### 3. PUT /api/v1/toca/{id}/status
- Summary: Update TOCA status
- Operation ID: `updateTocaStatus`
- Access Roles: TM, ADMIN
- Change Access: TM, ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Status updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A