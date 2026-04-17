# Fully Detailed API Documentation: GM Role

> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **GM** role.

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

### PUT `/api/v1/activity-requests/{id}/status`
**Summary:** Update request status

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "status": "string",
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Status updated</summary>

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

## 🚀 Approvals

---

### POST `/api/v1/approvals`
**Summary:** Create approval

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "step": "string",
  "action": "string",
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Approval created</summary>

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

### PUT `/api/v1/approvals/{id}/step`
**Summary:** Update approval step

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "action": "string",
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Step updated</summary>

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

## 🚀 Auth

---

### POST `/api/v1/auth/login`
**Summary:** Login
**Description:** Authenticate with email and password. Returns user, **accessToken** (short-lived, for API calls), and **refreshToken** (long-lived, for getting new access tokens).
Use **accessToken** in header: `Authorization: Bearer &lt;accessToken&gt;`. Store tokens securely.


**Note:** Default credentials for **GM** have been pre-filled for testing.

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

### POST `/api/v1/certificates`
**Summary:** Generate certificate
**Description:** Generate a new certificate for a completed job. GM, TM only.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "validity_years": 0,
  "certificate_authority_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "flag_administration_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_term": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Certificate generated</summary>

```json
{
  "success": true,
  "message": "Certificate generated successfully",
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

### GET `/api/v1/certificates/upload-url`
**Summary:** Get presigned URL for certificate upload
**Description:** Returns a presigned S3 URL for uploading external certificates. ADMIN, GM, TM only.

**IMPORTANT:** When performing the `PUT` request to the returned `uploadUrl`, you **MUST NOT** include the `Authorization` (Bearer token) header. Presigned URLs already contain authentication in the query parameters. Including both will cause an `InvalidArgument` error from S3.


#### Parameters
- **fileName** (`query` | `string` | *Required*): 
- **contentType** (`query` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Presigned URL generated</summary>

```json
{
  "success": true,
  "data": {
    "upload_url": "string",
    "key": "string"
  }
}
```

</details>

---

### POST `/api/v1/certificates/vessel/{vesselId}/external`
**Summary:** Upload external certificate
**Description:** Manually upload an external certificate for a vessel. ADMIN, GM, TM only.

#### Parameters
- **vesselId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_authority_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_number": "string",
  "issue_date": "string",
  "expiry_date": "string",
  "s3_key": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - External certificate uploaded</summary>

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

### PUT `/api/v1/certificates/{id}/renew`
**Summary:** Renew certificate
**Description:** Renew an expiring certificate. TM, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "validity_years": 0,
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Certificate renewed</summary>

```json
{
  "success": true,
  "message": "string",
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

---

### POST `/api/v1/certificates/{id}/transfer`
**Summary:** Transfer certificate
**Description:** Transfer certificate ownership/association. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Certificate transferred</summary>

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

### POST `/api/v1/certificates/{id}/extend`
**Summary:** Extend certificate
**Description:** Extend certificate validity. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Certificate extended</summary>

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

### PUT `/api/v1/certificates/{id}/downgrade`
**Summary:** Downgrade certificate
**Description:** Downgrade certificate classification/type. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Certificate downgraded</summary>

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

### POST `/api/v1/certificates/{id}/sign`
**Summary:** Sign certificate
**Description:** Digitally sign a certificate. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Certificate signed</summary>

```json
{
  "success": true,
  "message": "string"
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

### POST `/api/v1/certificates/{id}/issue`
**Summary:** Issue certificate
**Description:** Sets a DRAFT certificate to ISSUED and generates the official PDF. GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "flag_administration_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_authority_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "certificate_term": "string",
  "manual_text": {},
  "remarks": "string",
  "issue_date": "string",
  "expiry_date": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Certificate issued</summary>

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

---

### GET `/api/v1/certificates/authorities`
**Summary:** List certificate authorities
**Description:** Returns all active certificate authorities. ADMIN, GM only.

#### Responses
<details><summary><strong>200</strong> - List of authorities</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string",
      "code": "string",
      "country": "string",
      "logo_url": "string",
      "status": "string"
    }
  ]
}
```

</details>

---

### GET `/api/v1/certificates/authorities/{id}`
**Summary:** Get authority by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Authority details</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "name": "string",
    "code": "string",
    "country": "string",
    "logo_url": "string",
    "status": "string"
  }
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

