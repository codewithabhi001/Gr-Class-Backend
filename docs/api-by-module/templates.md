# Templates Module API (Actual)

Source YAML: `src/docs/paths/templates.yaml`

## Routes

### 1. GET /api/v1/certificate-templates
- Summary: List certificate templates
- Operation ID: `getTemplates`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `is_active` (query, optional, boolean)
- `certificate_type_id` (query, optional, string)
- `certificate_term` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of templates (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: templates }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:14`
- Controller: `src/modules/templates/template.controller.js:10`
- Service: `src/modules/templates/template.service.js:32` (`templateService.getTemplates`)
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
- `application/json`: #/components/schemas/CertificateTemplateCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:387`
```js
Joi.object({
        template_name: Joi.string().required(),
        certificate_type_id: Joi.string().guid().required(),
        certificate_term: Joi.string().valid('FULL_TERM', 'SHORT_TERM').optional().allow(null),
        template_file_url: Joi.string().required(),
        variables: Joi.array().items(Joi.string()).optional(),
        is_active: Joi.boolean().optional().default(true)
    })
```

Response (Actual)
- YAML response map:
- `201`: Template created (application/json => object)
- `400`: Validation error
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Template created', data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:11`
- Controller: `src/modules/templates/template.controller.js:3`
- Service: `src/modules/templates/template.service.js:7` (`templateService.createTemplate`)
- Models touched: CertificateTemplate.create
- Service returns (detected): await fileAccessService.resolveEntity(template)

### 3. GET /api/v1/certificate-templates/get-upload-url
- Summary: Get S3 upload URL for the certificate-template DOCX
- Operation ID: `getCertificateTemplateUploadUrl`
- Access Roles: ADMIN
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Upload URL generated (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Missing fileName / contentType
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/certificate-templates/{id}
- Summary: Get certificate template by ID
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
- `200`: Template details (application/json => object)
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{ success: true, data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:21`
- Controller: `src/modules/templates/template.controller.js:17`
- Service: `src/modules/templates/template.service.js:46` (`templateService.getTemplateById`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): await fileAccessService.resolveEntity(template)

### 5. PUT /api/v1/certificate-templates/{id}
- Summary: Update certificate template
- Operation ID: `updateTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/CertificateTemplateUpdateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:395`
```js
Joi.object({
        template_name: Joi.string().optional(),
        certificate_type_id: Joi.string().guid().optional(),
        certificate_term: Joi.string().valid('FULL_TERM', 'SHORT_TERM').optional().allow(null),
        template_file_url: Joi.string().optional(),
        variables: Joi.array().items(Joi.string()).optional(),
        is_active: Joi.boolean().optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Template updated (application/json => object)
- `400`: Validation error
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{ success: true, message: 'Template updated', data: template }
```

Implementation Trace
- Route file: `src/modules/templates/template.routes.js:24`
- Controller: `src/modules/templates/template.controller.js:24`
- Service: `src/modules/templates/template.service.js:54` (`templateService.updateTemplate`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): await fileAccessService.resolveEntity(updated)

### 6. DELETE /api/v1/certificate-templates/{id}
- Summary: Delete certificate template
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
- Route file: `src/modules/templates/template.routes.js:27`
- Controller: `src/modules/templates/template.controller.js:31`
- Service: `src/modules/templates/template.service.js:62` (`templateService.deleteTemplate`)
- Models touched: CertificateTemplate.findByPk
- Service returns (detected): { message: 'Template deleted successfully' }