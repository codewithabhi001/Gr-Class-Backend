# Documents Module API (Actual)

Source YAML: `src/docs/paths/documents.yaml`

## Routes

### 1. GET /api/v1/documents/get-upload-url
- Summary: Generate a pre-signed URL for direct S3 upload
- Operation ID: `getUploadSignedUrl`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `fileName` (query, required, string)
- `fileType` (query, required, string)
- `folder` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Pre-signed URL generated (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/documents/upload
- Summary: Upload a standalone document file (Multipart)
- Operation ID: `uploadStandaloneFile`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `multipart/form-data`: object
- Req usage in controller: params=[], query=[], body=[folder], user=[], files=[file]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: File uploaded successfully (application/json => object)
- `400`: No file provided
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:12`
- Controller: `src/modules/documents/document.controller.js:115`
- Service: `src/modules/documents/document.service.js:33` (`documentService.uploadStandaloneFile`)
- Models touched: N/A
- Service returns (detected): { file_url: url }

### 3. POST /api/v1/documents/register
- Summary: Register an already uploaded S3 file (Standalone)
- Operation ID: `registerStandaloneFile`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Registered
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:13`
- Controller: `N/A`
- Services: N/A

### 4. POST /api/v1/documents/{entityType}/{entityId}/register
- Summary: Register an already uploaded S3 file for a specific entity
- Operation ID: `registerEntityDocument`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Registered
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. GET /api/v1/documents/{entityType}/{entityId}
- Summary: Get documents
- Operation ID: `getDocuments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[entityType], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of documents retrieved successfully (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:16`
- Controller: `src/modules/documents/document.controller.js:8`
- Service: `src/services/fileAccess.service.js:213` (`fileAccessService.validateUserEntityAccess`)
- Models touched: Vessel.findOne, JobRequest.findByPk, Certificate.findByPk, JobRequest.findOne
- Service returns (detected): true | !!vessel | job && job.Vessel.client_id === user.client_id | cert && cert.Vessel.client_id === user.client_id | !!job | false
- Service: `src/modules/documents/document.service.js:8` (`documentService.getEntityDocuments`)
- Models touched: Document.findAll
- Service returns (detected): await fileAccessService.resolveEntity(documents)
- Service: `src/services/fileAccess.service.js:246` (`fileAccessService.processFileAccess`)
- Models touched: N/A
- Service returns (detected): {
        fileName: key.split('/').pop(), // Simple filename extraction
        contentType: fileRecord.file_type || 'application/octet-stream',
        expiresAt: expiresAt, // Null for public CDN
        signedUrl: signedUrl
    }

### 6. POST /api/v1/documents/{entityType}/{entityId}
- Summary: Upload document
- Operation ID: `uploadDocument`
- Access Roles: CLIENT, ADMIN, GM, TM, SURVEYOR
- Change Access: CLIENT, ADMIN, GM, TM, SURVEYOR

Request (Code + Schema)
- Route Params/Query from YAML:
- `entityType` (path, required, string)
- `entityId` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[entityType], query=[], body=[fileData], user=[id], files=[file]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Documents uploaded successfully (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, count: data.length, data: data }
```

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:17`
- Controller: `src/modules/documents/document.controller.js:56`
- Service: `src/services/fileAccess.service.js:213` (`fileAccessService.validateUserEntityAccess`)
- Models touched: Vessel.findOne, JobRequest.findByPk, Certificate.findByPk, JobRequest.findOne
- Service returns (detected): true | !!vessel | job && job.Vessel.client_id === user.client_id | cert && cert.Vessel.client_id === user.client_id | !!job | false
- Service: `src/modules/documents/document.service.js:41` (`documentService.uploadEntityDocument`)
- Models touched: Document.create
- Service returns (detected): await fileAccessService.resolveEntity(doc, { id: userId })
- Service: `src/modules/documents/document.service.js:60` (`documentService.registerDocument`)
- Models touched: Document.create
- Service returns (detected): await fileAccessService.resolveEntity(doc, { id: userId })
- Service: `src/services/fileAccess.service.js:246` (`fileAccessService.processFileAccess`)
- Models touched: N/A
- Service returns (detected): {
        fileName: key.split('/').pop(), // Simple filename extraction
        contentType: fileRecord.file_type || 'application/octet-stream',
        expiresAt: expiresAt, // Null for public CDN
        signedUrl: signedUrl
    }

### 7. GET /api/v1/documents/{id}
- Summary: Get document by ID
- Operation ID: `getDocumentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO, SURVEYOR
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
- `200`: Document retrieved successfully (application/json => object)
- `403`: Forbidden
- `404`: Document not found
- Controller response envelope(s):
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:15`
- Controller: `src/modules/documents/document.controller.js:35`
- Service: `src/modules/documents/document.service.js:27` (`documentService.getDocumentById`)
- Models touched: Document.findByPk
- Service returns (detected): await fileAccessService.resolveEntity(document)
- Service: `src/services/fileAccess.service.js:213` (`fileAccessService.validateUserEntityAccess`)
- Models touched: Vessel.findOne, JobRequest.findByPk, Certificate.findByPk, JobRequest.findOne
- Service returns (detected): true | !!vessel | job && job.Vessel.client_id === user.client_id | cert && cert.Vessel.client_id === user.client_id | !!job | false
- Service: `src/services/fileAccess.service.js:246` (`fileAccessService.processFileAccess`)
- Models touched: N/A
- Service returns (detected): {
        fileName: key.split('/').pop(), // Simple filename extraction
        contentType: fileRecord.file_type || 'application/octet-stream',
        expiresAt: expiresAt, // Null for public CDN
        signedUrl: signedUrl
    }

### 8. DELETE /api/v1/documents/{id}
- Summary: Delete document
- Operation ID: `deleteDocument`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[folder], user=[id], files=[file]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Document deleted
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, message: 'Document deleted' }
```
```js
{ success: true, data: result }
```
```js
{ success: true, data }
```

Implementation Trace
- Route file: `src/modules/documents/document.routes.js:19`
- Controller: `src/modules/documents/document.controller.js:105`
- Service: `src/modules/documents/document.service.js:74` (`documentService.deleteDocument`)
- Models touched: Document.findByPk
- Service returns (detected): await doc.destroy()
- Service: `src/modules/documents/document.service.js:33` (`documentService.uploadStandaloneFile`)
- Models touched: N/A
- Service returns (detected): { file_url: url }
- Service: `src/modules/documents/document.service.js:80` (`documentService.generatePresignedUrl`)
- Models touched: N/A
- Service returns (detected): { uploadUrl, fileKey: key }
- Service: `src/modules/documents/document.service.js:60` (`documentService.registerDocument`)
- Models touched: Document.create
- Service returns (detected): await fileAccessService.resolveEntity(doc, { id: userId })