### GET `/api/v1/change-requests`
**Summary:** Get change requests

#### Responses
<details><summary><strong>200</strong> - List of change requests</summary>

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

### PUT `/api/v1/change-requests/{id}/approve`
**Summary:** Approve change request

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Request approved</summary>

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

### PUT `/api/v1/change-requests/{id}/reject`
**Summary:** Reject change request

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Request rejected</summary>

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

## 🚀 Checklist Templates

---

### GET `/api/v1/checklist-templates`
**Summary:** Get checklist templates

#### Parameters
- **status** (`query` | `string` | *Optional*): 
- **certificate_type_id** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of templates</summary>

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

### GET `/api/v1/checklist-templates/job/{jobId}`
**Summary:** Get template for job

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Template for job</summary>

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

### GET `/api/v1/checklist-templates/job/{jobId}/download`
**Summary:** Download auto-filled checklist DOCX for job
**Description:** Generates a job-specific DOCX by filling Word content-controls (by Tag) with vessel/job data, caches it as a JOB document, and returns a signed URL.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 
- **force** (`query` | `boolean` | *Optional*): Regenerate even if cached document exists

#### Responses
<details><summary><strong>200</strong> - Signed URL for filled DOCX</summary>

```json
{
  "success": true,
  "data": {
    "fileName": "string",
    "contentType": "string",
    "expiresAt": "2026-03-07T12:00:00Z",
    "signedUrl": "string"
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

### GET `/api/v1/checklist-templates/{id}`
**Summary:** Get template by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Template details</summary>

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

## 🚀 Checklists

---

### GET `/api/v1/checklists/jobs/{jobId}`
**Summary:** Get checklist for a job
**Description:** Retrieve the checklist items for a specific job. Can be filtered by answer or question code.

#### Parameters
- **jobId** (`path` | `string` | *Required*): Unique identifier of the job
- **answer** (`query` | `string` | *Optional*): Filter by answer status
- **question_code** (`query` | `string` | *Optional*): Filter by specific question code
- **search** (`query` | `string` | *Optional*): Search in question text or remarks

#### Responses
<details><summary><strong>200</strong> - Checklist retrieved successfully</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "job_id": "...",
      "question_code": "string",
      "question_text": "string",
      "answer": "string",
      "remarks": "string",
      "file_url": "string",
      "createdAt": "2026-03-07T12:00:00Z",
      "updatedAt": "2026-03-07T12:00:00Z"
    }
  ]
}
```

</details>

<details><summary><strong>400</strong> - Bad Request</summary>

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

<details><summary><strong>404</strong> - Not Found</summary>

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

### GET `/api/v1/clients`
**Summary:** List clients
**Description:** List all clients. ADMIN, GM, TM, TO only.

#### Parameters
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of clients</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "company_name": "string",
      "company_code": "string",
      "email": "string",
      "phone": "string",
      "contact_person_name": "string",
      "contact_person_email": "string",
      "status": "string",
      "has_user": true,
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

