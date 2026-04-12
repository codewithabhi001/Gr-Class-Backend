# Fully Detailed API Documentation: TO Role

> This documentation is generated specifically for frontend integration, depicting exact JSON structures, data types, and file upload strategies required for the **TO** role.

## 🚀 Activity Requests

---

### GET `/api/v1/activity-requests`
**Summary:** Get activity requests

#### Responses
<details><summary><strong>200</strong> - List of requests</summary>

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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### GET `/api/v1/activity-requests/{id}`
**Summary:** Get request by ID

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Request details</summary>

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
  "message": "Validation Error",
  "error": "string"
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
  ]
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

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Class Certificate",
    "issuing_authority": "string",
    "validity_years": 5,
    "status": "string",
    "description": "Annual classification survey certificate",
    "requires_survey": true,
    "CertificateRequiredDocuments": [
      {
        "id": "...",
        "document_name": "...",
        "is_mandatory": "..."
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

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Certificate type not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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

<details><summary><strong>404</strong> - Job not found or certificate not yet generated</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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

<details><summary><strong>403</strong> - Forbidden - certificate exists but user has no access</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
    null
  ]
}
```

</details>

---

## 🚀 Checklist Templates

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
  "message": "Validation Error",
  "error": "string"
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
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "job_id": "123e4567-e89b-12d3-a456-426614174000",
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

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Not Found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
      "address": "string",
      "country": "string",
      "status": "string"
    }
  ]
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
    "status": "string"
  }
}
```

</details>

<details><summary><strong>404</strong> - Client not found</summary>

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

## 🚀 Documents

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
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Document not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
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

## 🚀 Incidents

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
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
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
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "job_status": "CREATED",
    "survey": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "survey_status": "NOT_STARTED",
      "survey_statement_status": "NOT_PREPARED",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "start_latitude": 0,
      "start_longitude": 0,
      "submit_latitude": 0,
      "submit_longitude": 0,
      "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "declared_at": "2026-03-07T12:00:00Z",
      "declaration_hash": "string",
      "SurveyStatusHistories": [
        {
          "id": "...",
          "previous_status": "...",
          "new_status": "...",
          "changed_by": "...",
          "reason": "...",
          "created_at": "..."
        }
      ]
    },
    "priority": "string",
    "vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo"
    },
    "certificate_type": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string"
    },
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
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

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/jobs/{id}/verify-documents`
**Summary:** TO: Verify documents → DOCUMENT_VERIFIED
**Description:** **Transition:** `CREATED → DOCUMENT_VERIFIED`

Technical Officer confirms that all uploaded documents are valid and complete.
If the certificate type has mandatory required documents that are not yet
uploaded, the request is rejected with a `400` listing the missing documents.

**Roles:** TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Responses
<details><summary><strong>200</strong> - Documents verified. Job moved to DOCUMENT_VERIFIED.</summary>

```json
{
  "success": true,
  "message": "Documents verified by TO.",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "job_status": "CREATED",
    "survey": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "survey_status": "NOT_STARTED",
      "survey_statement_status": "NOT_PREPARED",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "start_latitude": 0,
      "start_longitude": 0,
      "submit_latitude": 0,
      "submit_longitude": 0,
      "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "declared_at": "2026-03-07T12:00:00Z",
      "declaration_hash": "string",
      "SurveyStatusHistories": [
        {
          "id": "...",
          "previous_status": "...",
          "new_status": "...",
          "changed_by": "...",
          "reason": "...",
          "created_at": "..."
        }
      ]
    },
    "priority": "string",
    "vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo"
    },
    "certificate_type": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string"
    },
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>400</strong> - Job not in CREATED state, or mandatory documents are missing</summary>

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

<details><summary><strong>403</strong> - Forbidden – only TO can call this endpoint</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/jobs/{id}/review`
**Summary:** TO: Technical review → REVIEWED
**Description:** **Transition:** `SURVEY_DONE → REVIEWED`

Technical Officer performs a technical review of the submitted survey findings.
Only a TO can call this endpoint.

**Roles:** TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "remarks": "Findings are correct. Technical review passed."
}
```

#### Responses
<details><summary><strong>200</strong> - Job reviewed. Status → REVIEWED.</summary>

```json
{
  "success": true,
  "message": "Job marked as reviewed.",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "job_status": "CREATED",
    "survey": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "survey_status": "NOT_STARTED",
      "survey_statement_status": "NOT_PREPARED",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "start_latitude": 0,
      "start_longitude": 0,
      "submit_latitude": 0,
      "submit_longitude": 0,
      "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "declared_at": "2026-03-07T12:00:00Z",
      "declaration_hash": "string",
      "SurveyStatusHistories": [
        {
          "id": "...",
          "previous_status": "...",
          "new_status": "...",
          "changed_by": "...",
          "reason": "...",
          "created_at": "..."
        }
      ]
    },
    "priority": "string",
    "vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo"
    },
    "certificate_type": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string"
    },
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>400</strong> - Job not in SURVEY_DONE state</summary>

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

<details><summary><strong>403</strong> - Forbidden – only TO</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/jobs/{id}/send-back`
**Summary:** ADMIN/TM/TO: Request rework → REWORK_REQUESTED
**Description:** **Transition:** `SURVEY_DONE` or `REVIEWED → REWORK_REQUESTED`

