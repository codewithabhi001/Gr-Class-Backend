# PUBLIC APIs (No Authentication Required)

---

## 1. POST `/api/v1/auth/login`
**Rate Limited:** 10 req / 15 min

### Request
```json
{ "email": "admin@grclass.com", "password": "Admin@123" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email |
| `password` | string | ✅ | — |

### Response `200`
```json
{
  "user": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "name": "Admin User",
    "email": "admin@grclass.com",
    "role": "ADMIN",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": null,
    "force_password_reset": false,
    "last_login_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
### Error `401`
```json
{ "success": false, "message": "Invalid email or password" }
```
### Error `429`
```json
{ "success": false, "message": "Too many attempts, please try again later." }
```

---

## 2. POST `/api/v1/auth/refresh-token`

### Request
```json
{ "refreshToken": "eyJhbGci..." }
```
### Response `200`
```json
{
  "user": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "name": "Admin User",
    "email": "admin@grclass.com",
    "role": "ADMIN",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": null,
    "last_login_at": "2026-03-05T18:00:00.000Z"
  },
  "accessToken": "eyJhbGci...(new)",
  "refreshToken": "eyJhbGci...(new)"
}
```

---

## 3. POST `/api/v1/auth/forgot-password`
**Rate Limited**

### Request
```json
{ "email": "user@grclass.com" }
```
### Response `200`
```json
{ "message": "Password reset email sent" }
```

---

## 4. POST `/api/v1/auth/reset-password`
**Rate Limited**

### Request
```json
{ "token": "reset-token-from-email", "newPassword": "NewSecure@123" }
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | ✅ | From email |
| `newPassword` | string | ✅ | Min 8, uppercase+lowercase+digit |

### Response `200`
```json
{ "message": "Password reset successfully" }
```

---

## 5. GET `/api/v1/public/certificate/verify/:number`
Path: `:number` = e.g. `GR-CLASS-2026-0042`

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000010",
    "certificate_number": "GR-CLASS-2026-0042",
    "vessel_id": "019514a2-7e3b-7000-8000-000000000005",
    "certificate_type_id": "019514a2-7e3b-7000-8000-000000000020",
    "issue_date": "2026-01-15",
    "expiry_date": "2031-01-15",
    "status": "VALID",
    "qr_code_url": "https://storage.grclass.com/qr/GR-CLASS-2026-0042.png",
    "pdf_file_url": "https://storage.grclass.com/certs/GR-CLASS-2026-0042.pdf",
    "issued_by_user_id": "019514a2-7e3b-7000-8000-000000000001",
    "Vessel": {
      "id": "019514a2-7e3b-7000-8000-000000000005",
      "vessel_name": "MV Star",
      "imo_number": "1234567",
      "ship_type": "Bulk Carrier",
      "Client": { "company_name": "ABC Shipping Ltd" }
    },
    "CertificateType": {
      "id": "019514a2-7e3b-7000-8000-000000000020",
      "name": "Safety Management Certificate",
      "issuing_authority": "CLASS"
    }
  }
}
```
### Error `404`
```json
{ "success": false, "message": "Certificate not found" }
```

---

## 6. GET `/api/v1/public/vessel/:imo`
Path: `:imo` = 7-digit IMO number

### Response `200`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000005",
    "vessel_name": "MV Star",
    "imo_number": "1234567",
    "call_sign": "ABCD",
    "mmsi_number": "123456789",
    "port_of_registry": "Dubai",
    "year_built": 2015,
    "ship_type": "Bulk Carrier",
    "gross_tonnage": "50000.00",
    "net_tonnage": "30000.00",
    "deadweight": "85000.00",
    "class_status": "ACTIVE",
    "current_class_society": "Lloyd's Register",
    "engine_type": "MAN B&W 6S60ME-C8.5",
    "builder_name": "Hyundai Heavy Industries",
    "flag_administration_id": "019514a2-7e3b-7000-8000-000000000030",
    "FlagAdministration": { "flag_state_name": "Panama", "country": "PA" },
    "Client": { "company_name": "ABC Shipping Ltd" }
  }
}
```

---

## 7. GET `/api/v1/public/website/videos`
Query: `?section=HOME`

### Response `200`
```json
[
  {
    "id": "019514a2-7e3b-7000-8000-000000000040",
    "section": "HOME",
    "title": "About GR-Class Marine",
    "description": "Introduction to GR-Class Marine certification services",
    "video_url": "https://storage.grclass.com/videos/intro.mp4",
    "thumbnail_url": "https://storage.grclass.com/thumbnails/intro.jpg",
    "uploaded_by": "019514a2-7e3b-7000-8000-000000000001",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

## 8. GET `/api/v1/health`

### Response `200`
```json
{ "status": "UP", "timestamp": "2026-03-05T18:30:00.000Z" }
```

---

## 9. POST `/api/v1/contact`
**Rate Limited**

### Request
```json
{
  "full_name": "John Smith",
  "corporate_email": "john@smithshipping.com",
  "message": "We are interested in your classification services for our fleet.",
  "company": "Smith Shipping Ltd",
  "phone": "+971501234567",
  "subject": "Fleet Classification"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `full_name` | string | ✅ | 2–100 chars |
| `corporate_email` | string | ✅ | Valid email |
| `message` | string | ✅ | 10–5000 chars |
| `company` | string | optional | — |
| `phone` | string | optional | — |
| `subject` | string | optional | — |

### Response `201`
```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you shortly.",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000001300",
    "full_name": "John Smith",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 10. POST `/api/v1/surveyors/apply`
**Rate Limited:** 5/hr | **Content-Type:** `multipart/form-data`

### Request (form-data)
| Field | Type | Required |
|-------|------|----------|
| `full_name` | string | ✅ |
| `email` | string | ✅ |
| `phone` | string | ✅ |
| `nationality` | string | ✅ |
| `qualification` | string | ✅ |
| `years_of_experience` | number | ✅ |
| `cv` | file | optional |
| `id_proof` | file | optional |
| `certificates` | file(s) | optional |

### Response `201`
```json
{
  "success": true,
  "message": "Surveyor application submitted successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000050",
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "+971501234567",
    "nationality": "UK",
    "qualification": "Chief Engineer",
    "years_of_experience": 15,
    "status": "PENDING",
    "cv_url": "https://storage.grclass.com/applications/cv.pdf",
    "created_at": "2026-03-05T18:00:00.000Z"
  }
}
```