### POST `/api/v1/clients`
**Summary:** Create client
**Description:** Create a new client. ADMIN, GM, TM only.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "company_name": "Marine Shipping Co",
  "company_code": "MSC001",
  "email": "contact@marineshipping.com",
  "address": "string",
  "country": "string",
  "phone": "string",
  "contact_person_name": "string",
  "contact_person_email": "string",
  "status": "string",
  "user": {
    "name": "string",
    "email": "string",
    "password": "SecurePass123",
    "role": "string",
    "phone": "string"
  }
}
```

#### Responses
<details><summary><strong>201</strong> - Client created</summary>

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

### GET `/api/v1/clients/{id}/documents`
**Summary:** Get client documents by ID
**Description:** Get all documents related to a specific client (Vessels, Jobs, Surveys, Profile). ADMIN, GM, TM, TO only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - List of documents</summary>

```json
{
  "success": true,
  "count": 5,
  "data": [
    {}
  ]
}
```

</details>

---

### GET `/api/v1/clients/{id}`
**Summary:** Get client by ID
**Description:** Get client details by ID. ADMIN, GM, TM, TO only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Client details</summary>

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

<details><summary><strong>404</strong> - Client not found</summary>

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

### PUT `/api/v1/clients/{id}`
**Summary:** Update client
**Description:** Update client details. ADMIN, GM, TM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "company_name": "string",
  "company_code": "string",
  "email": "string",
  "address": "string",
  "country": "string",
  "status": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Client updated</summary>

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

## 🚀 Contact

---

### GET `/api/v1/contact`
**Summary:** List all enquiries (Admin/GM)
**Description:** Retrieve all contact form submissions with optional filters and pagination.

#### Parameters
- **status** (`query` | `string` | *Optional*): Filter by enquiry status
- **source_page** (`query` | `string` | *Optional*): Filter by the page the form was submitted from
- **q** (`query` | `string` | *Optional*): Full-text search across name, email, company, message
- **from_date** (`query` | `string` | *Optional*): Filter: submitted on or after this date (YYYY-MM-DD)
- **to_date** (`query` | `string` | *Optional*): Filter: submitted on or before this date (YYYY-MM-DD)
- **page** (`query` | `integer` | *Optional*): 
- **limit** (`query` | `integer` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - Paginated list of enquiries</summary>

```json
{
  "success": true,
  "total": 42,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "full_name": "string",
      "company": "string",
      "corporate_email": "string",
      "phone": "string",
      "subject": "string",
      "source_page": "string",
      "status": "string",
      "internal_note": "string",
      "replied_by": "123e4567-e89b-12d3-a456-426614174000",
      "replied_at": "2026-03-07T12:00:00Z",
      "created_at": "2026-03-07T12:00:00Z",
      "Responder": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "string",
        "email": "string"
      }
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

### GET `/api/v1/contact/stats`
**Summary:** Enquiry stats by status (Admin/GM)
**Description:** Returns counts of enquiries grouped by status, useful for a dashboard widget.

#### Responses
<details><summary><strong>200</strong> - Enquiry counts by status</summary>

```json
{
  "success": true,
  "data": {
    "NEW": 5,
    "READ": 12,
    "REPLIED": 20,
    "ARCHIVED": 3,
    "TOTAL": 40
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

### GET `/api/v1/contact/{id}`
**Summary:** Get a single enquiry (Admin/GM)

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Enquiry details</summary>

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "full_name": "John Maritime",
    "company": "Pacific Shipping Co. Ltd",
    "corporate_email": "john@pacificshipping.com",
    "message": "We are interested in classification services for our fleet.",
    "phone": "+91 98765 43210",
    "subject": "Fleet Classification Inquiry",
    "status": "NEW",
    "internal_note": "Responded via email on 20 Feb 2026.",
    "replied_by": "123e4567-e89b-12d3-a456-426614174000",
    "replied_at": "2026-03-07T12:00:00Z",
    "ip_address": "192.168.1.1",
    "source_page": "CONTACT",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Responder": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin User",
      "email": "admin@grclass.com"
    }
  }
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

### PATCH `/api/v1/contact/{id}/status`
**Summary:** Update enquiry status / internal note (Admin/GM)

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "status": "REPLIED",
  "internal_note": "Responded via email on 20 Feb 2026."
}
```

#### Responses
<details><summary><strong>200</strong> - Enquiry updated</summary>

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "full_name": "John Maritime",
    "company": "Pacific Shipping Co. Ltd",
    "corporate_email": "john@pacificshipping.com",
    "message": "We are interested in classification services for our fleet.",
    "phone": "+91 98765 43210",
    "subject": "Fleet Classification Inquiry",
    "status": "NEW",
    "internal_note": "Responded via email on 20 Feb 2026.",
    "replied_by": "123e4567-e89b-12d3-a456-426614174000",
    "replied_at": "2026-03-07T12:00:00Z",
    "ip_address": "192.168.1.1",
    "source_page": "CONTACT",
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Responder": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin User",
      "email": "admin@grclass.com"
    }
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

### DELETE `/api/v1/documents/{id}`
**Summary:** Delete document

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Document deleted</summary>

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

## 🚀 Feedback

---

### GET `/api/v1/customer-feedback`
**Summary:** Get all feedback

#### Responses
<details><summary><strong>200</strong> - List of feedback</summary>

