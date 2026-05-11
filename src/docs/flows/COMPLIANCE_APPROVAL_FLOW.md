# Compliance and Approval Module Flow

This document details the API endpoints, request/response payloads, and Role-Based Access Control (RBAC) for the Compliance and Approval modules within the GR-CLASS Backend.

---

## 🛡️ Compliance Module (Data Privacy & GDPR)
Used for managing user data privacy, specifically for exporting and anonymizing sensitive data.

### 1. Export User Data
Retrieve all data associated with a specific user for compliance audits or data portability requests.

- **Endpoint**: `GET /api/v1/compliance/export/:id`
- **RBAC**: `ADMIN`, `CLIENT` (Users can export their own data, Admins can export any)
- **Request Parameters**:
  - `id` (UUID): The ID of the user whose data is to be exported.
- **Response Payload**:
  ```json
  {
    "id": "018f3a2b-...",
    "name": "John Doe",
    "email": "john@example.com",
    "RequestedJobs": [...],
    "Tickets": [...]
  }
  ```

### 2. Anonymize User Data
Permanently mask user-identifiable information while keeping records intact for historical reporting.

- **Endpoint**: `POST /api/v1/compliance/anonymize/:id`
- **RBAC**: `ADMIN`
- **Request Parameters**:
  - `id` (UUID): The ID of the user to anonymize.
- **Response Payload**:
  ```json
  {
    "success": true,
    "message": "User data anonymized"
  }
  ```

---

## ✅ Approval Module (Generic Workflow)
A centralized module to track multi-step approvals for various entities like Jobs, Vessels, or Certificates.

### 1. Create Approval Entry
Initialize an approval request for a specific entity.

- **Endpoint**: `POST /api/v1/approvals/`
- **RBAC**: `ADMIN`, `GM`, `TM`
- **Request Payload**:
  ```json
  {
    "entity_type": "JOB",
    "entity_id": "018f3a2b-...",
    "role": "GM",
    "remarks": "Initial review required"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "018f3a2b-...",
    "entity_type": "JOB",
    "entity_id": "018f3a2b-...",
    "status": "PENDING",
    "remarks": "Initial review required"
  }
  ```

### 2. Update Approval Step
Update the status of a pending approval (Approve or Reject).

- **Endpoint**: `PUT /api/v1/approvals/:id/step`
- **RBAC**: `ADMIN`, `GM`, `TM`
- **Request Parameters**:
  - `id` (UUID): The ID of the approval entry.
- **Request Payload**:
  ```json
  {
    "status": "APPROVED"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "018f3a2b-...",
    "status": "APPROVED",
    "approved_by": "018f3a2b-...",
    "approved_at": "2024-05-11T10:00:00Z"
  }
  ```

---

## 🔄 Related Operational Flows

### Change Requests
Handled in `src/modules/change_requests`.
- **Create**: `POST /api/v1/change-requests/`
- **Approve**: `PUT /api/v1/change-requests/:id/approve` (Roles: `ADMIN`, `GM`)
- **Reject**: `PUT /api/v1/change-requests/:id/reject` (Roles: `ADMIN`, `GM`)

### Technical Compliance (Non-Conformities)
Handled in `src/modules/non_conformities`.
- Tracks vessel defects found during surveys.
- Closure of NCs is required for a vessel to be in "Compliance".
