# 13 — Document Management APIs

**Base URL:** `/api/v1/documents`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/documents/get-upload-url`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR`  
> Get a pre-signed S3 upload URL.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | string | ✅ | File name e.g. `report.pdf` |
| `fileType` | string | ✅ | MIME type e.g. `application/pdf` |
| `folder` | string | optional | Target folder e.g. `surveys`, `documents` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/girik-bucket/uploads/abc/report.pdf?X-Amz-Signature=...",
    "fileKey": "uploads/abc/report.pdf",
    "expiresIn": 3600
  }
}
```

---

## 2. POST `/api/v1/documents/upload`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR`  
> Upload a standalone file directly.  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | ✅ | The file to upload |
| `folder` | string | optional | `misc`, `documents`, `surveys`, `jobs/attachments` |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "fileKey": "misc/1709672200000-report.pdf",
    "url": "https://storage.grclass.com/misc/1709672200000-report.pdf"
  }
}
```

---

## 3. POST `/api/v1/documents/register`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR`  
> Register a file uploaded via pre-signed URL.

### Request Body
```json
{
  "fileKey": "uploads/abc/report.pdf",
  "fileType": "application/pdf",
  "document_type": "Survey Report",
  "description": "Final survey report for job #42"
}
```

| Field | Type | Required |
|-------|------|----------|
| `fileKey` | string | ✅ |
| `fileType` | string | optional |
| `document_type` | string | optional |
| `description` | string | optional |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "entity_type": "STANDALONE",
    "file_key": "uploads/abc/report.pdf",
    "document_type": "Survey Report"
  }
}
```

---

## 4. GET `/api/v1/documents/:id`

> **Access:** Any authenticated user  
> Get a single document by ID.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "entity_type": "JOB",
    "entity_id": "uuid",
    "document_type": "Class Certificate",
    "description": "Current class certificate",
    "file_name": "class_cert.pdf",
    "signedUrl": "https://signed-url...",
    "created_at": "2026-01-15T00:00:00.000Z"
  }
}
```

---

## 5. GET `/api/v1/documents/:entityType/:entityId`

> **Access:** Any authenticated user (access validated against entity)  
> Get all documents for a specific entity.

### Path Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `entityType` | string | ✅ | `JOB`, `VESSEL`, `CLIENT`, `SURVEY`, `CERTIFICATE` |
| `entityId` | UUID | ✅ | ID of the entity |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entity_type": "VESSEL",
      "entity_id": "uuid",
      "document_type": "Class Certificate",
      "description": "Current class certificate",
      "signedUrl": "https://signed-url...",
      "created_at": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 6. POST `/api/v1/documents/:entityType/:entityId`

> **Access:** Any authenticated user (access validated)  
> Upload documents for a specific entity.  
> **Content-Type:** `multipart/form-data`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `entityType` | string | ✅ |
| `entityId` | UUID | ✅ |

### Request Body (form-data)
| Field | Type | Required |
|-------|------|----------|
| `files` | file(s) | ✅ |
| `document_type` | string | optional |
| `description` | string | optional |

### Response `201 Created`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "entity_type": "VESSEL",
      "entity_id": "uuid",
      "document_type": "Class Certificate",
      "signedUrl": "https://signed-url..."
    }
  ]
}
```

---

## 7. POST `/api/v1/documents/:entityType/:entityId/register`

> **Access:** Any authenticated user  
> Register pre-uploaded files to an entity.

### Request Body
```json
{
  "fileData": {
    "url": "uploads/abc/report.pdf",
    "type": "application/pdf"
  },
  "document_type": "Survey Report",
  "description": "Final survey report"
}
```

### Response `201 Created`
Same structure as upload response.

---

## 8. DELETE `/api/v1/documents/:id`

> **Access:** `ADMIN`, `GM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Document deleted"
}
```