```json
{
  "success": true,
  "data": {
    "count": 0,
    "rows": [
      null
    ]
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

### GET `/api/v1/portfolio-feedback`
**Summary:** Get all portfolio feedback (Admin view)
**Description:** Returns all feedback requested for portfolio display. Includes visibility status.

#### Responses
<details><summary><strong>200</strong> - List of feedbacks</summary>

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "client_id": "123e4567-e89b-12d3-a456-426614174000",
    "comment": "string",
    "rating": 0,
    "designation": "string",
    "company": "string",
    "is_visible": true,
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z",
    "Client": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "string",
      "email": "string",
      "profile_pic_url": "string"
    }
  }
]
```

</details>

---

## 🚀 Flags

---

### GET `/api/v1/flags`
**Summary:** Get flags

#### Responses
<details><summary><strong>200</strong> - List of flags</summary>

```json
[
  {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "flag_state_name": "string",
    "country": "string",
    "authority_name": "string",
    "contact_email": "string",
    "logo_url": "string",
    "status": "string"
  }
]
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

### PUT `/api/v1/incidents/{id}/status`
**Summary:** Update incident status

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "status": "string",
  "resolution_notes": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Status updated</summary>

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

### PUT `/api/v1/jobs/{id}/approve-request`
**Summary:** GM/ADMIN: Approve request → APPROVED
**Description:** **Transition:** `DOCUMENT_VERIFIED → APPROVED`

General Manager or Admin formally approves the job request after document
verification. Records `approved_by_user_id` on the job.

**Roles:** GM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "remarks": "All documents verified. Request approved."
}
```

#### Responses
<details><summary><strong>200</strong> - Job approved. Status → APPROVED.</summary>

```json
{
  "success": true,
  "message": "Job approved.",
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

<details><summary><strong>400</strong> - Job not in DOCUMENT_VERIFIED state</summary>

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

<details><summary><strong>403</strong> - Forbidden – only ADMIN or GM</summary>

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

### PUT `/api/v1/jobs/{id}/finalize`
**Summary:** ADMIN/GM/TM: Finalize non-survey job → FINALIZED
**Description:** **Transition:** `APPROVED → FINALIZED`

Only applicable to jobs where `is_survey_required = false`. For jobs that
require a survey, finalization happens automatically when the survey is
completed and the TM finalizes the survey report.

**Roles:** GM, TM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "remarks": "No survey required. Finalizing."
}
```

#### Responses
<details><summary><strong>200</strong> - Job finalized. Status → FINALIZED.</summary>

