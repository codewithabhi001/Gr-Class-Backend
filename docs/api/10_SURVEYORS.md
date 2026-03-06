# 10 — Surveyor Management APIs

**Base URL:** `/api/v1/surveyors`  
**Auth:** Noted per endpoint

---

## 1. POST `/api/v1/surveyors/apply`

> **Access:** Public (rate limited: 5 per hour)  
> Submit a surveyor application.  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | ✅ | Full name |
| `email` | string | ✅ | Valid email |
| `phone` | string | ✅ | Phone number |
| `nationality` | string | ✅ | — |
| `qualification` | string | ✅ | e.g. "Chief Engineer" |
| `years_of_experience` | number | ✅ | — |
| `cv` | file | optional | PDF or image |
| `id_proof` | file | optional | — |
| `certificates` | file(s) | optional | Max 5 files |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Surveyor application submitted successfully",
  "data": {
    "id": "uuid",
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "+971501234567",
    "nationality": "UK",
    "qualification": "Chief Engineer",
    "years_of_experience": 15,
    "status": "PENDING",
    "cv_url": "https://storage.girik.com/applications/cv.pdf",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. POST `/api/v1/surveyors`

> **Access:** `ADMIN`, `TM`  
> Create a surveyor directly (bypasses application process).

### Request Body
```json
{
  "name": "John Surveyor",
  "email": "john@girik.com",
  "password": "Secure@123",
  "phone": "+971501234567",
  "nationality": "UK",
  "qualifications": "Master Mariner, Class 1 Certificate"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `email` | string | ✅ | Valid email, unique |
| `password` | string | ✅ | Min 8, uppercase+lowercase+digit |
| `phone` | string | optional | — |
| `nationality` | string | optional | — |
| `qualifications` | string | optional | — |

### Response `201 Created`
```json
{
  "success": true,
  "message": "Surveyor created successfully",
  "data": {
    "user": { "id": "uuid", "name": "John Surveyor", "email": "john@girik.com", "role": "SURVEYOR" },
    "profile": { "id": "uuid", "nationality": "UK", "qualifications": "Master Mariner..." }
  }
}
```

---

## 3. GET `/api/v1/surveyors/applications`

> **Access:** `ADMIN`, `TM`  
> List all surveyor applications.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | optional | `PENDING`, `APPROVED`, `REJECTED`, `DOCUMENTS_REQUIRED` |
| `page` | number | optional | — |
| `limit` | number | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "rows": [
      {
        "id": "uuid",
        "full_name": "John Smith",
        "email": "john@example.com",
        "phone": "+971501234567",
        "nationality": "UK",
        "qualification": "Chief Engineer",
        "years_of_experience": 15,
        "status": "PENDING",
        "cv_url": "https://...",
        "created_at": "2026-03-05T18:00:00.000Z"
      }
    ],
    "count": 5
  }
}
```

---

## 4. PUT `/api/v1/surveyors/applications/:id/review`

> **Access:** `TM`, `ADMIN`  
> Review (approve/reject) an application.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "APPROVED",
  "remarks": "All credentials verified. Excellent experience."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | `APPROVED`, `REJECTED`, `DOCUMENTS_REQUIRED` |
| `remarks` | string | optional | — |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "remarks": "All credentials verified."
  }
}
```

---

## 5. GET `/api/v1/surveyors/:id/profile`

> **Access:** `ADMIN`, `TM`, `SURVEYOR`  
> SURVEYOR can only get own profile.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "nationality": "UK",
    "qualifications": "Master Mariner, Class 1 Certificate",
    "is_available": true,
    "last_known_latitude": 25.2048,
    "last_known_longitude": 55.2708,
    "User": {
      "id": "uuid",
      "name": "John Surveyor",
      "email": "john@girik.com",
      "role": "SURVEYOR",
      "status": "ACTIVE"
    }
  }
}
```

---

## 6. PUT `/api/v1/surveyors/:id/profile`

> **Access:** `ADMIN`, `TM`  
> Update surveyor profile.

### Request Body
```json
{
  "nationality": "UAE",
  "qualifications": "Updated qualifications...",
  "is_available": false
}
```

### Response `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "id": "uuid", "nationality": "UAE", "qualifications": "Updated..." }
}
```

---

## 7. POST `/api/v1/surveyors/availability`

> **Access:** `SURVEYOR` only  
> Update own availability status.

### Request Body
```json
{
  "is_available": true
}
```

| Field | Type | Required |
|-------|------|----------|
| `is_available` | boolean | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "id": "uuid", "is_available": true }
}
```

---

## 8. POST `/api/v1/surveyors/location`

> **Access:** `SURVEYOR` only  
> Report current GPS location.

### Request Body
```json
{
  "latitude": 25.2048,
  "longitude": 55.2708
}
```

| Field | Type | Required |
|-------|------|----------|
| `latitude` | number | ✅ |
| `longitude` | number | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "recorded_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 9. GET `/api/v1/surveyors/:id/location-history`

> **Access:** `ADMIN`, `TM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "latitude": 25.2048,
      "longitude": 55.2708,
      "recorded_at": "2026-03-05T18:00:00.000Z"
    },
    {
      "latitude": 25.2050,
      "longitude": 55.2710,
      "recorded_at": "2026-03-05T19:00:00.000Z"
    }
  ]
}
```
