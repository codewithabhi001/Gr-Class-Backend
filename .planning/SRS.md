# Software Requirements Specification (SRS) - GR-CLASS Backend

## 1. Introduction
GR-CLASS is an enterprise-grade maritime certification platform designed for classification societies and recognized organizations. It digitizes the complete lifecycle of vessel inspection and certification processes, replacing manual workflows with a reliable, scalable, and auditable digital system.

## 2. User Roles & RBAC (Role-Based Access Control)
The system employs a strict RBAC model. Each user is assigned one of the following roles:

| Role | Code | Description |
| :--- | :--- | :--- |
| **Administrator** | `ADMIN` | Full system access, including system configuration and user management. |
| **General Manager** | `GM` | Business operations lead. Manages clients, approves job requests, and assigns surveyors. |
| **Technical Manager** | `TM` | Technical authority. Authorizes surveys, finalizes technical reports, and issues/renews certificates. |
| **Technical Officer** | `TO` | Technical reviewer. Verifies vessel documents and performs technical reviews of survey reports. |
| **Technical Assistant**| `TA` | Operational support. Assist with documentation and viewing reports. |
| **Surveyor** | `SURVEYOR` | External inspectors. Perform physical vessel surveys, submit checklists, and evidence. |
| **Client** | `CLIENT` | Vessel owners or managers. Request jobs, track progress, and download certificates. |
| **Flag Admin** | `FLAG_ADMIN` | Government or Port authority representatives with read-only access to specific vessel records. |

## 3. Core Modules & Functionality

### 3.1 Vessel & Client Management
*   **Vessels**: Manage vessel details, class numbers, IMO numbers, and historical records.
*   **Clients**: Manage organizations owning/operating vessels.
*   **Documents**: Repository for vessel-specific documents (Registry, Class certs, etc.).

### 3.2 Job Management (The Core Workflow)
Jobs track the lifecycle of a service request (Survey or Certification).
1.  **Request**: Client or GM/ADMIN creates a job request.
2.  **Document Verification**: Technical Officer (TO) verifies the submitted documents for the job.
3.  **Approval**: GM/ADMIN approves the job request.
4.  **Assignment**: GM/ADMIN assigns a Surveyor to the job.
5.  **Authorization**: Technical Manager (TM) authorizes the survey to proceed.
6.  **Completion**: Once the survey is done and technical review passed, the job is "Finalized".

### 3.3 Survey Lifecycle
Automates the physical inspection process via the Surveyor's mobile/web app.
1.  **Check-in**: Surveyor arrives at the vessel location.
2.  **Checklist Submission**: Surveyor fills out mandatory technical checklists.
3.  **Evidence Upload**: Surveyor uploads photos, documents, and GPS proof.
4.  **Statement Draft**: Surveyor/TM drafts the survey statement.
5.  **Technical Review**: TO/ADMIN reviews the submission for compliance.
6.  **Finalize**: TM approves the survey result.

### 3.4 Certification
*   **Generation**: Automatic generation of PDF certificates based on finalized surveys.
*   **Issuance**: Official signing and issuance of certificates (Draft -> Issued).
*   **Lifecycle**: Support for Suspension, Revocation, Restoration, and Renewal.
*   **Verification**: Public-facing endpoint for QR code verification of certificates.

### 3.5 Support & Monitoring
*   **Non-Conformities (NC)**: Tracking deficiencies found during surveys.
*   **Incidents**: Reporting and tracking vessel incidents.
*   **Dashboard**: Role-specific analytics and pending task lists.

## 4. Technical Specifications for Frontend

### 4.1 API Standards
*   **Base URL**: `/api/v1`
*   **Authentication**: JSON Web Token (JWT).
    *   Tokens can be sent via `Authorization: Bearer <token>` header or HttpOnly Cookies.
*   **Response Format**:
    ```json
    {
      "success": true,
      "data": { ... },
      "message": "Optional success message"
    }
    ```
*   **Error Format**:
    ```json
    {
      "success": false,
      "message": "Descriptive error message",
      "error_code": "OPTIONAL_SYS_CODE"
    }
    ```

### 4.2 Important Endpoints for Main Flow
*   `POST /auth/login`: Authentication.
*   `GET /dashboard`: Role-based counters and stats.
*   `GET /jobs`: List jobs (filtered by role scope).
*   `POST /surveys/start`: Surveyor check-in.
*   `PUT /certificates/:id/issue`: GM/ADMIN final certificate issuance.

## 5. Security & Constraints
*   **Data Scoping**: Clients can only see their own vessels/jobs. Surveyors can only see assigned jobs.
*   **Separation of Duties**: A user cannot approve/verify a job they created or are assigned to (enforced via `preventSelfApproval` middleware).
*   **Audit Logs**: Every status change and document upload is logged for maritime compliance.
