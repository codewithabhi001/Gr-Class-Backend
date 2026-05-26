# Clients Module API (Actual)

Source YAML: `src/docs/paths/clients.yaml`

## Routes

### 1. GET /api/v1/clients
- Summary: List clients
- Operation ID: `getClients`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of clients (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Clients fetched successfully',
            data: clients
        }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:16`
- Controller: `src/modules/clients/client.controller.js:14`
- Service: `src/modules/clients/client.service.js:46` (`clientService.getClients`)
- Models touched: Client.findAndCountAll
- Service returns (detected): result

### 2. POST /api/v1/clients
- Summary: Create client
- Operation ID: `createClient`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ClientCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createClient`
- Joi schema source: `src/middlewares/validate.middleware.js:235`
```js
Joi.object({
        company_name: Joi.string().required(),
        company_code: Joi.string().required(),
        email: Joi.string().email().required(),
        address: Joi.string().optional().allow(''),
        country: Joi.string().optional().allow(''),
        phone: Joi.string().optional().allow(''),
        contact_person_name: Joi.string().optional().allow(''),
        contact_person_email: Joi.string().email().optional().allow(''),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
        user: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and digit' }),
            role: Joi.string().valid('CLIENT', 'ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR').optional().default('CLIENT'),
            phone: Joi.string().optional().allow(''),
        }).optional(),
    })
```

Response (Actual)
- YAML response map:
- `201`: Client created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Client created successfully',
            data: client
        }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:15`
- Controller: `src/modules/clients/client.controller.js:3`
- Service: `src/modules/clients/client.service.js:17` (`clientService.createClient`)
- Models touched: Client.create
- Service returns (detected): await Client.create(clientFields) | { client, user } | result

### 3. GET /api/v1/clients/profile/documents
- Summary: Get client profile documents
- Operation ID: `getClientProfileDocuments`
- Access Roles: CLIENT
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
- `200`: List of documents (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/clients/{id}/documents
- Summary: Get client documents by ID
- Operation ID: `getClientDocumentsById`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of documents (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. GET /api/v1/clients/{id}
- Summary: Get client by ID
- Operation ID: `getClientById`
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
- `200`: Client details (application/json => object)
- `404`: Client not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Client details fetched successfully',
            data: client
        }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:17`
- Controller: `src/modules/clients/client.controller.js:25`
- Service: `src/modules/clients/client.service.js:82` (`clientService.getClientById`)
- Models touched: N/A
- Service returns (detected): N/A

### 6. PUT /api/v1/clients/{id}
- Summary: Update client
- Operation ID: `updateClient`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Client updated (application/json => object)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Client updated successfully',
            data: client
        }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:19`
- Controller: `src/modules/clients/client.controller.js:36`
- Service: `src/modules/clients/client.service.js:88` (`clientService.updateClient`)
- Models touched: N/A
- Service returns (detected): await client.update(data)

### 7. DELETE /api/v1/clients/{id}
- Summary: Delete client
- Operation ID: `deleteClient`
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
- `200`: Client deleted (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Client deleted/deactivated successfully'
        }
```

Implementation Trace
- Route file: `src/modules/clients/client.routes.js:20`
- Controller: `src/modules/clients/client.controller.js:47`
- Service: `src/modules/clients/client.service.js:93` (`clientService.deleteClient`)
- Models touched: N/A
- Service returns (detected): await client.update({ status: 'INACTIVE' })