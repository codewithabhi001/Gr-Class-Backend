# Fully Detailed API Documentation: CLIENT Role

> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **CLIENT** role.

## 🚀 Activity Requests

---

### POST `/api/v1/activity-requests`
**Summary:** Create activity request

#### Request Body
**Content-Type:** `application/json`

```json
{
  "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "activity_type": "string",
  "requested_service": "Annual Survey",
  "priority": "string",
  "description": "string",
  "location_port": "Port of Singapore",
  "proposed_date": "2026-05-15",
  "attachments": [
    "string"
  ]
}
```

#### Responses
<details><summary><strong>201</strong> - Request created</summary>

```json
{
  "success": true,
  "data": null
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/activity-requests`
**Summary:** Get activity requests (List)
**Description:** Returns a list of activity requests with minimal details.

#### Parameters
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 
- **status** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of requests</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "request_number": "string",
      "activity_type": "string",
      "requested_service": "string",
      "proposed_date": "string",
      "status": "string",
      "Vessel": {
        "id": "...",
        "vessel_name": "...",
        "imo_number": "...",
        "flag_administration_id": "...",
        "ship_type": "...",
        "class_status": "..."
      },
      "created_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/activity-requests/{id}`
**Summary:** Get request by ID (Detailed)
**Description:** Returns full details of an activity request including associations.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Request details</summary>

```json
{
  "success": true,
  "data": null
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Auth

---

### POST `/api/v1/auth/login`
**Summary:** Login
**Description:** Authenticate with email and password. Returns user, **accessToken** (short-lived, for API calls), and **refreshToken** (long-lived, for getting new access tokens).
Use **accessToken** in header: `Authorization: Bearer &lt;accessToken&gt;`. Store tokens securely.


**Note:** Default credentials for **CLIENT** have been pre-filled for testing.

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
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "profile_pic_url": "string",
    "force_password_reset": true,
    "last_login_at": "2026-03-07T12:00:00Z"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Invalid credentials</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "profile_pic_url": "string",
    "force_password_reset": true,
    "last_login_at": "2026-03-07T12:00:00Z"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/auth/change-password`
**Summary:** Change password
**Description:** Change password for currently logged-in user.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Password changed successfully</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>400</strong> - Validation error</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Certificates

---

### GET `/api/v1/certificates`
**Summary:** List certificates
**Description:** List certificates with strict RBAC and ownership filtering.
**Access:**
- **ADMIN / GM / TM / TO:** All certificates.
- **SURVEYOR:** Only certificates for vessels in jobs assigned to them.
- **CLIENT:** Only certificates for their own company vessels.


#### Parameters
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of certificates</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_number": "string",
      "issue_date": "string",
      "expiry_date": "string",
      "status": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "Vessel": {
        "id": "...",
        "vessel_name": "string",
        "imo_number": "string"
      },
      "CertificateType": {
        "id": "...",
        "name": "string"
      }
    }
  ]
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/certificates/types`
**Summary:** List certificate types (minimal)
**Description:** Returns a lightweight list of all active certificate types.
**Does NOT include `required_documents`** — use `GET /types/:id` to fetch
the full detail with required documents for a specific type.

Pass `?include_inactive=true` (ADMIN / GM only) to also see inactive types.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **include_inactive** (`query` | `boolean` | *Optional*): Include INACTIVE types (ADMIN / GM only)

#### Responses
<details><summary><strong>200</strong> - Minimal list of certificate types</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Class Certificate",
      "issuing_authority": "string",
      "validity_years": 5,
      "status": "string",
      "requires_survey": true
    }
  ]
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/certificates/types/{id}`
**Summary:** Get certificate type detail (with required documents)
**Description:** Returns the **full detail** of a single certificate type, including:
- All metadata fields (`description`, `requires_survey`, etc.)
- The complete list of `required_documents` with their `is_mandatory` flag

This is the endpoint to call **before creating a job** to know which
documents must be uploaded.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): Certificate type UUID

