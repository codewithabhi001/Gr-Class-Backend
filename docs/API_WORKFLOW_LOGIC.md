# GIRIK Platform: Detailed API Workflows

This document provides a technical and operational breakdown of how the core APIs function, including the underlying logic and state transitions.

---

## 1. Job Lifecycle & Management

The "Job" is the primary container for all maritime activities. Its state dictates what can happen next.

### **Creation & Validation**
- **Workflow**: `CLIENT` $\rightarrow$ `POST /api/v1/jobs`
- **Logic**:
    - **Document Guard**: Checks `CertificateRequiredDocument` table. If the certificate type requires "Copy of Registry" and it's missing, the API rejects the request.
    - **Vessel Check**: Ensures the vessel's class status is `ACTIVE`.
    - **Outcome**: A job is created in `CREATED` status.

### **Strategic Approvals**
1. **Document Verification (`PUT /:id/verify-documents`)**:
    - **Role**: `TO` (Technical Officer).
    - **Logic**: A technical check to ensure uploaded files are valid (not just present). Advances to `DOCUMENT_VERIFIED`.
2. **Management Approval (`PUT /:id/approve-request`)**:
    - **Role**: `GM` (General Manager).
    - **Logic**: Business approval to proceed with the job. Advances to `APPROVED`.

### **Smart Assignment & Authorization**
- **Surveyor Assignment (`PUT /:id/assign`)**:
    - **Role**: `GM`.
    - **Logic**: The system runs an **Authorization Matrix** check:
        - Is the surveyor `ACTIVE` and `Available`?
        - Does the surveyor have the "Stamp/Authority" for this **Vessel Type** (e.g., Bulk Carrier vs Chemical Tanker)?
        - Is the surveyor authorized for this **Certificate Type**?
    - **Outcome**: Sets `assigned_surveyor_id` and moves status to `ASSIGNED`.
- **Operational Authorization (`PUT /:id/authorize-survey`)**:
    - **Role**: `TM` (Team Manager).
    - **Logic**: Final internal clearance. Moves status to `SURVEY_AUTHORIZED`.

---

## 2. Survey Execution (The "Digital Field" Flow)

Surveys are mobile-first and enforce high auditability standards.

### **Check-In (`POST /start`)**
- **Logic**: Surveyor must be at the vessel location. Records `start_latitude` and `start_longitude`. Initializes the `Survey` record.

### **Immutable Submission (`POST /`)**
- **Workflow**: Surveyor submits final report.
- **Logic**:
    - **Attendance Guard**: Requires a live photo and GPS coordinates.
    - **Declaration Hash**: The system generates a **SHA-256 Hash** that fingerprints the entire survey (Checklist Answers + Evidence URLs + Statements + GPS). If any data is changed post-submission, the hash will mismatch, alerting auditors to tampering.
    - **Status Change**: Transitions Job to `SURVEY_DONE`.

### **Technical Review & Finalization**
- **Review (`PUT /jobs/:id/review`)**: `TO` checks the survey report for technical accuracy. Moves status to `REVIEWED`.
- **Finalize (`PUT /jobs/:id/finalize`)**: `TM` grants final approval.
    - **NC Guard**: The API checks if there are any **Open Non-Conformities** associated with the job. If yes, finalization is blocked until they are closed.
    - **Outcome**: Job moves to `FINALIZED`.

---

## 3. Certificate Generation & Issuance

### **Drafting (`POST /certificates`)**
- **Workflow**: `TM` $\rightarrow$ `Draft`
- **Logic**: Creates a certificate record in `DRAFT` status. Links it to the `FINALIZED` job.

### **Issuance & Versioning (`POST /certificates/:id/issue`)**
- **Workflow**: `GM` $\rightarrow$ `Issue`
- **Logic**:
    - **Payment Sync**: Often checks if the linked invoice is `PAID`.
    - **PDF Generation**: Triggers a background worker (Puppeteer) to generate the high-security PDF certificate with watermarks and a verifiable QR code.
    - **State**: Job moves to `CERTIFIED`.

### **Renewal & Reissue**
- **Reissue**: Revokes the current certificate and creates a new one with `version_number + 1`. This maintains a full audit trail of why the certificate was updated (e.g., name change).

---

## 4. Non-Conformity (NC) Lifecycle

### **Raising an NC (`POST /non_conformities`)**
- **Logic**: Raised during a survey when a vessel fails a specific rule.
- **Alerting**: Immediately triggers Push/Email notifications to the `TM` and `TO` for that region.

### **Closure (`PUT /non_conformities/:id/close`)**
- **Logic**: Only a `TM` or `TO` can close an NC after the surveyor provides "Action Taken" evidence. A job **cannot** be certified if any NC remains in `OPEN` status.
