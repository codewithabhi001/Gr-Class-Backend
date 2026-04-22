# Detailed RBAC & Workflow: Jobs Module

This document provides a granular breakdown of the **Jobs Module** workflow, mapping every action to its authorized roles and technical responsibilities.

---

## Jobs Module: API & Role Matrix

| Action / Endpoint | Authorized Roles | Description of Work | Key Rules & Logic |
| :--- | :--- | :--- | :--- |
| **Create Job Request** (`POST /`) | `CLIENT`, `ADMIN`, `GM` | Initiates a new inspection request for a specific vessel. | Validates mandatory documents for the certificate type. Vessel must be `ACTIVE`. |
| **Verify Documents** (`PUT /:id/verify-documents`) | `TO` | Technical review of the pre-requisite documents uploaded by the client. | Moves status from `CREATED` to `DOCUMENT_VERIFIED`. |
| **Approve Request** (`PUT /:id/approve-request`) | `GM`, `ADMIN` | High-level business approval to proceed with scheduling. | Moves status to `APPROVED`. |
| **Assign Surveyor** (`PUT /:id/assign`) | `GM`, `ADMIN` | Selection of a qualified surveyor for the physical inspection. | **Authorization Matrix**: Checks if surveyor is active, available, and certified for that vessel/job type. |
| **Authorize Survey** (`PUT /:id/authorize-survey`) | `TM`, `GM`, `ADMIN` | Final operational clearance; surveyor can now "Check-in" on site. | Moves status to `SURVEY_AUTHORIZED`. |
| **Check-in / Start Survey** (`POST /surveys/start`) | `SURVEYOR` | Surveyor arrives at vessel and physically starts the inspection. | Records GPS and timestamp. Status moves to `IN_PROGRESS`. |
| **Submit Checklist** (`PUT /checklists/jobs/:id`) | `SURVEYOR` | Surveyor fills out technical inspection points on the mobile app. | Updates the `ActivityPlanning` data. |
| **Submit Final Report** (`POST /surveys`) | `SURVEYOR` | Finalizes the data entry and submits the report for review. | Generates an **Immutable Hash** of all data to prevent tampering. |
| **Technical Review** (`PUT /:id/review`) | `TO` | A technical peer-review of the surveyor's findings and evidence. | Moves status from `SURVEY_DONE` to `REVIEWED`. |
| **Finalize Job** (`PUT /:id/finalize`) | `TM`, `GM` | Operational closure of the job, making it ready for certification. | **NC Guard**: Programmatically blocks if any Non-Conformity is still `OPEN`. |
| **Issue Certificate** (`POST /certificates/:id/issue`) | `GM` | Formally issues the maritime certificate and generates the PDF. | Final step. Moves job status to `CERTIFIED`. |
| **Reject / Cancel** (`PUT /:id/reject`) | `GM`, `TM`, `CLIENT` | Stops the job workflow due to errors, non-payment, or withdrawal. | Roles have different limits on when they can reject (e.g., GM only at CREATED). |
| **List / View Jobs** (`GET /`) | `ALL ROLES` | Accessing the dashboard or specific job details. | **Data Scoping**: Clients see only their fleet; Surveyors see only their assignments. |

---

## Detailed Logic Breakdown per Role

### **1. General Manager (GM)**
*   **The Business Gatekeeper.**
*   The GM is the only role that can **Issue** a certificate or **Approve** a high-level budget/request. 
*   They are responsible for the **Authorization Matrix** check during surveyor assignment to ensure legal compliance.

### **2. Technical Manager (TM)**
*   **The Operational Controller.**
*   The TM focuses on the "In-between" states. They generate the **Draft Certificates** and oversee the **Non-Conformity (NC)** closure process.
*   They are the "Finalize" button holders who ensure the technical job is operationally complete.

### **3. Technical Officer (TO)**
*   **The Forensic Reviewer.**
*   The TO doesn't make business decisions but checks for **Technical Integrity**.
*   They verify documents at the start and perform the "Technical Review" at the end to ensure the surveyor's findings are sound.

### **4. Surveyor**
*   **The Eyes on the Ground.**
*   Restricted mostly to the **Execution Phase**. They have no power over approvals or finalizations.
*   Must provide GPS-locked data and attendance photos to prove they were physically present.

### **5. Client**
*   **The Service Requester.**
*   Authorized only to **Initiate** (Create Job) and **Monitor** (View/Download).
*   Can only see data linked to their specific `client_id` (enforced via `req.dataScope`).