#### Responses
<details><summary><strong>200</strong> - Certificate type detail with required documents</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "string",
    "short_code": "string",
    "issuing_authority": "string",
    "validity_years": 0,
    "status": "string",
    "description": "string",
    "requires_survey": true,
    "CertificateRequiredDocuments": [
      {
        "id": "...",
        "certificate_type_id": "...",
        "document_name": "...",
        "is_mandatory": "...",
        "created_at": "...",
        "updated_at": "..."
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Certificate type not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/certificates/expiring`
**Summary:** Get expiring certificates
**Description:** Get certificates expiring within a date range. ADMIN, GM, TM, TO, CLIENT.

#### Parameters
- **days** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - Expiring certificates</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_number": "string",
      "issue_date": "string",
      "expiry_date": "string",
      "status": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "Vessel": {
        "id": "...",
        "vessel_name": "string",
        "imo_number": "string"
      },
      "CertificateType": {
        "id": "...",
        "name": "string"
      }
    }
  ]
}
```

</details>

---

### GET `/api/v1/certificates/job/{jobId}`
**Summary:** Get certificate by job ID
**Description:** Get the certificate associated with a specific job ID.
**Access:** Limited by job ownership/assignment.


#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate details</summary>

```json
{
  "success": true,
  "message": "Certificate for job fetched successfully",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_number": "string",
    "issue_date": "string",
    "expiry_date": "string",
    "status": "string",
    "qr_code_url": "string",
    "pdf_file_url": "string",
    "uploaded_file_url": "string",
    "generated_pdf_url": "string",
    "issued_at": "2026-03-07T12:00:00Z",
    "issued_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "CertificateType": {
      "name": "string"
    },
    "Vessel": {
      "vessel_name": "string",
      "imo_number": "string"
    },
    "FlagState": {
      "flag_state_name": "string"
    },
    "Authority": {
      "id": "...",
      "name": "string",
      "code": "string",
      "country": "string",
      "logo_url": "string",
      "status": "string"
    },
    "source_type": "string",
    "version": 0,
    "certificate_term": "string",
    "manual_text": {},
    "remarks": "string"
  }
}
```

</details>

<details><summary><strong>404</strong> - Job not found or certificate not yet generated</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/certificates/vessel/{vesselId}`
**Summary:** Get certificates by vessel
**Description:** Get all certificates for a specific vessel. Scope restricted (SURVEYOR only assigned, CLIENT only owned).

#### Parameters
- **vesselId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Vessel certificates</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "certificate_number": "string",
      "issue_date": "string",
      "expiry_date": "string",
      "status": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "Vessel": {
        "id": "...",
        "vessel_name": "string",
        "imo_number": "string"
      },
      "CertificateType": {
        "id": "...",
        "name": "string"
      }
    }
  ]
}
```

</details>

---

### GET `/api/v1/certificates/{id}`
**Summary:** Get certificate by ID
**Description:** Get certificate details by ID. Same RBAC as list: ADMIN/GM/TM/TO see all; SURVEYOR only assigned jobs' vessels; CLIENT only own company. Returns 403 if certificate exists but user has no access.


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate details</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_number": "string",
    "issue_date": "string",
    "expiry_date": "string",
    "status": "string",
    "qr_code_url": "string",
    "pdf_file_url": "string",
    "uploaded_file_url": "string",
    "generated_pdf_url": "string",
    "issued_at": "2026-03-07T12:00:00Z",
    "issued_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "CertificateType": {
      "name": "string"
    },
    "Vessel": {
      "vessel_name": "string",
      "imo_number": "string"
    },
    "FlagState": {
      "flag_state_name": "string"
    },
    "Authority": {
      "id": "...",
      "name": "string",
      "code": "string",
      "country": "string",
      "logo_url": "string",
      "status": "string"
    },
    "source_type": "string",
    "version": 0,
    "certificate_term": "string",
    "manual_text": {},
    "remarks": "string"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden - certificate exists but user has no access</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Certificate not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/certificates/{id}/download`
**Summary:** Download certificate PDF
**Description:** Redirects to the certificate PDF URL for download. If the certificate has a stored PDF (pdf_file_url), returns 302 redirect to that URL so the browser can open or download the file.
CLIENT can only download certificates for their vessels.


#### Parameters
- **id** (`path` | `string` | *Required*): Certificate ID

#### Responses
<details><summary><strong>200</strong> - Successful download (in case of direct file stream rather than redirect)</summary>

*No content body returned.*

</details>

<details><summary><strong>302</strong> - Redirect to certificate PDF URL</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>404</strong> - Certificate not found or PDF not available</summary>

```json
{
  "success": false,
  "message": "Certificate PDF is not available for download yet."
}
```

</details>

---

### GET `/api/v1/certificates/{id}/preview`
**Summary:** Preview certificate
**Description:** Get certificate preview/PDF. ADMIN, GM, TM, TO, SURVEYOR, CLIENT.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate preview</summary>

```json
{
  "success": true,
  "data": {}
}
```

</details>

---

### GET `/api/v1/certificates/{id}/signature`
**Summary:** Get certificate signature
**Description:** Get signature details for a certificate.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Signature details</summary>

```json
{}
```

</details>

---

### GET `/api/v1/certificates/{id}/history`
**Summary:** Get certificate history
**Description:** Get certificate change history.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate history</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "status": "string",
      "changed_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "change_reason": "string",
      "changed_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

---

## 🚀 Change Requests

---

### POST `/api/v1/change-requests`
**Summary:** Create change request

#### Request Body
**Content-Type:** `application/json`

```json
{
  "entity_type": "string",
  "entity_id": "123e4567-e89b-12d3-a456-426614174000",
  "change_type": "string",
  "description": "string",
  "requested_changes": {}
}
```

#### Responses
<details><summary><strong>201</strong> - Change request created</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Clients

---

### GET `/api/v1/clients/profile`
**Summary:** Get client profile
**Description:** Get current user's client profile. CLIENT role only.

#### Responses
<details><summary><strong>200</strong> - Client profile</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "company_name": "string",
    "company_code": "string",
    "email": "string",
    "address": "string",
    "country": "string",
    "phone": "string",
    "contact_person_name": "string",
    "contact_person_email": "string",
    "status": "string",
    "has_user": true,
    "created_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/clients/profile`
**Summary:** Update client profile
**Description:** Update current user's client profile. CLIENT role only.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "company_name": "string",
  "contact_person_name": "string",
  "contact_person_email": "string",
  "phone": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Profile updated</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "company_name": "string",
    "company_code": "string",
    "email": "string",
    "address": "string",
    "country": "string",
    "phone": "string",
    "contact_person_name": "string",
    "contact_person_email": "string",
    "status": "string",
    "has_user": true,
    "created_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

---

### GET `/api/v1/clients/profile/documents`
**Summary:** Get client profile documents
**Description:** Get all documents related to the current client (Vessels, Jobs, Surveys, Profile). CLIENT role only.

#### Responses
<details><summary><strong>200</strong> - List of documents</summary>

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_type": "JOB",
      "entity_id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_name": "string",
      "document_type": "string",
      "signedUrl": "string",
      "fileName": "string",
      "expiresAt": "2026-03-07T12:00:00Z",
      "uploaded_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

---

### GET `/api/v1/clients/dashboard`
**Summary:** Get client dashboard
**Description:** Get dashboard for client users. CLIENT role only.

#### Responses
<details><summary><strong>200</strong> - Client dashboard data</summary>

```json
{
  "success": true,
  "data": {}
}
```

</details>

---

## 🚀 Compliance

---

### GET `/api/v1/compliance/export/{id}`
**Summary:** Export data

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Export data</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Documents

---

### GET `/api/v1/documents/get-upload-url`
**Summary:** Generate a pre-signed URL for direct S3 upload
**Description:** Returns a temporary S3 URL where the client can PUT the file binary, and a fileKey to be used for registration.

#### Parameters
- **fileName** (`query` | `string` | *Required*): 
- **fileType** (`query` | `string` | *Required*): MIME type of the file
- **folder** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - Pre-signed URL generated</summary>

```json
{
  "success": true,
  "data": {
    "uploadUrl": "string",
    "fileKey": "string"
  }
}
```

</details>

---

### POST `/api/v1/documents/upload`
**Summary:** Upload a standalone document file (Multipart)
**Description:** Standard way to upload a file through the backend server. Use Pre-signed URL for better performance.

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `file` (Required): `FILE` 
- `folder` (Optional): `string` - Optional folder name for grouping (e.g. 'vessels', 'user-docs')

```json
{
  "file": "<FILE_UPLOAD>",
  "folder": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - File uploaded successfully</summary>

```json
{
  "success": true,
  "data": {
    "file_url": "https://bucket.s3.amazonaws.com/temp/my-file.pdf"
  }
}
```

</details>

<details><summary><strong>400</strong> - No file provided</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/register`
**Summary:** Register an already uploaded S3 file (Standalone)
**Description:** Use this after direct-to-S3 upload to register the file in the backend.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileKey": "string",
  "fileType": "string",
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Registered</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/{entityType}/{entityId}/register`
**Summary:** Register an already uploaded S3 file for a specific entity
**Description:** Similar to direct upload but uses JSON registration.

#### Parameters
- **entityType** (`path` | `string` | *Required*): 
- **entityId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileData": {
    "url": "string",
    "type": "string"
  },
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Registered</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/documents/{entityType}/{entityId}`
**Summary:** Get documents

#### Parameters
- **entityType** (`path` | `string` | *Required*): The type of entity (e.g., VESSEL, JOB, CERTIFICATE, USER, SURVEY)
- **entityId** (`path` | `string` | *Required*): The UUID of the specific entity

#### Responses
<details><summary><strong>200</strong> - List of documents retrieved successfully</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_type": "string",
      "entity_id": "123e4567-e89b-12d3-a456-426614174000",
      "file_url": "string",
      "uploaded_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/documents/{entityType}/{entityId}`
**Summary:** Upload document

#### Parameters
- **entityType** (`path` | `string` | *Required*): The type of entity to attach the document to (e.g., VESSEL, JOB, CERTIFICATE, USER, SURVEY)
- **entityId** (`path` | `string` | *Required*): The UUID of the specific entity

#### Request Body
**Content-Type:** `application/json`

```json
{
  "fileData": {
    "url": "string",
    "type": "string"
  },
  "document_type": "string",
  "description": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `files` (Required): `array` 
- `document_type` (Optional): `string` - Type of document (e.g., EVIDENCE, REPORT)
- `description` (Optional): `string` - Optional description of the document

```json
{
  "files": [
    "<FILE_UPLOAD>"
  ],
  "document_type": "string",
  "description": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Documents uploaded successfully</summary>

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "file_url": "string",
      "document_type": "string",
      "description": "string"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/documents/{id}`
**Summary:** Get document by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Document retrieved successfully</summary>

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "entity_type": "string",
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "file_url": "string",
    "uploaded_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Document not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Feedback

---

### POST `/api/v1/customer-feedback`
**Summary:** Submit feedback

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 0,
  "comment": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Feedback submitted</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/customer-feedback/job/{jobId}`
**Summary:** Get feedback for job

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Job feedback</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/portfolio-feedback`
**Summary:** Submit/Update portfolio feedback (Client view)
**Description:** Creates a new feedback or updates the existing one for the logged-in client.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "comment": "string",
  "rating": 0,
  "designation": "string",
  "company": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Feedback submitted</summary>

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "client_id": "123e4567-e89b-12d3-a456-426614174000",
  "comment": "string",
  "rating": 0,
  "designation": "string",
  "company": "string",
  "created_at": "2026-03-07T12:00:00Z",
  "updated_at": "2026-03-07T12:00:00Z",
  "Client": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "string",
    "email": "string",
    "profile_pic_url": "string"
  }
}
```

</details>

---

### GET `/api/v1/portfolio-feedback/my-feedback`
**Summary:** Get own portfolio feedback (Client view)
**Description:** Returns the feedback submitted by the logged-in client.

#### Responses
<details><summary><strong>200</strong> - Client feedback</summary>

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "client_id": "123e4567-e89b-12d3-a456-426614174000",
  "comment": "string",
  "rating": 0,
  "designation": "string",
  "company": "string",
  "created_at": "2026-03-07T12:00:00Z",
  "updated_at": "2026-03-07T12:00:00Z",
  "Client": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "string",
    "email": "string",
    "profile_pic_url": "string"
  }
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

## 🚀 Incidents

---

### POST `/api/v1/incidents`
**Summary:** Report incident

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "vessel_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "string",
  "description": "string",
  "severity": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Incident reported</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/incidents`
**Summary:** Get incidents

#### Responses
<details><summary><strong>200</strong> - List of incidents</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/incidents/{id}`
**Summary:** Get incident by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Incident details</summary>

```json
{
  "success": true,
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
- **ADMIN / GM / TM / TO** – All jobs; defaults to last 30 days
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
<details><summary><strong>200</strong> - List of jobs</summary>

```json
{
  "success": true,
  "data": {
    "total": 48,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "jobs": [
      {
        "id": "...",
        "job_status": "string",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "target_port": "string",
        "target_date": "string",
        "priority": "string",
        "createdAt": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
        },
        "survey": {
          "id": "...",
          "survey_status": "..."
        },
        "payment_status": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden – role not allowed</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/jobs`
**Summary:** Create job request
**Description:** Opens a new certification job request in **CREATED** status.
- **CLIENT** – Can only submit for vessels that belong to their account.
- **ADMIN / GM** – Can submit for any vessel.

If the selected `certificate_type_id` has mandatory required documents
(`CertificateRequiredDocument` where `is_mandatory=true`), each must be
included in `uploaded_documents`; otherwise the request will be rejected
with a `400` listing the missing documents.


#### Request Body
**Content-Type:** `application/json`

```json
{
  "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "reason": "Annual survey due",
  "target_port": "Singapore",
  "target_date": "2026-03-15",
  "remarks": "string",
  "uploaded_documents": [
    {
      "required_document_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "file_url": "string"
    }
  ]
}
```

#### Responses
<details><summary><strong>201</strong> - Job created successfully (status = CREATED)</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "requested_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "job_status": "string",
    "priority": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "is_survey_required": true,
    "reschedule_count": 0,
    "payment_status": "UNPAID",
    "certificate_url": "string",
    "certificate_number": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo",
      "class_status": "string"
    },
    "CertificateType": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "issuing_authority": "string"
    },
    "survey": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "survey_status": "string",
      "survey_statement_status": "string",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z"
    },
    "Payments": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
      }
    ],
    "requester": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "surveyor": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string"
    },
    "approver": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>400</strong> - Validation error or missing mandatory documents</summary>

```json
{
  "success": false,
  "message": "Missing mandatory documents for job creation.",
  "missing_documents": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string"
    }
  ]
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/jobs/{id}`
**Summary:** Get job details
**Description:** Returns full job detail including vessel, certificate type, status history,
uploaded documents, reschedule records, and certificate (with signed URL if
applicable).
- **CLIENT** – Own fleet only.
- **SURVEYOR** – Only if assigned to them.
- **ADMIN / GM / TM / TO** – Any job.


#### Parameters
- **id** (`path` | `string` | *Required*): Job UUID

#### Responses
<details><summary><strong>200</strong> - Job details</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "requested_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "job_status": "string",
    "priority": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "is_survey_required": true,
    "reschedule_count": 0,
    "payment_status": "UNPAID",
    "certificate_url": "string",
    "certificate_number": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo",
      "class_status": "string"
    },
    "CertificateType": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "issuing_authority": "string"
    },
    "survey": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "survey_status": "string",
      "survey_statement_status": "string",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z"
    },
    "Payments": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
      }
    ],
    "requester": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "surveyor": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string"
    },
    "approver": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### PUT `/api/v1/jobs/{id}/cancel`
**Summary:** CLIENT/GM/TM/ADMIN: Cancel job → REJECTED (terminal)
**Description:** Cancels the job. Maps internally to the `REJECTED` terminal state.

- **CLIENT** – Must own the vessel; cannot cancel once `FINALIZED`,
  `CERTIFIED`, or `REJECTED`.
- **GM / TM / ADMIN** – Any non-terminal job.

**Roles:** CLIENT, GM, TM, ADMIN


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "reason": "No longer required."
}
```

#### Responses
<details><summary><strong>200</strong> - Job cancelled. Status → REJECTED.</summary>

```json
{
  "success": true,
  "message": "Job cancelled.",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "requested_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "job_status": "string",
    "priority": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "is_survey_required": true,
    "reschedule_count": 0,
    "payment_status": "UNPAID",
    "certificate_url": "string",
    "certificate_number": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo",
      "class_status": "string"
    },
    "CertificateType": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "issuing_authority": "string"
    },
    "survey": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "survey_status": "string",
      "survey_statement_status": "string",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z"
    },
    "Payments": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
      }
    ],
    "requester": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "surveyor": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "email": "string"
    },
    "approver": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>400</strong> - Job already in terminal state</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden – CLIENT trying to cancel a job for a vessel they don't own</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/jobs/{id}/messages/external`
**Summary:** Get external (client-visible) messages
**Description:** Returns the external message thread for a job — visible to CLIENT,
staff, and the assigned SURVEYOR.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - External message thread</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "sender_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "message_text": "string",
      "is_internal": true,
      "attachment_url": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "Sender": {
        "name": "string",
        "role": "string"
      }
    }
  ]
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### POST `/api/v1/jobs/{id}/messages`
**Summary:** Send message (with optional attachment)
**Description:** Posts a new message to the job thread. Supports text-only or multipart
with a file attachment.

**Roles:** CLIENT, ADMIN, GM, TM, TO, SURVEYOR


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "content": "Vessel is ready for inspection.",
  "attachmentKey": "string"
}
```

#### Request Body (File Upload)
**Content-Type:** `multipart/form-data`

> **Note for Frontend:** Use `FormData` object in JS. Append fields normally. For files, use `formData.append('fieldName', fileObject)`.

**Form Fields:**
- `content` (Optional): `string` - Message text
- `attachment` (Optional): `FILE` - Optional file attachment

```json
{
  "content": "Please review the updated checklist attached.",
  "attachment": "<FILE_UPLOAD>"
}
```

#### Responses
<details><summary><strong>201</strong> - Message sent successfully.</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "sender_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "message_text": "string",
    "is_internal": true,
    "attachment_url": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "Sender": {
      "name": "string",
      "role": "string"
    }
  }
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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

### GET `/api/v1/payments`
**Summary:** List payments
**Description:** List payments. CLIENT sees only their payments.

#### Parameters
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of payments</summary>

```json
{
  "success": true,
  "data": {
    "count": 0,
    "rows": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/payments/summary`
**Summary:** Financial summary
**Description:** Get financial summary. CLIENT, ADMIN, GM only.

#### Responses
<details><summary><strong>200</strong> - Financial summary</summary>

```json
{
  "success": true,
  "data": {
    "total_outstanding": 0,
    "total_paid": 0,
    "total_invoiced": 0,
    "payments": [
      {
        "id": "...",
        "job_id": "...",
        "invoice_number": "...",
        "amount": "...",
        "currency": "...",
        "payment_status": "...",
        "payment_date": "...",
        "receipt_url": "...",
        "verified_by_user_id": "...",
        "refunded_amount": "...",
        "amount_paid": "...",
        "net_amount": "...",
        "created_at": "...",
        "updated_at": "...",
        "JobRequest": "..."
      }
    ]
  }
}
```

</details>

---

### GET `/api/v1/payments/{id}`
**Summary:** Get payment by ID
**Description:** Get payment details by ID.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Payment details</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "invoice_number": "string",
    "amount": 0,
    "currency": "string",
    "payment_status": "string",
    "payment_date": "2026-03-07T12:00:00Z",
    "receipt_url": "string",
    "verified_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "refunded_amount": "string",
    "amount_paid": "string",
    "net_amount": "string",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "JobRequest": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "job_status": "string",
      "Vessel": {
        "vessel_name": "string"
      }
    }
  }
}
```

</details>

<details><summary><strong>404</strong> - Payment not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
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
        "ship_type": "Cargo",
        "class_status": "string"
      }
    ],
    "jobs": [
      {
        "id": "...",
        "job_status": "string",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "target_port": "string",
        "target_date": "string",
        "priority": "string",
        "createdAt": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
        },
        "survey": {
          "id": "...",
          "survey_status": "..."
        },
        "payment_status": "string"
      }
    ],
    "certificates": [
      {
        "id": "...",
        "vessel_id": "...",
        "certificate_type_id": "...",
        "certificate_number": "string",
        "issue_date": "string",
        "expiry_date": "string",
        "status": "string",
        "created_at": "2026-03-07T12:00:00Z",
        "Vessel": {
          "id": "...",
          "vessel_name": "...",
          "imo_number": "..."
        },
        "CertificateType": {
          "id": "...",
          "name": "..."
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

<details><summary><strong>401</strong> - Unauthorized</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

## 🚀 Vessels

---

### GET `/api/v1/vessels`
**Summary:** List vessels
**Description:** List all vessels. CLIENT sees only their vessels.

#### Parameters
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of vessels</summary>

```json
{
  "success": true,
  "data": {
    "count": 1,
    "rows": [
      {
        "company": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "string",
          "code": "string",
          "status": "string"
        },
        "vessels": [
          "..."
        ]
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
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

### GET `/api/v1/vessels/{id}`
**Summary:** Get vessel by ID
**Description:** Get vessel details by ID.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Vessel details</summary>

```json
{
  "success": true,
  "data": {
    "id": "019ccbf7-f67a-7443-bd21-17f16ef06cbb",
    "client_id": "019c79a4-3ab9-7055-a1a7-9d7332fb025e",
    "flag_administration_id": "019cbf1d-b478-704f-a4af-7462034a800e",
    "vessel_name": "MT Blue Horizon",
    "imo_number": "9876506",
    "call_sign": "D5IJ6",
    "mmsi_number": "538007106",
    "port_of_registry": "Majuro",
    "year_built": 2021,
    "ship_type": "Oil Tanker",
    "gross_tonnage": "82300.25",
    "net_tonnage": "44100.00",
    "deadweight": "158000.00",
    "class_status": "ACTIVE",
    "current_class_society": "DNV",
    "engine_type": "MAN B&W 7G80ME-C",
    "builder_name": "Hyundai Samho Heavy Industries",
    "createdAt": "2026-03-05T17:48:51.000Z",
    "updatedAt": "2026-03-05T17:48:51.000Z",
    "Client": {
      "id": "019c79a4-3ab9-7055-a1a7-9d7332fb025e",
      "company_name": "Pacific Maritime Corp",
      "company_code": "PMC001",
      "email": "ops@pacificmaritime.com",
      "status": "INACTIVE"
    },
    "FlagAdministration": {
      "flag_state_name": "Marshall Islands Maritime Administrator"
    }
  }
}
```

</details>

<details><summary><strong>404</strong> - Vessel not found</summary>

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "errors": {},
  "trace_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "stack": "string"
}
```

</details>

---