```json
{
  "success": true,
  "message": "Job finalized.",
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

<details><summary><strong>400</strong> - Job requires a survey (is_survey_required=true), or not in APPROVED state</summary>

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

### PUT `/api/v1/jobs/{id}/assign`
**Summary:** ADMIN/GM: Assign surveyor → ASSIGNED
**Description:** **Transition:** `APPROVED → ASSIGNED`

Assigns a surveyor to the job. The target user must exist and have
`role = SURVEYOR`. Records `assigned_surveyor_id` and `assigned_by_user_id`
and sends a push notification to the surveyor.

**Roles:** GM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "surveyorId": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Surveyor assigned. Status → ASSIGNED.</summary>

```json
{
  "success": true,
  "message": "Surveyor assigned.",
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

<details><summary><strong>400</strong> - Job not in APPROVED state, or surveyorId is invalid / not a SURVEYOR</summary>

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

<details><summary><strong>403</strong> - Forbidden – only ADMIN or GM</summary>

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

### PUT `/api/v1/jobs/{id}/reassign`
**Summary:** GM/TM: Reassign surveyor (no status change)
**Description:** Replaces the assigned surveyor without changing job status.  
Can be called on any non-terminal job that already has a surveyor.
A `reason` is mandatory for audit purposes.

**Roles:** GM, TM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "surveyorId": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Surveyor reassigned successfully (status unchanged).</summary>

```json
{
  "success": true,
  "message": "Surveyor reassigned.",
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

<details><summary><strong>400</strong> - Job is in terminal state, or surveyorId is invalid</summary>

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

<details><summary><strong>403</strong> - Forbidden – only GM or TM</summary>

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

### PUT `/api/v1/jobs/{id}/reschedule`
**Summary:** ADMIN/GM: Reschedule job date/port
**Description:** Updates `target_date` and/or `target_port` for an existing job.
Allowed when the job is in any of: `CREATED`, `DOCUMENT_VERIFIED`,
`APPROVED`, `ASSIGNED`, `SURVEY_AUTHORIZED`.  
Not allowed after survey starts or in terminal states.

Logs the old and new values in `job_reschedules` and notifies the
assigned surveyor (if any).

**Roles:** GM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "new_target_date": "string",
  "new_target_port": "string",
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Job rescheduled successfully.</summary>

```json
{
  "success": true,
  "message": "Job rescheduled successfully.",
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

<details><summary><strong>400</strong> - Rescheduling not allowed in current state (e.g. IN_PROGRESS or terminal),
or `reason` is missing.
</summary>

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

<details><summary><strong>403</strong> - Forbidden – only ADMIN or GM</summary>

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

### PUT `/api/v1/jobs/{id}/reject`
**Summary:** ADMIN/GM/TM: Reject job → REJECTED (terminal)
**Description:** **Terminal transition** – moves job to `REJECTED` permanently.

Role-specific constraints:
- **ADMIN** – Any non-terminal job.
- **GM** – Only in `CREATED` state.
- **TM** – Only in `ASSIGNED`, `SURVEY_DONE`, or `REVIEWED` states.

**Roles:** GM, TM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "remarks": "Insufficient documentation. Cannot proceed."
}
```

#### Responses
<details><summary><strong>200</strong> - Job rejected. Status → REJECTED (terminal).</summary>

```json
{
  "success": true,
  "message": "Job rejected.",
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

<details><summary><strong>400</strong> - Job already in terminal state, or role-state constraint violated</summary>

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

### PUT `/api/v1/jobs/{id}/priority`
**Summary:** ADMIN/GM/TM: Update job priority
**Description:** Updates the `priority` field of a job. Creates an audit log entry with
the old and new values plus an optional reason.

Priority does **not** affect the job workflow or status — it is a
management flag only, used to sort / filter jobs in dashboards.

| Value | Meaning |
|---|---|
| `LOW` | Non-urgent, can wait |
| `NORMAL` | Standard priority (default) |
| `HIGH` | Requires prompt attention |
| `URGENT` | Must be actioned immediately |

**Roles:** ADMIN, GM, TM


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "priority": "HIGH",
  "reason": "Client requested expedited review."
}
```

#### Responses
<details><summary><strong>200</strong> - Priority updated successfully.</summary>

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

### GET `/api/v1/jobs/{id}/history`
**Summary:** ADMIN/GM/TM/TO: Job status history & audit trail
**Description:** Returns a chronological list of all status transitions for the job,
including who made each change and the reason.

**Roles:** ADMIN, GM, TM, TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Status history list</summary>

```json
{
  "success": true,
  "data": {
    "job_history": [
      {
        "id": "...",
        "job_id": "...",
        "previous_status": "...",
        "new_status": "...",
        "changed_by": "...",
        "reason": "...",
        "created_at": "...",
        "User": "..."
      }
    ],
    "survey_history": [
      {
        "id": "...",
        "survey_id": "...",
        "previous_status": "...",
        "new_status": "...",
        "changed_by": "...",
        "reason": "...",
        "submission_iteration": "...",
        "created_at": "...",
        "User": "..."
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

### POST `/api/v1/jobs/{id}/notes`
**Summary:** ADMIN/GM/TM/TO: Add internal staff note
**Description:** Attaches a private (internal) note to the job visible only to staff roles.
Notes are not visible to CLIENT or SURVEYOR.

**Roles:** ADMIN, GM, TM, TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "note_text": "string",
  "is_internal": true
}
```

#### Responses
<details><summary><strong>201</strong> - Note added successfully.</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "note_text": "string",
    "is_internal": true,
    "created_at": "2026-03-07T12:00:00Z"
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

### GET `/api/v1/jobs/{id}/messages/internal`
**Summary:** ADMIN/GM/TM/TO: Get internal (staff-only) messages
**Description:** Returns the internal message thread for a job — staff only, not
visible to CLIENT or SURVEYOR.

**Roles:** ADMIN, GM, TM, TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Internal message thread</summary>

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

## 🚀 Non-Conformities

---

### GET `/api/v1/non-conformities/job/{jobId}`
**Summary:** Get NCs by job

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - List of NCs</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "description": "string",
      "severity": "string",
      "status": "string",
      "closure_remarks": "string",
      "closed_at": "2026-03-07T12:00:00Z",
      "created_at": "2026-03-07T12:00:00Z",
      "updated_at": "2026-03-07T12:00:00Z"
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

### POST `/api/v1/payments/invoice`
**Summary:** Create invoice
**Description:** Create a new invoice for a job. ADMIN, GM, TM only.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 0,
  "currency": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - Invoice created</summary>

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

---

### POST `/api/v1/payments/{id}/refund`
**Summary:** Process refund
**Description:** Process a refund for a payment. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "amount": 0,
  "reason": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Refund processed</summary>

```json
{
  "success": true,
  "data": {}
}
```

</details>

---

### POST `/api/v1/payments/{id}/partial`
**Summary:** Record partial payment
**Description:** Record a partial payment against an invoice. ADMIN, GM, TM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "amount": 0,
  "remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Partial payment recorded</summary>

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

---

### GET `/api/v1/payments/{id}/ledger`
**Summary:** Get payment ledger
**Description:** Get financial ledger entries for a payment. ADMIN, GM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Ledger entries</summary>

```json
{
  "success": true,
  "data": [
    {}
  ]
}
```

</details>

---

## 🚀 Reports

---

### GET `/api/v1/reports/certificates`
**Summary:** Certificate report

#### Responses
<details><summary><strong>200</strong> - Certificate report</summary>

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

### GET `/api/v1/reports/surveyors`
**Summary:** Surveyor report

#### Responses
<details><summary><strong>200</strong> - Surveyor report</summary>

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

### GET `/api/v1/reports/non-conformities`
**Summary:** Non-conformity report

#### Responses
<details><summary><strong>200</strong> - NC report</summary>

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

### GET `/api/v1/reports/financials`
**Summary:** Financial report

#### Responses
<details><summary><strong>200</strong> - Financial report</summary>

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

### PUT `/api/v1/support/{id}`
**Summary:** Update ticket status (or use /support/{id}/status)

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "status": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Status updated</summary>

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

### PUT `/api/v1/support/{id}/status`
**Summary:** Update ticket status

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "status": "string",
  "internal_note": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Status updated</summary>

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

## 🚀 Surveyors

---

### GET `/api/v1/surveyors`
**Summary:** List all surveyors
**Description:** Returns a list of all surveyors with their profile and user details.

#### Parameters
- **status** (`query` | `string` | *Optional*): Filter by surveyor status (e.g. ACTIVE, INACTIVE, SUSPENDED)
- **is_available** (`query` | `boolean` | *Optional*): Filter by availability status

#### Responses
<details><summary><strong>200</strong> - List of surveyors fetched successfully</summary>

```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "license_number": "string",
      "status": "string",
      "is_available": true,
      "User": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "string",
        "email": "string",
        "phone": "string",
        "role": "string",
        "status": "string"
      }
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

## 🚀 Surveys

---

### GET `/api/v1/surveys`
**Summary:** List survey reports

#### Responses
<details><summary><strong>200</strong> - List of survey reports</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "survey_status": "string",
      "submission_count": 0,
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "finalized_at": "2026-03-07T12:00:00Z",
      "survey_statement_status": "string",
      "survey_statement_pdf_url": "string",
      "signed_checklist_files": [
        "string"
      ],
      "JobRequest": {
        "id": "...",
        "job_status": "string",
        "Vessel": {
          "vessel_name": "...",
          "imo_number": "..."
        }
      },
      "User": {
        "name": "string",
        "email": "string"
      }
    }
  ]
}
```

</details>

---

### GET `/api/v1/surveys/jobs/{jobId}`
**Summary:** Get survey details
**Description:** Fetches full details of a survey for a specific job, including related objects.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Survey details fetched</summary>

```json
{
  "success": true,
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "survey_status": "string",
    "submission_count": 0,
    "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "declared_at": "2026-03-07T12:00:00Z",
    "start_latitude": 0,
    "start_longitude": 0,
    "submit_latitude": 0,
    "submit_longitude": 0,
    "attendance_photo_url": "string",
    "evidence_proof_url": "string",
    "signature_url": "string",
    "declaration_hash": "string",
    "survey_statement": "string",
    "survey_statement_status": "string",
    "survey_statement_pdf_url": "string",
    "signed_checklist_files": [
      "string"
    ],
    "started_at": "2026-03-07T12:00:00Z",
    "submitted_at": "2026-03-07T12:00:00Z",
    "finalized_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>404</strong> - Survey not found</summary>

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

### PUT `/api/v1/surveys/jobs/{jobId}/rework`
**Summary:** Request Rework
**Description:** GM or TM requests corrections/rework on a submitted survey.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "reason": "Incomplete proof for engine section."
}
```

#### Responses
<details><summary><strong>200</strong> - Rework requested</summary>

```json
{
  "success": true,
  "message": "Rework requested successfully"
}
```

</details>

<details><summary><strong>400</strong> - Invalid transition</summary>

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

### GET `/api/v1/surveys/jobs/{jobId}/timeline`
**Summary:** Get survey execution timeline
**Description:** Analytical view of survey duration and GPS variance.

#### Parameters
- **jobId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Survey timeline fetched</summary>

```json
{
  "success": true,
  "data": {
    "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "gps_trace": [
      {
        "latitude": 0,
        "longitude": 0,
        "timestamp": "2026-03-07T12:00:00Z"
      }
    ],
    "survey_details": {
      "id": "...",
      "job_id": "...",
      "surveyor_id": "...",
      "survey_status": "string",
      "submission_count": 0,
      "declared_by": "...",
      "declared_at": "2026-03-07T12:00:00Z",
      "start_latitude": 0,
      "start_longitude": 0,
      "submit_latitude": 0,
      "submit_longitude": 0,
      "attendance_photo_url": "string",
      "evidence_proof_url": "string",
      "signature_url": "string",
      "declaration_hash": "string",
      "survey_statement": "string",
      "survey_statement_status": "string",
      "survey_statement_pdf_url": "string",
      "signed_checklist_files": [
        "..."
      ],
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "finalized_at": "2026-03-07T12:00:00Z"
    }
  }
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