Sends the job back to the surveyor for corrections.
Notifies the assigned surveyor with the `remarks` reason.

Role-specific from-state constraints:
- **ADMIN** – Any non-terminal state.
- **TM** – `SURVEY_DONE` or `REVIEWED`.
- **TO** – `SURVEY_DONE` only.

**Roles:** ADMIN, TM, TO


#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "remarks": "Engine section checklist is incomplete. Please revise."
}
```

#### Responses
<details><summary><strong>200</strong> - Rework requested. Status → REWORK_REQUESTED.</summary>

```json
{
  "success": true,
  "message": "Rework requested. Surveyor has been notified.",
  "data": {
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "certificate_type_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "reason": "string",
    "target_port": "string",
    "target_date": "string",
    "assigned_surveyor_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "assigned_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "approved_by_user_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "generated_certificate_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "remarks": "string",
    "job_status": "CREATED",
    "survey": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "survey_status": "NOT_STARTED",
      "survey_statement_status": "NOT_PREPARED",
      "started_at": "2026-03-07T12:00:00Z",
      "submitted_at": "2026-03-07T12:00:00Z",
      "start_latitude": 0,
      "start_longitude": 0,
      "submit_latitude": 0,
      "submit_longitude": 0,
      "declared_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "declared_at": "2026-03-07T12:00:00Z",
      "declaration_hash": "string",
      "SurveyStatusHistories": [
        {
          "id": "...",
          "previous_status": "...",
          "new_status": "...",
          "changed_by": "...",
          "reason": "...",
          "created_at": "..."
        }
      ]
    },
    "priority": "string",
    "vessel": {
      "id": "...",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "...",
      "ship_type": "Cargo"
    },
    "certificate_type": {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "name": "string"
    },
    "created_at": "2026-03-07T12:00:00Z",
    "updated_at": "2026-03-07T12:00:00Z"
  }
}
```

</details>

<details><summary><strong>400</strong> - Role-state constraint violation</summary>

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

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "job_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "old_status": "string",
      "new_status": "string",
      "changed_by": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "change_reason": "string",
      "created_at": "2026-03-07T12:00:00Z",
      "User": {
        "name": "string",
        "email": "string",
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

<details><summary><strong>404</strong> - Job not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

## 🚀 Non-Conformities

---

### POST `/api/v1/non-conformities`
**Summary:** Create NC

#### Request Body
**Content-Type:** `application/json`

```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "string",
  "severity": "string"
}
```

#### Responses
<details><summary><strong>201</strong> - NC created</summary>

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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

### PUT `/api/v1/non-conformities/{id}/close`
**Summary:** Close NC

#### Parameters
- **id** (`path` | `string` | *Required*): 

#### Request Body
**Content-Type:** `application/json`

```json
{
  "closure_remarks": "string"
}
```

#### Responses
<details><summary><strong>200</strong> - NC closed</summary>

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
  "message": "Validation Error",
  "error": "string"
}
```

</details>

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
  "message": "Request successful"
}
```

</details>

<details><summary><strong>403</strong> - Forbidden</summary>

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
  "message": "Validation Error",
  "error": "string"
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
  "data": [
    {
      "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "vessel_name": "Ocean Pioneer",
      "imo_number": "9123456",
      "flag_administration_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "ship_type": "Cargo",
      "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
      "call_sign": "9VSP",
      "mmsi_number": "563123456",
      "port_of_registry": "Singapore",
      "year_built": 2015,
      "gross_tonnage": 30000,
      "net_tonnage": 15000,
      "deadweight": 45000,
      "class_status": "ACTIVE",
      "current_class_society": "DNV",
      "engine_type": "Diesel",
      "builder_name": "Hyundai Heavy Industries"
    }
  ]
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
    "id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "vessel_name": "Ocean Pioneer",
    "imo_number": "9123456",
    "flag_administration_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "ship_type": "Cargo",
    "client_id": "01933c5e-7f2a-7a00-8000-1a2b3c4d5e6f",
    "call_sign": "9VSP",
    "mmsi_number": "563123456",
    "port_of_registry": "Singapore",
    "year_built": 2015,
    "gross_tonnage": 30000,
    "net_tonnage": 15000,
    "deadweight": 45000,
    "class_status": "ACTIVE",
    "current_class_society": "DNV",
    "engine_type": "Diesel",
    "builder_name": "Hyundai Heavy Industries"
  }
}
```

</details>

<details><summary><strong>404</strong> - Vessel not found</summary>

```json
{
  "success": false,
  "message": "Validation Error",
  "error": "string"
}
```

</details>

---

