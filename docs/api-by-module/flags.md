# Flags Module API (Actual)

Source YAML: `src/docs/paths/flags.yaml`

## Routes

### 1. GET /api/v1/flags
- Summary: Get flags
- Operation ID: `getFlags`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `search` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[search], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of flags (application/json => array)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: list }
```

Implementation Trace
- Route file: `src/modules/flags/flag.routes.js:11`
- Controller: `src/modules/flags/flag.controller.js:10`
- Service: `src/modules/flags/flag.service.js:12` (`flagService.getFlags`)
- Models touched: FlagAdministration.findAll
- Service returns (detected): await resolveEntity(list)

### 2. POST /api/v1/flags
- Summary: Create flag
- Operation ID: `createFlag`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createFlag`
- Joi schema source: `src/middlewares/validate.middleware.js:217`
```js
Joi.object({
        flag_state_name: Joi.string().required(),
        country: Joi.string().required(),
        authority_name: Joi.string().required(),
        contact_email: Joi.string().email().required(),
        authorization_scope: Joi.string().optional().allow('', null),
        logo_url: Joi.string().optional().allow('', null),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
    })
```

Response (Actual)
- YAML response map:
- `201`: Flag created
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: flag }
```

Implementation Trace
- Route file: `src/modules/flags/flag.routes.js:10`
- Controller: `src/modules/flags/flag.controller.js:3`
- Service: `src/modules/flags/flag.service.js:7` (`flagService.createFlag`)
- Models touched: FlagAdministration.create
- Service returns (detected): await resolveEntity(flag)

### 3. GET /api/v1/flags/{id}
- Summary: Get flag by ID
- Operation ID: `getFlag`
- Access Roles: ADMIN, GM, TM, TO
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
- `200`: Flag details (application/json => object)
- `403`: Forbidden
- `404`: Flag not found
- Controller response envelope(s):
```js
{ success: true, data: flag }
```

Implementation Trace
- Route file: `src/modules/flags/flag.routes.js:12`
- Controller: `src/modules/flags/flag.controller.js:17`
- Service: `src/modules/flags/flag.service.js:34` (`flagService.getFlag`)
- Models touched: FlagAdministration.findByPk
- Service returns (detected): await resolveEntity(flag)

### 4. PUT /api/v1/flags/{id}
- Summary: Update flag
- Operation ID: `updateFlag`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateFlag`
- Joi schema source: `src/middlewares/validate.middleware.js:226`
```js
Joi.object({
        flag_state_name: Joi.string().optional(),
        country: Joi.string().optional(),
        authority_name: Joi.string().optional(),
        contact_email: Joi.string().email().optional(),
        authorization_scope: Joi.string().optional().allow('', null),
        logo_url: Joi.string().optional().allow('', null),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Flag updated
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: flag }
```

Implementation Trace
- Route file: `src/modules/flags/flag.routes.js:13`
- Controller: `src/modules/flags/flag.controller.js:24`
- Service: `src/modules/flags/flag.service.js:39` (`flagService.updateFlag`)
- Models touched: FlagAdministration.findByPk
- Service returns (detected): await resolveEntity(updated)

### 5. DELETE /api/v1/flags/{id}
- Summary: Delete flag
- Operation ID: `deleteFlag`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Flag deleted successfully (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- `403`: Forbidden — ADMIN role required (application/json => #/components/schemas/ErrorResponse)
- `404`: Flag not found (application/json => #/components/schemas/ErrorResponse)
- `409`: Conflict — flag is still in use.
Message describes exactly how many vessels or certificates reference it.
 (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, ...result }
```

Implementation Trace
- Route file: `src/modules/flags/flag.routes.js:14`
- Controller: `src/modules/flags/flag.controller.js:31`
- Service: `src/modules/flags/flag.service.js:46` (`flagService.deleteFlag`)
- Models touched: FlagAdministration.findByPk, Vessel.count, Certificate.count
- Service returns (detected): { message: 'Flag deleted successfully' }