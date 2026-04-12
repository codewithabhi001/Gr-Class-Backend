# Fully Detailed API Documentation: TA Role

> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **TA** role.

## 🚀 Auth

---

### POST `/api/v1/auth/login`
**Summary:** Login
**Description:** Authenticate with email and password. Returns user, **accessToken** (short-lived, for API calls), and **refreshToken** (long-lived, for getting new access tokens).
Use **accessToken** in header: `Authorization: Bearer &lt;accessToken&gt;`. Store tokens securely.


#### Request Body
**Content-Type:** `application/json`

```json
{
  "email": "admin@grclass.com",
  "password": "SecurePass123!"
}
```

#### Responses
<details><summary><strong>200</strong> - Login successful</summary>

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "John Doe",
    "email": "admin@grclass.com",
    "role": "CLIENT",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>401</strong> - Invalid credentials</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### POST `/api/v1/auth/logout`
**Summary:** Logout
**Description:** Invalidate current session. Clears tokens; response includes accessToken and refreshToken as null.

#### Responses
<details><summary><strong>200</strong> - Logged out successfully</summary>

```json
{
  "message": "Logged out successfully",
  "accessToken": "string",
  "refreshToken": "string"
}
```

</details>

<details><summary><strong>401</strong> - Not authenticated</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### POST `/api/v1/auth/refresh-token`
**Summary:** Refresh token
**Description:** Get new **accessToken** and **refreshToken** using a valid refresh token. Send refresh token in body (`refreshToken` or `token`) or in cookie. Response returns both tokens.


#### Request Body
**Content-Type:** `application/json`

```json
{
  "refreshToken": "string",
  "token": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Tokens refreshed</summary>

```json
{
  "user": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "John Doe",
    "email": "admin@grclass.com",
    "role": "CLIENT",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

</details>

<details><summary><strong>401</strong> - Invalid or expired refresh token</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### POST `/api/v1/auth/forgot-password`
**Summary:** Forgot password
**Description:** Request password reset email.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "email": "user@grclass.com"
}
```

#### Responses
<details><summary><strong>200</strong> - Password reset email sent</summary>

```json
{
  "message": "Password reset email sent"
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### POST `/api/v1/auth/reset-password`
**Summary:** Reset password
**Description:** Reset password using token from email.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "token": "string",
  "newPassword": "SecurePass123"
}
```

#### Responses
<details><summary><strong>200</strong> - Password reset successfully</summary>

```json
{
  "message": "Password reset successfully"
}
```

</details>

<details><summary><strong>400</strong> - Invalid or expired token</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Certificates

---

### GET `/api/v1/certificates/verify/{number}`
**Summary:** Verify certificate (public)
**Description:** Public verification of certificate by number. No auth required.

#### Parameters
- **number** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate verified</summary>

```json
{
  "valid": true,
  "certificate": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_number": "GIR-CERT-2026-001234",
    "issue_date": "string",
    "expiry_date": "string",
    "status": "VALID",
    "qr_code_url": "string",
    "pdf_file_url": "string",
    "CertificateType": {
      "name": "Safety Construction"
    },
    "Vessel": {
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456"
    }
  }
}
```

</details>

<details><summary><strong>404</strong> - Certificate not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Contact

---

### POST `/api/v1/contact`
**Summary:** Submit a contact enquiry (public)
**Description:** Anyone visiting the GR-Class Shipping portfolio website can send a message via this endpoint. No authentication is required.


#### Request Body
**Content-Type:** `application/json`

```json
{
  "full_name": "John Maritime",
  "company": "Pacific Shipping Co. Ltd",
  "corporate_email": "john@pacificshipping.com",
  "message": "We are interested in classification services for our fleet of 5 vessels.",
  "phone": "+91 98765 43210",
  "subject": "Fleet Classification Inquiry",
  "source_page": "CONTACT"
}
```

#### Responses
<details><summary><strong>201</strong> - Enquiry submitted successfully</summary>

```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you shortly.",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "string",
    "created_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Dashboard

---

### GET `/api/v1/dashboard`
**Summary:** Get dashboard
**Description:** Get role-specific dashboard data. Structure varies by user role:
- ADMIN: System-wide stats, pending approvals
- GM: Management dashboard
- TM: Technical manager view
- TO: Technical officer view
- SURVEYOR: Assigned jobs, availability
- CLIENT: Vessel/job overview


#### Responses
<details><summary><strong>200</strong> - Dashboard data</summary>

