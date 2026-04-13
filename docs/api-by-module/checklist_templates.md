# Checklist Templates Module API (Actual)

Source YAML: `src/docs/paths/checklist_templates.yaml`

## Routes

### 1. GET /api/v1/checklist-templates
- Summary: Get checklist templates
- Operation ID: `getChecklistTemplates`
- Access Roles: ADMIN, GM, TM, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `status` (query, optional, string)
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
{
            success: true,
            data: templates
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:30`
- Controller: `src/modules/checklists/checklist_template.controller.js:22`
- Service: `src/modules/checklists/checklist_template.service.js:27` (`checklistTemplateService.getChecklistTemplates`)
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
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `createChecklistTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:331`
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
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DRAFT').optional(),
        metadata: Joi.object().optional()
    })
```

Response (Actual)
- YAML response map:
- `201`: Template created
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
- Route file: `src/modules/checklists/checklist_template.routes.js:17`
- Controller: `src/modules/checklists/checklist_template.controller.js:6`
- Service: `src/modules/checklists/checklist_template.service.js:10` (`checklistTemplateService.createChecklistTemplate`)
- Models touched: ChecklistTemplate.create
- Service returns (detected): await ChecklistTemplate.create({
        name: data.name,
        code: data.code,
        description: data.description,
        sections: data.sections,
        certificate_type_id: data.certificate_type_id,
        status: data.status || 'DRAFT',
        metadata: data.metadata || {},
        created_by: userId,
        updated_by: userId
    })

### 3. GET /api/v1/checklist-templates/job/{jobId}
- Summary: Get template for job
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
- `200`: Template for job
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            data: template,
            message: 'Use this template to fill out the checklist for this job'
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:41`
- Controller: `src/modules/checklists/checklist_template.controller.js:53`
- Service: `src/modules/checklists/checklist_template.service.js:88` (`checklistTemplateService.getChecklistTemplateForJob`)
- Models touched: JobRequest.findByPk, ChecklistTemplate.findOne
- Service returns (detected): template

### 4. GET /api/v1/checklist-templates/{id}
- Summary: Get template by ID
- Operation ID: `getChecklistTemplateById`
- Access Roles: ADMIN, GM, TM, SURVEYOR
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
- Controller response envelope(s):
```js
{
            success: true,
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:52`
- Controller: `src/modules/checklists/checklist_template.controller.js:37`
- Service: `src/modules/checklists/checklist_template.service.js:56` (`checklistTemplateService.getChecklistTemplateById`)
- Models touched: ChecklistTemplate.findByPk
- Service returns (detected): template

### 5. PUT /api/v1/checklist-templates/{id}
- Summary: Update template
- Operation ID: `updateChecklistTemplate`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `updateChecklistTemplate`
- Joi schema source: `src/middlewares/validate.middleware.js:347`
```js
Joi.object({
        name: Joi.string().optional(),
        code: Joi.string().optional(),
        description: Joi.string().optional().allow(''),
        certificate_type_id: Joi.string().guid().optional().allow(null),
        sections: Joi.array().items(Joi.object({
            title: Joi.string().required(),
            items: Joi.array().items(Joi.object({
                code: Joi.string().required(),
                text: Joi.string().required(),
                type: Joi.string().valid('YES_NO_NA', 'TEXT', 'NUMBER', 'PASS_FAIL', 'YES_NO', 'PASS_FAIL_NA').default('YES_NO_NA')
            })).required()
        })).optional(),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DRAFT').optional(),
        metadata: Joi.object().optional()
    })
```

Response (Actual)
- YAML response map:
- `200`: Template updated
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template updated successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:63`
- Controller: `src/modules/checklists/checklist_template.controller.js:69`
- Service: `src/modules/checklists/checklist_template.service.js:126` (`checklistTemplateService.updateChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk
- Service returns (detected): await template.update({
        ...data,
        updated_by: userId
    })

### 6. DELETE /api/v1/checklist-templates/{id}
- Summary: Delete template
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
- Controller response envelope(s):
```js
{
            success: true,
            ...result
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:97`
- Controller: `src/modules/checklists/checklist_template.controller.js:89`
- Service: `src/modules/checklists/checklist_template.service.js:146` (`checklistTemplateService.deleteChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk
- Service returns (detected): { message: 'Checklist template deleted successfully' }

### 7. PUT /api/v1/checklist-templates/{id}/activate
- Summary: Activate template
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
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template activated successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:75`
- Controller: `src/modules/checklists/checklist_template.controller.js:104`
- Service: `src/modules/checklists/checklist_template.service.js:162` (`checklistTemplateService.activateChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk, ChecklistTemplate.update
- Service returns (detected): await db.sequelize.transaction(async (t) => {
        const template = await ChecklistTemplate.findByPk(id, { transaction: t }) | await template.update({
            status: 'ACTIVE',
            updated_by: userId
        }, { transaction: t })

### 8. POST /api/v1/checklist-templates/{id}/clone
- Summary: Clone template
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
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Checklist template cloned successfully',
            data: template
        }
```

Implementation Trace
- Route file: `src/modules/checklists/checklist_template.routes.js:86`
- Controller: `src/modules/checklists/checklist_template.controller.js:123`
- Service: `src/modules/checklists/checklist_template.service.js:195` (`checklistTemplateService.cloneChecklistTemplate`)
- Models touched: ChecklistTemplate.findByPk, ChecklistTemplate.create
- Service returns (detected): newTemplate