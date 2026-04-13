# Vessels Module API (Actual)

Source YAML: `src/docs/paths/vessels.yaml`

## Routes

### 1. GET /api/v1/vessels
- Summary: List vessels
- Operation ID: `getVessels`
- Access Roles: ADMIN, GM, TM, TO, CLIENT
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[role], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of vessels (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Vessels fetched successfully',
            data: vessels
        }
```

Implementation Trace
- Route file: `src/modules/vessels/vessel.routes.js:12`
- Controller: `src/modules/vessels/vessel.controller.js:22`
- Service: `src/modules/vessels/vessel.service.js:55` (`vesselService.getVessels`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/vessels
- Summary: Create vessel
- Operation ID: `createVessel`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/VesselCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `createVessel`
- Joi schema source: `src/middlewares/validate.middleware.js:363`
```js
Joi.object({
        client_id: Joi.string().guid().required(),
        vessel_name: Joi.string().required(),
        imo_number: Joi.string().pattern(/^[0-9]{7}$/).required().messages({
            'string.pattern.base': 'IMO number must be a 7-digit number'
        }),
        call_sign: Joi.string().optional().allow(''),
        mmsi_number: Joi.string().pattern(/^[0-9]{9}$/).optional().allow('').messages({
            'string.pattern.base': 'MMSI number must be a 9-digit number'
        }),
        flag_administration_id: Joi.string().guid().required(),
        port_of_registry: Joi.string().optional().allow(''),
        year_built: Joi.number().integer().optional(),
        ship_type: Joi.string().required(),
        gross_tonnage: Joi.number().optional(),
        net_tonnage: Joi.number().optional(),
        deadweight: Joi.number().optional(),
        class_status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'WITHDRAWN').optional(),
        current_class_society: Joi.string().optional().allow(''),
        engine_type: Joi.string().optional().allow(''),
        builder_name: Joi.string().optional().allow(''),
        uploaded_documents: Joi.array().items(Joi.object({
            file_url: Joi.string().required(),
            document_type: Joi.string().required(),
            description: Joi.string().optional().allow('')
        })).optional()
    })
```

Response (Actual)
- YAML response map:
- `201`: Vessel created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Vessel added successfully',
            data: vessel
        }
```

Implementation Trace
- Route file: `src/modules/vessels/vessel.routes.js:18`
- Controller: `src/modules/vessels/vessel.controller.js:11`
- Service: `src/modules/vessels/vessel.service.js:17` (`vesselService.createVessel`)
- Models touched: Client.findByPk, Vessel.findOne, Vessel.create, VesselDocument.bulkCreate
- Service returns (detected): vessel

### 3. GET /api/v1/vessels/client/{clientId}
- Summary: Get vessels by client
- Operation ID: `getVesselsByClient`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `clientId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of client vessels (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/vessels/{id}
- Summary: Get vessel by ID
- Operation ID: `getVesselById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
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
- `200`: Vessel details (application/json => object)
- `404`: Vessel not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Vessel details fetched successfully',
            data: vessel
        }
```

Implementation Trace
- Route file: `src/modules/vessels/vessel.routes.js:21`
- Controller: `src/modules/vessels/vessel.controller.js:34`
- Service: `src/modules/vessels/vessel.service.js:127` (`vesselService.getVesselById`)
- Models touched: N/A
- Service returns (detected): N/A

### 5. PUT /api/v1/vessels/{id}
- Summary: Update vessel
- Operation ID: `updateVessel`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/VesselUpdateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `updateVessel`
- Joi schema source: `src/middlewares/validate.middleware.js:390`
```js
Joi.object({
        client_id: Joi.string().guid().optional(),
        vessel_name: Joi.string().optional(),
        imo_number: Joi.string().pattern(/^[0-9]{7}$/).optional().messages({
            'string.pattern.base': 'IMO number must be a 7-digit number'
        }),
        call_sign: Joi.string().optional().allow(''),
        mmsi_number: Joi.string().pattern(/^[0-9]{9}$/).optional().allow('').messages({
            'string.pattern.base': 'MMSI number must be a 9-digit number'
        }),
        flag_administration_id: Joi.string().guid().optional(),
        port_of_registry: Joi.string().optional().allow(''),
        year_built: Joi.number().integer().optional(),
        ship_type: Joi.string().optional(),
        gross_tonnage: Joi.number().optional(),
        net_tonnage: Joi.number().optional(),
        deadweight: Joi.number().optional(),
        class_status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'WITHDRAWN').optional(),
        current_class_society: Joi.string().optional().allow(''),
        engine_type: Joi.string().optional().allow(''),
        builder_name: Joi.string().optional().allow(''),
        uploaded_documents: Joi.array().items(Joi.object({
            file_url: Joi.string().required(),
            document_type: Joi.string().required(),
            description: Joi.string().optional().allow('')
        })).optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Vessel updated (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Vessel updated successfully',
            data: vessel
        }
```

Implementation Trace
- Route file: `src/modules/vessels/vessel.routes.js:24`
- Controller: `src/modules/vessels/vessel.controller.js:57`
- Service: `src/modules/vessels/vessel.service.js:203` (`vesselService.updateVessel`)
- Models touched: N/A
- Service returns (detected): N/A