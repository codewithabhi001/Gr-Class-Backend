# Checklist Templates Module API (Actual)

Source YAML: `src/docs/paths/checklist_templates.yaml`

## Routes

### 1. GET /api/v1/checklist-templates
- Summary: List checklist templates
- Operation ID: `getChecklistTemplates`
- Access Roles: ADMIN, GM, TM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `status` (query, optional, string)
- `certificate_type_id` (query, optional, string)
- `code` (query, optional, string)
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
{
            success: true,
            data: templates
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:42`
- Controller: `src/modules/checklists/checklist_template.controller.js:22`
- Service: `src/modules/checklists/checklist_template.service.js:33` (`checklistTemplateService.getChecklistTemplates`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/checklist-templates
- Summary: Create checklist template
- Operation ID: `createChecklistTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ChecklistTemplateCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `createChecklistTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:394`
```js
Joi.object({
        name: Joi.string().required(),
        code: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        certificate_type_id: Joi.string().guid().optional().allow(null),
        sections: Joi.array().items(Joi.object({
            title: Joi.string().required(),
            items: Joi.array().items(Joi.object({
                code: Joi.string().required(),
                text: Joi.string().required(),
                type: Joi.string().valid('YES_NO_NA', 'TEXT', 'NUMBER', 'PASS_FAIL', 'YES_NO', 'PASS_FAIL_NA').default('YES_NO_NA')
            })).required()
        })).required(),
        // Optional. S3 keys obtained from
        // GET /api/v1/checklist-templates/get-upload-url. Stored as JSON array.
        template_files: Joi.array().items(Joi.string()).optional(),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DRAFT').optional(),
        metadata: Joi.object().optional()
    })
```

Response (Actual)
- YAML response map:
- `201`: Template created (application/json => object)
- `400`: Validation error
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template created successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:18`
- Controller: `src/modules/checklists/checklist_template.controller.js:6`
- Service: `src/modules/checklists/checklist_template.service.js:15` (`checklistTemplateService.createChecklistTemplate`)
- Models touched: ChecklistTemplate.create
- Service returns (detected): await ChecklistTemplate.create({
        name: data.name,
        code: data.code,
        description: data.description,
        sections: data.sections,
        template_files: data.template_files,
        certificate_type_id: data.certificate_type_id,
        status: data.status || 'DRAFT',
        metadata: data.metadata || {},
        created_by: userId,
        updated_by: userId
    })

### 3. GET /api/v1/checklist-templates/get-upload-url
- Summary: Get S3 upload URL for a template document (DOCX / PDF)
- Operation ID: `getChecklistTemplateUploadUrl`
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

### 4. GET /api/v1/checklist-templates/job/{jobId}
- Summary: Get template for a specific job
- Operation ID: `getChecklistTemplateForJob`
- Access Roles: SURVEYOR, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Template for job (application/json => object)
- `403`: Forbidden
- `404`: No active template for this certificate type
- Controller response envelope(s):
```js
{
            success: true,
            data: template,
            message: 'Use this template to fill out the checklist for this job'
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:65`
- Controller: `src/modules/checklists/checklist_template.controller.js:53`
- Service: `src/modules/checklists/checklist_template.service.js:96` (`checklistTemplateService.getChecklistTemplateForJob`)
- Models touched: JobRequest.findByPk, ChecklistTemplate.findOne
- Service returns (detected): await fileAccessService.resolveEntity(template)

### 5. GET /api/v1/checklist-templates/job/{jobId}/download
- Summary: Download auto-filled checklist DOCX for a job
- Operation ID: `downloadChecklistTemplateForJob`
- Access Roles: SURVEYOR, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- `force` (query, optional, boolean)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[force], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Signed URL(s) for filled DOCX (application/json => object)
- `400`: Template has no template_files configured
- `403`: Forbidden
- `404`: Job or active template not found
- Controller response envelope(s):
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:54`
- Controller: `src/modules/checklists/checklist_template.controller.js:69`
- Service: `src/modules/checklists/checklist_template.service.js:133` (`checklistTemplateService.downloadChecklistTemplateForJob`)
- Models touched: N/A
- Service returns (detected): N/A

### 6. GET /api/v1/checklist-templates/{id}
- Summary: Get template by ID
- Operation ID: `getChecklistTemplateById`
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
{
            success: true,
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:76`
- Controller: `src/modules/checklists/checklist_template.controller.js:37`
- Service: `src/modules/checklists/checklist_template.service.js:64` (`checklistTemplateService.getChecklistTemplateById`)
- Models touched: ChecklistTemplate.findByPk
- Service returns (detected): await fileAccessService.resolveEntity(template)

### 7. PUT /api/v1/checklist-templates/{id}
- Summary: Update template (full replace OR add/remove file keys)
- Operation ID: `updateChecklistTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/ChecklistTemplateUpdateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `updateChecklistTemplate`

Response (Actual)
- YAML response map:
- `200`: Template updated (application/json => object)
- `400`: Either (a) you tried to mix full-replace `template_files` with
`add_*`/`remove_*`, or (b) you tried to make a structural edit on a
non-DRAFT template.

- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template updated successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:87`
- Controller: `src/modules/checklists/checklist_template.controller.js:101`
- Service: `src/modules/checklists/checklist_template.service.js` (`checklistTemplateService.updateChecklistTemplate`)
- Models touched: N/A
- Service returns (detected): N/A

### 8. DELETE /api/v1/checklist-templates/{id}
- Summary: Delete template (soft delete → INACTIVE)
- Operation ID: `deleteChecklistTemplate`
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
{
            success: true,
            ...result
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:121`
- Controller: `src/modules/checklists/checklist_template.controller.js:121`
- Service: `src/modules/checklists/checklist_template.service.js:296` (`checklistTemplateService.deleteChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk
- Service returns (detected): { message: 'Checklist template deleted successfully' }

### 9. PUT /api/v1/checklist-templates/{id}/activate
- Summary: Activate template (deactivates other actives for the same certificate type)
- Operation ID: `activateChecklistTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Template activated
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template activated successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:99`
- Controller: `src/modules/checklists/checklist_template.controller.js:136`
- Service: `src/modules/checklists/checklist_template.service.js:320` (`checklistTemplateService.activateChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk, ChecklistTemplate.update
- Service returns (detected): await db.sequelize.transaction(async (t) => {
        const template = await ChecklistTemplate.findByPk(id, { transaction: t }) | await template.update({
            status: 'ACTIVE',
            updated_by: userId
        }, { transaction: t })

### 10. POST /api/v1/checklist-templates/{id}/clone
- Summary: Clone template (auto-bumps version, leaves clone in DRAFT)
- Operation ID: `cloneChecklistTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Template cloned
- `403`: Forbidden
- `404`: Template not found
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template cloned successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:110`
- Controller: `src/modules/checklists/checklist_template.controller.js:155`
- Service: `src/modules/checklists/checklist_template.service.js:379` (`checklistTemplateService.cloneChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk, ChecklistTemplate.create
- Service returns (detected): newTemplate