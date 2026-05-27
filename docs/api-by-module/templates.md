# Templates Module API

Source: `src/docs/paths/templates.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, TM
- Roles with read access: ADMIN, GM, TM
- Roles with change access: ADMIN

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/certificate-templates` -> ADMIN
2. `PUT /api/v1/certificate-templates/{id}` -> ADMIN
3. `DELETE /api/v1/certificate-templates/{id}` -> ADMIN

## Routes

### 1. GET /api/v1/certificate-templates
- Summary: List certificate templates
- Operation ID: `getTemplates`
- Access Roles: ADMIN, GM, TM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `is_active` (query, optional, boolean)
- `certificate_type_id` (query, optional, string)
- `certificate_term` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of templates (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/certificate-templates
- Summary: Create certificate template
- Operation ID: `createTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/CertificateTemplateCreateRequest
- Responses:
- `201`: Template created (application/json => object)
- `400`: Validation error
- `403`: Forbidden

### 3. GET /api/v1/certificate-templates/get-upload-url
- Summary: Get S3 upload URL for the certificate-template DOCX
- Operation ID: `getCertificateTemplateUploadUrl`
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

### 4. GET /api/v1/certificate-templates/{id}
- Summary: Get certificate template by ID
- Operation ID: `getTemplateById`
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

### 5. PUT /api/v1/certificate-templates/{id}
- Summary: Update certificate template
- Operation ID: `updateTemplate`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/CertificateTemplateUpdateRequest
- Responses:
- `200`: Template updated (application/json => object)
- `400`: Validation error
- `403`: Forbidden
- `404`: Template not found

### 6. DELETE /api/v1/certificate-templates/{id}
- Summary: Delete certificate template
- Operation ID: `deleteTemplate`
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
