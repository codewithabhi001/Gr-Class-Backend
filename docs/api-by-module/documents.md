# Documents Module API

Source: `src/docs/paths/documents.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/documents/upload` -> CLIENT, ADMIN, GM, TM, SURVEYOR
2. `POST /api/v1/documents/register` -> CLIENT, ADMIN, GM, TM, SURVEYOR
3. `POST /api/v1/documents/get-presigned-url` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
4. `POST /api/v1/documents/{entityType}/{entityId}/register` -> CLIENT, ADMIN, GM, TM, SURVEYOR
5. `POST /api/v1/documents/{entityType}/{entityId}` -> CLIENT, ADMIN, GM, TM, SURVEYOR
6. `DELETE /api/v1/documents/{id}` -> ADMIN, GM

## Routes

### 1. GET /api/v1/documents/get-upload-url
- Summary: Generate a pre-signed URL for direct S3 upload
- Operation ID: `getUploadSignedUrl`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `fileName` (query, required, string)
- `fileType` (query, required, string)
- `folder` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: Pre-signed URL generated (application/json => object)

### 2. POST /api/v1/documents/upload
- Summary: Upload a standalone document file (Multipart)
- Operation ID: `uploadStandaloneFile`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `multipart/form-data`: object
- Responses:
- `201`: File uploaded successfully (application/json => object)
- `400`: No file provided
- `403`: Forbidden

### 3. POST /api/v1/documents/register
- Summary: Register an already uploaded S3 file (Standalone)
- Operation ID: `registerStandaloneFile`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Registered
- `403`: Forbidden

### 4. POST /api/v1/documents/get-presigned-url
- Summary: Get a pre-signed URL to read/view a file from S3
- Operation ID: `getPresignedReadUrl`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Pre-signed URL generated successfully (application/json => object)

### 5. POST /api/v1/documents/{entityType}/{entityId}/register
- Summary: Register an already uploaded S3 file for a specific entity
- Operation ID: `registerEntityDocument`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `201`: Registered
- `403`: Forbidden

### 6. GET /api/v1/documents/{entityType}/{entityId}
- Summary: Get documents
- Operation ID: `getDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: List of documents retrieved successfully (application/json => object)
- `403`: Forbidden

### 7. POST /api/v1/documents/{entityType}/{entityId}
- Summary: Upload document
- Operation ID: `uploadDocument`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `201`: Documents uploaded successfully (application/json => object)
- `403`: Forbidden

### 8. GET /api/v1/documents/{id}
- Summary: Get document by ID
- Operation ID: `getDocumentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Document retrieved successfully (application/json => object)
- `403`: Forbidden
- `404`: Document not found

### 9. DELETE /api/v1/documents/{id}
- Summary: Delete document
- Operation ID: `deleteDocument`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Document deleted
- `403`: Forbidden
