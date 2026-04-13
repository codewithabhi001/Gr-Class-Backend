# Templates Module API (Actual)

Source YAML: `src/docs/paths/templates.yaml`

## Routes

### 1. GET /api/v1/certificate-templates
- Summary: Get certificate templates
- Operation ID: `getTemplates`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `is_active` (query, optional, boolean)
- `certificate_type_id` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of templates
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: templates }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:14`
- Controller: `src/modules/templates/template.controller.js:10`
- Service: `src/modules/templates/template.service.js:15` (`templateService.getTemplates`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/certificate-templates
- Summary: Create certificate template
- Operation ID: `createTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:317`
```js
Joi.object({
        template_name: Joi.string().required(),
        certificate_type_id: Joi.string().guid().required(),
        template_content: Joi.string().required(),
        variables: Joi.array().items(Joi.string()).optional(),
        is_active: Joi.boolean().optional().default(true)
    })
```

Response (Actual)
- YAML response map:
- `201`: Template created
- `400`: Bad request
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Template created', data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:11`
- Controller: `src/modules/templates/template.controller.js:3`
- Service: `src/modules/templates/template.service.js:5` (`templateService.createTemplate`)
- Models touched: CertificateTemplate.create
- Service returns (detected): await CertificateTemplate.create({
        template_name: data.template_name,
        certificate_type_id: data.certificate_type_id,
        template_content: data.template_content,
        variables: data.variables || [],
        is_active: data.is_active !== false
    })

### 3. GET /api/v1/certificate-templates/{id}
- Summary: Get template by ID
- Operation ID: `getTemplateById`
- Access Roles: ADMIN, GM, TM
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
- `200`: Template details
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{ success: true, data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:17`
- Controller: `src/modules/templates/template.controller.js:17`
- Service: `src/modules/templates/template.service.js:27` (`templateService.getTemplateById`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): template

### 4. PUT /api/v1/certificate-templates/{id}
- Summary: Update template
- Operation ID: `updateTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:324`
```js
Joi.object({
        template_name: Joi.string().optional(),
        certificate_type_id: Joi.string().guid().optional(),
        template_content: Joi.string().optional(),
        variables: Joi.array().items(Joi.string()).optional(),
        is_active: Joi.boolean().optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Template updated
- `400`: Bad request
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{ success: true, message: 'Template updated', data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:20`
- Controller: `src/modules/templates/template.controller.js:24`
- Service: `src/modules/templates/template.service.js:35` (`templateService.updateTemplate`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): await template.update(data)

### 5. DELETE /api/v1/certificate-templates/{id}
- Summary: Delete template
- Operation ID: `deleteTemplate`
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
- `200`: Template deleted
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{ success: true, ...result }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:23`
- Controller: `src/modules/templates/template.controller.js:31`
- Service: `src/modules/templates/template.service.js:42` (`templateService.deleteTemplate`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): { message: 'Template deleted successfully' }