## 🚀 Certificate Templates

---

### GET `/api/v1/certificate-templates`
**Summary:** Get certificate templates

#### Parameters
- **is_active** (`query` | `boolean` | *Optional*): 
- **certificate_type_id** (`query` | `string` | *Optional*): 
- **certificate_term** (`query` | `string` | *Optional*): 

#### Responses
<details><summary><strong>200</strong> - List of templates</summary>

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

### GET `/api/v1/certificate-templates/{id}`
**Summary:** Get template by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Template details</summary>

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

<details><summary><strong>404</strong> - Template not found</summary>

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

## 🚀 TOCA

---

### GET `/api/v1/toca`
**Summary:** Get TOCAs

#### Responses
<details><summary><strong>200</strong> - List of TOCAs</summary>

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

### POST `/api/v1/vessels`
**Summary:** Create vessel
**Description:** Create a new vessel. ADMIN, GM, TM only.

#### Request Body
**Content-Type:** `application/json`

```json
{
  "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "vessel_name": "Ocean Pioneer",
  "imo_number": "9123456",
  "call_sign": "9VSP",
  "mmsi_number": "563123456",
  "flag_administration_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
  "port_of_registry": "Singapore",
  "year_built": 2015,
  "ship_type": "Cargo",
  "gross_tonnage": 0,
  "net_tonnage": 0,
  "deadweight": 0,
  "class_status": "string",
  "current_class_society": "string",
  "engine_type": "string",
  "builder_name": "string",
  "uploaded_documents": [
    {
      "file_url": "string",
      "document_type": "string",
      "description": "string"
    }
  ]
}
```

#### Responses
<details><summary><strong>201</strong> - Vessel created</summary>

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

### GET `/api/v1/vessels/client/{clientId}`
**Summary:** Get vessels by client
**Description:** Get all vessels for a specific client. ADMIN, GM, TM only.

#### Parameters
- **clientId** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - List of client vessels</summary>

```json
{
  "success": true,
  "data": [
    {
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

### PUT `/api/v1/vessels/{id}`
**Summary:** Update vessel
**Description:** Update vessel details. ADMIN, GM, TM only.

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "client_id": "123e4567-e89b-12d3-a456-426614174000",
  "vessel_name": "string",
  "imo_number": "string",
  "call_sign": "string",
  "mmsi_number": "string",
  "flag_administration_id": "123e4567-e89b-12d3-a456-426614174000",
  "port_of_registry": "string",
  "year_built": 0,
  "ship_type": "string",
  "gross_tonnage": 0,
  "net_tonnage": 0,
  "deadweight": 0,
  "class_status": "string",
  "current_class_society": "string",
  "engine_type": "string",
  "builder_name": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - Vessel updated</summary>

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