```json
{
  "success": true,
  "data": {
    "stats": {},
    "recentJobs": [
      null
    ],
    "expiringCertificates": [
      null
    ],
    "alerts": [
      {
        "type": "string",
        "message": "string"
      }
    ]
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Health

---

### GET `/api/v1/health`
**Summary:** Health check
**Description:** Returns server health status. No authentication required.

#### Responses
<details><summary><strong>200</strong> - Server is healthy</summary>

```json
{
  "status": "UP",
  "timestamp": "2026-03-07T12:00:00Z"
}
```

</details>

---

## 🚀 Jobs

---

### GET `/api/v1/jobs`
**Summary:** List jobs (role-filtered)
**Description:** Returns a paginated list of job requests. Visible set depends on caller role:
- **CLIENT** – Only jobs for their fleet (vessel_id filtered to client).
- **SURVEYOR** – Only jobs assigned to them (`assigned_surveyor_id = me`).
- **ADMIN / GM / TM / TO / TA / FLAG_ADMIN** – All jobs; defaults to last 30 days
  unless explicit filters are supplied.

Supply `status` as a **comma-separated** string to filter by multiple statuses,
e.g. `?status=ASSIGNED,SURVEY_AUTHORIZED`.


#### Parameters
- **page** (`query` | `integer` | *Optional*): Page number (1-indexed)
- **limit** (`query` | `integer` | *Optional*): Records per page
- **status** (`query` | `string` | *Optional*): Filter by status (single value or comma-separated list)
- **vessel_id** (`query` | `string` | *Optional*): 
- **certificate_type_id** (`query` | `string` | *Optional*): 
- **assigned_surveyor_id** (`query` | `string` | *Optional*): 
- **target_port** (`query` | `string` | *Optional*): 
- **created_from** (`query` | `string` | *Optional*): ISO date string – start of creation window
- **created_to** (`query` | `string` | *Optional*): ISO date string – end of creation window
- **recent_days** (`query` | `integer` | *Optional*): (Internal roles only) Shortcut to filter to last N days when no other date
filter is given. Default is 30.


#### Responses
<details><summary><strong>200</strong> - Paginated list of jobs</summary>

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "jobs": [
      {
        "id": "...",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "reason": "string",
        "target_port": "string",
        "target_date": "string",
        "assigned_surveyor_id": "...",
        "assigned_by_user_id": "...",
        "approved_by_user_id": "...",
        "generated_certificate_id": "...",
        "remarks": "string",
        "job_status": "CREATED",
        "survey": {
          "id": "...",
          "survey_status": "...",
          "survey_statement_status": "...",
          "started_at": "...",
          "submitted_at": "...",
          "start_latitude": "...",
          "start_longitude": "...",
          "submit_latitude": "...",
          "submit_longitude": "...",
          "declared_by": "...",
          "declared_at": "...",
          "declaration_hash": "...",
          "SurveyStatusHistories": "..."
        },
        "priority": "string",
        "vessel": "...",
        "certificate_type": {
          "id": "...",
          "name": "..."
        },
        "created_at": "2026-03-07T12:00:00Z",
        "updated_at": "2026-03-07T12:00:00Z"
      }
    ]
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized – missing or invalid token</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden – role not allowed</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Notifications

---

### GET `/api/v1/notifications`
**Summary:** Get notifications

#### Responses
<details><summary><strong>200</strong> - List of notifications retrieved successfully</summary>

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Job Assigned",
    "message": "You have been assigned to survey Sea Star.",
    "type": "JOB_ASSIGNED",
    "is_read": false,
    "created_at": "2026-03-07T12:00:00Z"
  }
]
```

</details>

---

### PUT `/api/v1/notifications/{id}/read`
**Summary:** Mark as read

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Marked as read</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### PUT `/api/v1/notifications/read-all`
**Summary:** Mark all as read

#### Responses
<details><summary><strong>200</strong> - All marked as read</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 Payments

---

### PUT `/api/v1/payments/{id}/pay`
**Summary:** Mark invoice as paid
**Description:** Mark an invoice as paid. ADMIN, GM, TM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "receiptKey": "string",
  "remarks": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `receipt` (Optional): `FILE` 
- `remarks` (Optional): `string` 

```json
{
  "receipt": "<FILE_UPLOAD>",
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Payment marked as paid</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "invoice_number": "INV-2026-001234",
    "amount": 1500,
    "currency": "USD",
    "payment_status": "UNPAID",
    "payment_date": "2026-03-07T12:00:00Z",
    "receipt_url": "string"
  }
}
```

</details>

---

## 🚀 Public

---

### GET `/api/v1/public/certificate/verify/{number}`
**Summary:** Verify certificate (public)
**Description:** Public verification - no auth required

#### Parameters
- **number** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate verification result</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/public/vessel/{imo}`
**Summary:** Verify vessel by IMO (public)
**Description:** Public vessel verification - no auth required

#### Parameters
- **imo** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Vessel verification result</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/public/website/videos`
**Summary:** Get all website videos (Public)
**Description:** Retrieve a list of uploaded videos. This endpoint is public and used by the website frontend.

#### Parameters
- **section** (`query` | `string` | *Optional*): Filter by website section (e.g. HOME, PORTFOLIO)

#### Responses
<details><summary><strong>200</strong> - List of videos</summary>

```json
[
  {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "section": "HOME",
    "title": "Introduction Video",
    "description": "A brief introduction to our services.",
    "video_url": "https://bucket.s3.region.amazonaws.com/website/videos/video.mp4",
    "thumbnail_url": "https://bucket.s3.region.amazonaws.com/website/videos/thumb.jpg",
    "uploaded_by": "01933c5e-user-id",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
]
```

</details>

---

## 🚀 Search

