# 11 — Checklist & Template APIs

**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## CHECKLIST APIs (`/api/v1/checklists`)

### 1. GET `/api/v1/checklists/jobs/:jobId`

> **Access:** Any authenticated user  
> Get submitted checklist answers for a job.

#### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "template_id": "uuid",
    "status": "SUBMITTED",
    "items": [
      {
        "id": "uuid",
        "question_code": "FS-001",
        "question_text": "Fire extinguishers inspected and within service date?",
        "answer": "YES",
        "remarks": "All 15 extinguishers in good condition",
        "file_url": "https://storage.grclass.com/checklists/photo1.jpg",
        "created_at": "2026-03-05T19:00:00.000Z"
      },
      {
        "id": "uuid",
        "question_code": "FS-002",
        "question_text": "Fire alarm system functional?",
        "answer": "YES",
        "remarks": null,
        "file_url": null,
        "created_at": "2026-03-05T19:01:00.000Z"
      },
      {
        "id": "uuid",
        "question_code": "FS-003",
        "question_text": "Emergency exits clearly marked?",
        "answer": "NO",
        "remarks": "Exit sign on deck 3 is broken",
        "file_url": "https://storage.grclass.com/checklists/broken-sign.jpg",
        "created_at": "2026-03-05T19:02:00.000Z"
      }
    ]
  }
}
```

---

### 2. PUT `/api/v1/checklists/jobs/:jobId`

> **Access:** `SURVEYOR` only  
> Submit checklist answers for a job.

#### Path Params
| Param | Type | Required |
|-------|------|----------|
| `jobId` | UUID | ✅ |

#### Request Body
```json
{
  "items": [
    {
      "question_code": "FS-001",
      "question_text": "Fire extinguishers inspected and within service date?",
      "answer": "YES",
      "remarks": "All 15 extinguishers in good condition",
      "file_url": "https://storage.grclass.com/checklists/photo1.jpg"
    },
    {
      "question_code": "FS-002",
      "question_text": "Fire alarm system functional?",
      "answer": "YES",
      "remarks": null,
      "file_url": null
    },
    {
      "question_code": "FS-003",
      "question_text": "Emergency exits clearly marked?",
      "answer": "NO",
      "remarks": "Exit sign on deck 3 is broken",
      "file_url": "https://storage.grclass.com/checklists/broken-sign.jpg"
    }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `items` | array | ✅ | Array of checklist answers |
| `items[].question_code` | string | ✅ | Code from the template |
| `items[].question_text` | string | ✅ | Question text |
| `items[].answer` | string | ✅ | `YES`, `NO`, `NA` |
| `items[].remarks` | string | optional | — |
| `items[].file_url` | string | optional | URL of evidence photo |

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "items_count": 3,
    "items": [...]
  }
}
```

---

## CHECKLIST TEMPLATE APIs (`/api/v1/checklist-templates`)

### 3. POST `/api/v1/checklist-templates`

> **Access:** `ADMIN` only  
> Create a new checklist template.

#### Request Body
```json
{
  "name": "ISM Safety Audit Checklist",
  "code": "ISM-CHK-001",
  "description": "Standard ISM Code safety audit checklist for annual surveys",
  "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
  "sections": [
    {
      "title": "Fire Safety",
      "items": [
        { "code": "FS-001", "text": "Fire extinguishers inspected?", "type": "YES_NO_NA" },
        { "code": "FS-002", "text": "Fire alarm system functional?", "type": "YES_NO_NA" },
        { "code": "FS-003", "text": "Emergency exits clearly marked?", "type": "YES_NO_NA" }
      ]
    },
    {
      "title": "Life-saving Appliances",
      "items": [
        { "code": "LS-001", "text": "Lifeboats serviceable?", "type": "YES_NO_NA" },
        { "code": "LS-002", "text": "Life jackets available for all crew?", "type": "YES_NO_NA" }
      ]
    }
  ],
  "status": "ACTIVE",
  "metadata": {}
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `code` | string | ✅ | Unique template code |
| `description` | string | optional | — |
| `certificate_type_id` | UUID | optional | Links to a cert type |
| `sections` | array | ✅ | Array of sections |
| `sections[].title` | string | ✅ | Section title |
| `sections[].items` | array | ✅ | Array of checklist items |
| `sections[].items[].code` | string | ✅ | Item code |
| `sections[].items[].text` | string | ✅ | Question text |
| `sections[].items[].type` | string | ✅ | `YES_NO_NA` |
| `status` | string | optional | `ACTIVE`, `INACTIVE`, `DRAFT` |
| `metadata` | object | optional | — |

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Checklist template created successfully",
  "data": {
    "id": "uuid",
    "name": "ISM Safety Audit Checklist",
    "code": "ISM-CHK-001",
    "status": "ACTIVE",
    "sections": [...]
  }
}
```

### 4. GET `/api/v1/checklist-templates`
> **Access:** `ADMIN`, `GM`, `TM`, `SURVEYOR`  
> **Query:** `?status=ACTIVE&certificate_type_id=uuid`

### 5. GET `/api/v1/checklist-templates/:id`
> **Access:** `ADMIN`, `GM`, `TM`, `SURVEYOR`

### 6. GET `/api/v1/checklist-templates/job/:jobId`
> **Access:** `SURVEYOR`, `ADMIN`, `GM`, `TM`, `TO`  
> Get the applicable template for a specific job.

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ISM Safety Audit Checklist",
    "code": "ISM-CHK-001",
    "sections": [
      {
        "title": "Fire Safety",
        "items": [
          { "code": "FS-001", "text": "Fire extinguishers inspected?", "type": "YES_NO_NA" }
        ]
      }
    ]
  },
  "message": "Use this template to fill out the checklist for this job"
}
```

### 7. PUT `/api/v1/checklist-templates/:id`
> **Access:** `ADMIN` only  
> Same body as create, all fields optional.

### 8. PUT `/api/v1/checklist-templates/:id/activate`
> **Access:** `ADMIN` only  
> Activate a draft/inactive template.

#### Response `200 OK`
```json
{ "success": true, "message": "Checklist template activated successfully", "data": { "id": "uuid", "status": "ACTIVE" } }
```

### 9. POST `/api/v1/checklist-templates/:id/clone`
> **Access:** `ADMIN` only  
> Clone a template.

#### Response `200 OK`
```json
{ "success": true, "message": "Checklist template cloned successfully", "data": { "id": "new-uuid", "name": "ISM Safety Audit Checklist (Copy)", "status": "DRAFT" } }
```

### 10. DELETE `/api/v1/checklist-templates/:id`
> **Access:** `ADMIN` only

#### Response `200 OK`
```json
{ "success": true, "message": "Template deleted successfully" }
```
