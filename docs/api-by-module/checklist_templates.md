# Checklist Templates Module API

Source: `src/docs/paths/checklist_templates.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/checklist-templates` -> ADMIN
2. `PUT /api/v1/checklist-templates/{id}` -> ADMIN
3. `DELETE /api/v1/checklist-templates/{id}` -> ADMIN
4. `PUT /api/v1/checklist-templates/{id}/activate` -> ADMIN
5. `POST /api/v1/checklist-templates/{id}/clone` -> ADMIN

## Routes

### 1. GET /api/v1/checklist-templates
- Summary: List checklist templates
- Operation ID: `getChecklistTemplates`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `status` (query, optional, string)
- `certificate_type_id` (query, optional, string)
- `code` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of templates (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/checklist-templates
- Summary: Create checklist template
- Operation ID: `createChecklistTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ChecklistTemplateCreateRequest
- Responses:
- `201`: Template created (application/json => object)
- `400`: Validation error
- `403`: Forbidden

### 3. GET /api/v1/checklist-templates/get-upload-url
- Summary: Get S3 upload URL for a template document (DOCX / PDF)
- Operation ID: `getChecklistTemplateUploadUrl`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- `fileName` (query, required, string)
- `contentType` (query, required, string)
- Request Body:
- None
- Responses:
- `200`: Upload URL generated (application/json => #/components/schemas/UploadUrlResponse)
- `400`: Missing fileName / contentType
- `403`: Forbidden

### 4. GET /api/v1/checklist-templates/job/{jobId}
- Summary: Get template for a specific job
- Operation ID: `getChecklistTemplateForJob`
- Access Roles: SURVEYOR, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Template for job (application/json => object)
- `403`: Forbidden
- `404`: No active template for this certificate type

### 5. GET /api/v1/checklist-templates/job/{jobId}/download
- Summary: Download auto-filled checklist DOCX for a job
- Operation ID: `downloadChecklistTemplateForJob`
- Access Roles: SURVEYOR, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- `force` (query, optional, boolean)
- Request Body:
- None
- Responses:
- `200`: Signed URL(s) for filled DOCX (application/json => object)
- `400`: Template has no template_files configured
- `403`: Forbidden
- `404`: Job or active template not found

### 6. GET /api/v1/checklist-templates/{id}
- Summary: Get template by ID
- Operation ID: `getChecklistTemplateById`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Template details (application/json => object)
- `403`: Forbidden
- `404`: Template not found

### 7. PUT /api/v1/checklist-templates/{id}
- Summary: Update template (full replace OR add/remove file keys)
- Operation ID: `updateChecklistTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/ChecklistTemplateUpdateRequest
- Responses:
- `200`: Template updated (application/json => object)
- `400`: Either (a) you tried to mix full-replace `template_files` with
`add_*`/`remove_*`, or (b) you tried to make a structural edit on a
non-DRAFT template.

- `403`: Forbidden
- `404`: Template not found

### 8. DELETE /api/v1/checklist-templates/{id}
- Summary: Delete template (soft delete → INACTIVE)
- Operation ID: `deleteChecklistTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Template deleted
- `403`: Forbidden
- `404`: Template not found

### 9. PUT /api/v1/checklist-templates/{id}/activate
- Summary: Activate template (deactivates other actives for the same certificate type)
- Operation ID: `activateChecklistTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Template activated
- `403`: Forbidden
- `404`: Template not found

### 10. POST /api/v1/checklist-templates/{id}/clone
- Summary: Clone template (auto-bumps version, leaves clone in DRAFT)
- Operation ID: `cloneChecklistTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `201`: Template cloned
- `403`: Forbidden
- `404`: Template not found