---

### GET `/api/v1/search`
**Summary:** Global search
**Description:** Search across vessels, jobs, and certificates. Results are filtered by user's role and scope.

#### Parameters
- **q** (`query` | `string` | *Required*): Search query string (min 3 chars)
- **type** (`query` | `string` | *Optional*): Filter by specific entity type

#### Responses
<details><summary><strong>200</strong> - Search results</summary>

```json
{
  "success": true,
  "data": {
    "vessels": [
      {
        "id": "...",
        "vessel_name": "Ocean Pioneer",
        "imo_number": "9123456",
        "flag_administration_id": "...",
        "ship_type": "Cargo"
      }
    ],
    "jobs": [
      {
        "id": "...",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "reason": "string",
        "target_port": "string",
        "target_date": "string",
        "assigned_surveyor_id": "...",
        "assigned_by_user_id": "...",
        "approved_by_user_id": "...",
        "generated_certificate_id": "...",
        "remarks": "string",
        "job_status": "CREATED",
        "survey": {
          "id": "...",
          "survey_status": "...",
          "survey_statement_status": "...",
          "started_at": "...",
          "submitted_at": "...",
          "start_latitude": "...",
          "start_longitude": "...",
          "submit_latitude": "...",
          "submit_longitude": "...",
          "declared_by": "...",
          "declared_at": "...",
          "declaration_hash": "...",
          "SurveyStatusHistories": "..."
        },
        "priority": "string",
        "vessel": "...",
        "certificate_type": {
          "id": "...",
          "name": "..."
        },
        "created_at": "2026-03-07T12:00:00Z",
        "updated_at": "2026-03-07T12:00:00Z"
      }
    ],
    "certificates": [
      {
        "id": "...",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "certificate_number": "GIR-CERT-2026-001234",
        "issue_date": "string",
        "expiry_date": "string",
        "status": "VALID",
        "qr_code_url": "string",
        "pdf_file_url": "string",
        "CertificateType": {
          "name": "..."
        },
        "Vessel": {
          "vessel_name": "...",
          "imo_number": "..."
        }
      }
    ]
  }
}
```

</details>

---

## 🚀 Support

---

### POST `/api/v1/support`
**Summary:** Create support ticket

#### Request Body
**Content-Type:** `application/json`

```json
{
  "subject": "string",
  "description": "string",
  "message": "string",
  "priority": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Ticket created</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/support`
**Summary:** Get support tickets

#### Responses
<details><summary><strong>200</strong> - List of tickets</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/support/{id}`
**Summary:** Get ticket by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Ticket details</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 Surveyors

---

### POST `/api/v1/surveyors/apply`
**Summary:** Public surveyor application

#### Request Body
**Content-Type:** `application/json`

```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "nationality": "string",
  "qualification": "string",
  "years_of_experience": 0,
  "cvKey": "string",
  "idProofKey": "string",
  "certificateKeys": [
    "string"
  ]
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `full_name` (Required): `string` 
- `email` (Required): `string` 
- `phone` (Required): `string` 
- `nationality` (Required): `string` 
- `qualification` (Required): `string` 
- `years_of_experience` (Required): `integer` 
- `cv` (Optional): `FILE` 
- `id_proof` (Optional): `FILE` 
- `certificates` (Optional): `array` 

```json
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "nationality": "string",
  "qualification": "string",
  "years_of_experience": 0,
  "cv": "<FILE_UPLOAD>",
  "id_proof": "<FILE_UPLOAD>",
  "certificates": [
    "<FILE_UPLOAD>"
  ]
}
```

#### Responses
<details><summary><strong>201</strong> - Application submitted</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 System

---

### GET `/api/v1/system/health`
**Summary:** Get system health

#### Responses
<details><summary><strong>200</strong> - Health status</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/system/readiness`
**Summary:** Get system readiness

#### Responses
<details><summary><strong>200</strong> - Readiness status</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

### GET `/api/v1/system/version`
**Summary:** Get system version

#### Responses
<details><summary><strong>200</strong> - Version info</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

---

## 🚀 Users

---

### GET `/api/v1/users/me`
**Summary:** Get current user profile

#### Responses
<details><summary><strong>200</strong> - Current user profile</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/users/fcm-token`
**Summary:** Update FCM device token for push notifications
**Description:** Registers or updates the Firebase Cloud Messaging (FCM) token for the currently authenticated user.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fcmToken": "fXz1A2B3C4D5E6F7G8H9I0J..."
}
```

#### Responses
<details><summary><strong>200</strong> - FCM token updated successfully</summary>

```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

</details>

<details><summary><strong>400</strong> - Invalid token provided</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/users/profile-pic`
**Summary:** Update profile picture
**Description:** Upload a new profile picture (multipart) or provide a pre-signed S3 key (JSON).

#### Request Body
**Content-Type:** `application/json`

```json
{
  "profilePicKey": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `profile_pic` (Optional): `FILE` 

```json
{
  "profile_pic": "<FILE_UPLOAD>"
}
```

#### Responses
<details><summary><strong>200</strong> - Profile picture updated</summary>

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

