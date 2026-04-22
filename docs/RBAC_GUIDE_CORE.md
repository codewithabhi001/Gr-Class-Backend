# GIRIK Platform Role-Based Access Control (RBAC) Documentation

This document outlines the permissions and responsibilities for each user role across all major modules in the GR-CLASS Backend.

---

## 1. Role Overview

| Role | Description | Core Responsibilities |
| :--- | :--- | :--- |
| **ADMIN** | System Administrator | User management, system configuration, audit logs, financial write-offs. |
| **GM** | General Manager | Business approvals, surveyor assignment, certificate issuance, high-level financial actions. |
| **TM** | Team Manager | Operations oversight, survey/job finalization, certificate lifecycle management (renewal/reissue), NC management. |
| **TO** | Technical Officer | Technical verification, document checking, survey review, technical NC management. |
| **SURVEYOR**| Field Inspector | On-site data collection, checklist submission, proof/evidence uploading. |
| **CLIENT** | Vessel Owner/Manager | Requesting jobs, tracking vessels, viewing certificates, making payments. |

---

## 2. Module Permissions

### **Jobs Module** (`src/modules/jobs`)
Central hub for vessel inspection requests.
- **CLIENT**: Create inspection requests, view own job status, send/receive external messages.
- **GM**: Approve/Reject requests, Assign/Reassign surveyors, reschedule jobs, update job priority.
- **TM**: Finalize non-survey jobs, Reject requests, Update priority, Authorize surveys.
- **TO**: Verify submitted documents (pre-approval), Technical review of completed surveys.
- **SURVEYOR**: View assigned jobs, read/send messages.

### **Surveys Module** (`src/modules/surveys`)
The technical execution of an inspection.
- **SURVEYOR**: Start survey, stream GPS, upload proof, submit checklists, draft survey statements, submit final report.
- **TM**: Finalize survey results, request reworks, flag violations, issue official survey statements.
- **GM**: View reports, request reworks.
- **TO**: View completed surveys and execution timelines.
- **ADMIN**: Audit access to all survey data.

### **Certificates Module** (`src/modules/certificates`)
Generation and lifecycle of maritime certificates.
- **GM**: **Issue** the final certificate, transfer, extend, or downgrade certificates.
- **TM**: Generate certificate **drafts**, suspend, revoke, restore, renew, or reissue (versioning).
- **ADMIN**: Manage certificate types and mandatory document requirements.
- **CLIENT / SURVEYOR**: Download issued PDF certificates, view history, and check validation status.

### **Non-Conformity (NC) Module** (`src/modules/non_conformities`)
Tracking regulatory failures found during surveys.
- **SURVEYOR / TO**: Raise/Create a new NC.
- **TM / TO**: **Close** an NC once the correction is verified.
- **ADMIN / GM**: Oversight of all active NCs across the fleet.

### **Payments & Invoicing** (`src/modules/payments`)
Financial tracking for services provided.
- **CLIENT**: View own invoices, list payments, and see financial summaries.
- **TM**: Create invoices, record partial payments, and mark as paid upon receipt.
- **GM**: Process refunds, view internal ledgers.
- **ADMIN**: Handle financial **write-offs** and full audit access.

### **Vessels Module** (`src/modules/vessels`)
Management of the vessel fleet.
- **CLIENT**: View details and list of their own fleet.
- **TM / GM / ADMIN**: Register new vessels, update vessel specifications, view vessels by client.
- **SURVEYOR**: View details of a vessel they are assigned to inspect.

### **Incidents Module** (`src/modules/incidents`)
Reporting unexpected accidents or events.
- **CLIENT / GM / TM**: Report a new incident.
- **TM / GM / ADMIN**: Manage incident status and add administrative remarks.
- **TO**: Viewing access for technical assessments.

### **Users Module** (`src/modules/users`)
Internal staff and client account management.
- **EVERYONE**: Update their own profile (`/me`), change profile pictures, update notification tokens.
- **ADMIN**: **Full management** — list all users, create new staff, update roles, suspend/activate accounts.

### **Change Requests Module** (`src/modules/change_requests`)
Requests to modify existing records or certificates.
- **CLIENT / ADMIN / GM / TM**: Create a new change request.
- **ADMIN / GM**: **Approve** or **Reject** the change request.
- **CLIENT**: View the status of their own requests.

### **Approvals & Workflow Module** (`src/modules/approvals`)
Generic multi-step approval management.
- **ADMIN / GM / TM**: Create approval records and update workflow steps.

### **Support Module** (`src/modules/support`)
Ticketing system for user assistance.
- **EVERYONE**: Create support tickets and view own tickets.
- **ADMIN / GM**: Manage ticket statuses and internal responses.

---

## 3. Workflow Specific Actions

### **Job Lifecycle Responsibilities**
1. **Creation**: `CLIENT` / `ADMIN`
2. **Technical Verification**: `TO`
3. **Approval & Assignment**: `GM`
4. **Execution**: `SURVEYOR`
5. **Technical Review**: `TO`
6. **Finalization**: `TM`
7. **Certificate Draft**: `TM`
8. **Final Issuance**: `GM`

### **Separation of Duties (S.o.D)**
The system enforces a **"Self-Approval" guard**: A user (e.g., a TM) cannot finalize or approve a survey they themselves performed or a job they assigned.
