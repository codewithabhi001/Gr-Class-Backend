# GR-CLASS: Comprehensive Technical & Functional SRS

## 1. System Blueprint

### Core Tech Stack

- **Backend**: Node.js (v20+), Express.js (v5)
- **Database**: MySQL 8.0 (Sequelize ORM)
- **Caching**: Redis
- **Cloud**: AWS (S3 for documents, SES for Email)
- **Mobile Support**: Optimized API for offline-first surveyor apps.

---

## 2. User Roles & Permission Matrix
The system uses **Role-Based Access Control (RBAC)**. Each role has a specific "Data Scope".

| Role | Meaning | Responsibilities | Data Scope |
| :--- | :--- | :--- | :--- |
| `ADMIN` | Administrator | Total system control, user management, system config. | Global |
| `GM` | Gen. Manager | Business flows, Client/Surveyor onboarding, Job Approval. | Global |
| `TM` | Tech. Manager | Technical oversight, Final Survey Approval, Cert Issuance. | Global |
| `TO` | Tech. Officer | **Document Verification**, Technical review of checklists. | Global |
| `SURVEYOR`| Inspector | Performing vessel surveys, uploading reports. | Assigned Jobs Only |
| `CLIENT` | Ship Owner | Vessel management, requesting surveys, cert downloads. | Own Organization Only |

> [!NOTE]
> `FLAG_ADMIN` is a reserved scope for external regulatory oversight and is currently managed via specialized Flag State modules, but it is not a direct system login role in the current DB schema.

---

## 3. The "Engine": Workflow Cycles

### 3.1 Job Request Lifecycle
This is the primary state machine of the application.
```mermaid
graph TD
    CREATED("CREATED (Client/GM)") --> DOC_VERIF("DOCUMENT_VERIFIED (TO)")
    DOC_VERIF --> APPROVED("APPROVED (GM/ADMIN)")
    APPROVED --> ASSIGNED("ASSIGNED (GM - Select Surveyor)")
    ASSIGNED --> SURV_AUTH("SURVEY_AUTHORIZED (TM)")
    SURV_AUTH --> IN_PROGRESS("IN_PROGRESS (Surveyor Checked-In)")
    IN_PROGRESS --> SURV_DONE("SURVEY_DONE (Surveyor Submitted)")
    SURV_DONE --> REVIEWED("REVIEWED (TO Technical Review)")
    REVIEWED --> FINALIZED("FINALIZED (TM Final Approval)")
    FINALIZED --> PAY_DONE("PAYMENT_DONE (Finance)")
    PAY_DONE --> CERTIFIED("CERTIFIED (System Generated)")
    
    %% Rejection/Rework paths
    DOC_VERIF -.-> REJECTED
    SURV_DONE -.-> REWORK_REQ("REWORK_REQUESTED (TM/TO)")
    REWORK_REQ -.-> IN_PROGRESS
```

### 3.2 Activity & Change Request Funnels
Before a Job is created, or when data needs updating, these auxiliary workflows apply:

**Activity Request (Sales/Commercial):**
`DRAFT` → `PENDING` → `APPROVED` → `CONVERTED_TO_JOB` (or `REJECTED`)

**Change Request (Audit Trail):**
`PENDING` (User Request) → `APPROVED` (Admin/GM sets new value) or `REJECTED`


### 3.2 Surveyor Field Workflow (Hybrid Digital-Physical)

To satisfy maritime legal requirements for wet signatures on complex layouts, the system uses a hybrid approach:

1. **Check-in**: Surveyor hits `POST /surveys/start`. Start GPS and timestamp recorded.
2. **Digital Summary**: Surveyor marks high-level sections (e.g., Hull, Engine) as Pass/Fail in the app for instant reporting.
3. **Audit Flow**: Surveyor downloads master blank templates (`template_files` - JSON array), prints/signs them, and uploads scanned copies (`signed_checklist_files` - JSON array) per job.
4. **Signature**: Surveyor and Vessel Master sign and stamp the physical papers.
5. **Digitization**: Surveyor uploads the scanned/photographed **Signed Checklists** to the job (`PUT /surveys/jobs/:id/signed-checklist`).
6. **Check-out**: Surveyor submits the final survey report.

---

## 4. Module API Reference

### 4.1 Authentication (`/auth`)

- `POST /auth/login`: Identity verification.
- `POST /auth/refresh-token`: Renew short-lived access tokens.
- `POST /auth/logout`: Revoke tokens and clear cookies.
- `POST /auth/forgot-password`: Email-based reset.

### 4.2 Job Management (`/jobs`)

| Method   | Endpoint                  | Description                           | Roles             |
| :------- | :------------------------ | :------------------------------------ | :---------------- |
| `GET`  | `/`                     | List jobs with status/client filters. | All (Scoped)      |
| `POST` | `/`                     | Request a new survey/cert.            | CLIENT, GM, ADMIN |
| `PUT`  | `/:id/verify-documents` | Mark docs as checked.                 | TO                |
| `PUT`  | `/:id/approve-request`  | Approve for surveyor assignment.      | GM                |
| `PUT`  | `/:id/assign`           | Link a Surveyor to the job.           | GM                |
| `PUT`  | `/:id/authorize-survey` | Unlocks survey flow for surveyor.     | TM                |
| `PUT`  | `/:id/review`           | Mark technical review complete.       | TO                |
| `PUT`  | `/:id/finalize`         | Final signature before billing.       | TM, GM            |
| `PUT`  | `/:id/priority`         | Update job urgency (URGENT/NORMAL).   | GM, TM            |

### 4.3 Survey Operations (`/surveys`)

- `POST /surveys/start`: Record check-in coordinates.
- `POST /surveys/jobs/:id/proof`: Upload evidence photo (S3).
- `POST /surveys/jobs/:id/location`: Stream GPS pings during inspection.
- `POST /surveys/jobs/:id/sync`: Bulk upload offline-cached data.
- `PUT /surveys/jobs/:id/finalize`: TM command to lock the report.

### 4.4 Certification Engine (`/certificates`)

- `GET /certificates/types`: List available certs (e.g., Annual, Interim).
- `POST /certificates/`: Generate a draft from job data.
- `POST /certificates/:id/issue`: Converts draft to official Signed PDF.
- `GET /certificates/verify/:number`: Public endpoint for QR verification.
- `PUT /certificates/:id/renew`: Start renewal workflow (extends expiry).

### 4.5 Client & Vessel Management (`/vessels`, `/clients`)

- `GET /vessels`: List vessels (Filter by Flag, Age, Client).
- `POST /vessels`: Register new vessel info + IMO number.
- `GET /clients/:id`: View company details & primary contacts.
- `PUT /clients/:id/status`: Suspend/Activate organization.

### 4.6 Supporting Modules
- **Non-Conformities (NC)**: `POST /nc` (Create deficiency), `PUT /nc/:id/close` (Verify rectification).
- **Checklists**: `GET /checklist-templates` (Static definitions) vs `PUT /checklists/jobs/:id` (Surveyor input).
- **Dashboard**: `GET /dashboard` (Role-specific counters for Pending Tasks, Expiring Certs, Revenue).
- **Support**: `POST /support/tickets` (Issue reporting for clients/surveyors).
- **Notifications**: `GET /notifications` (In-app alerts for job status changes).

### 4.7 Commercial & Audit Trail Modules
- **Activity Requests**: `POST /activity-requests` (Client inquiry for non-standard services).
- **Change Requests**: `POST /change-requests` (Formal vessel/cert data correction with admin approval).
- **Approvals**: `POST /approvals` (Generalized multi-step approval engine for complex entities).

### 4.8 Technical Oversight (TOCA)
- **Transfer of Class (TOCA)**: `POST /toca` (Manage vessel records when gaining or losing class).
- **Incidents**: `POST /incidents` (Report vessel casualties or detentions).

### 4.9 Collaboration & Communication
- **Job Messaging**: `POST /jobs/:id/messages` (Contextual chat between Client/Surveyor/Admin).
- **Internal Notes**: `POST /jobs/:id/notes` (Private management comments visible to TM/GM).
- **Documents Module**: `GET /documents/:entityType/:id` (Universal file access across the system).

### 4.10 Website & CMS
- **Static Content**: `GET /site-static/:slug` (Manage Terms of Service, FAQ, Policy text).
- **Video CMS**: `POST /website/videos` (Manage portfolio/training videos).
- **Newsletter**: `POST /website/newsletter/subscribe` (Marketing funnel).

---

## 5. Technical Constraints for Frontend Implementation

### 5.1 Success/Error Handling

The backend always responds with a standardized wrapper:

- **Status 200/201**: Success. `json.success = true`.
- **Status 400**: Validation Error (Check `json.message` for Joi details).
- **Status 401/403**: Auth/RBAC issues.
- **Status 404**: Item not found.

### 5.2 Document Uploads

The backend uses **Pre-signed URLs** for maximum performance.

1. Frontend requests `GET /api/v1/certificates/upload-url`.
2. Backend returns an S3 `uploadUrl` and a `fileKey`.
3. Frontend performs `PUT` to AWS S3 directly.
4. Frontend notifies Backend with `fileKey` in the final `POST`.

### 5.3 Offline Synchronization

Surveyors often work in areas with 0 connectivity. The Frontend should:

- Cache Checklist data locally (IndexedDB/Redux Persist).
- Store GPS points with timestamps.
- Use `POST /surveys/jobs/:id/sync` to replay the entire session once online.

---

## 6. Role-Based Navigation Mapping (Checklist)

### Client Panel

- [ ] View Dashboard (My Vessels, Active Jobs).
- [ ] Request New Job.
- [ ] Upload Vessel Supporting Docs.
- [ ] Download Issued Certificates.

### Admin/Manager Panel (GM/TM)

- [ ] List all Client Requests (New).
- [ ] Assign Surveyors (Map integration recommended).
- [ ] Review Surveyor Submissions (Photo gallery view).
- [ ] Audit Logs & Report Builder.

### Surveyor Panel (The "Field Unit")

- [ ] View Assigned Jobs Calendar.
- [ ] Interactive Checklists (Toggle switch for Pass/Fail).
- [ ] Camera Integration (Evidence).

---

## 7. Complete Route Dictionary (Exhaustive List)

| Module | Method | Path | Roles |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/login` | Public |
| | POST | `/auth/refresh-token` | Public |
| | POST | `/auth/logout` | All |
| | POST | `/auth/forgot-password` | Public |
| | POST | `/auth/reset-password` | Public |
| | POST | `/auth/change-password` | All |
| **Users** | GET | `/users/me` | All |
| | PUT | `/users/me` | All |
| | GET | `/users` | ADMIN |
| | POST | `/users` | ADMIN |
| | PUT | `/users/:id` | ADMIN |
| | PUT | `/users/:id/status` | ADMIN |
| | PUT | `/users/profile-pic` | All |
| | PUT | `/users/fcm-token` | All |
| **Vessels** | GET | `/vessels` | All (Scoped) |
| | POST | `/vessels` | ADMIN, GM, TM |
| | GET | `/vessels/:id` | All (Scoped) |
| | PUT | `/vessels/:id` | ADMIN, GM, TM |
| | GET | `/vessels/client/:clientId`| ADMIN, GM, TM |
| **Jobs** | GET | `/jobs` | All (Scoped) |
| | POST | `/jobs` | CLIENT, ADMIN, GM |
| | GET | `/jobs/:id` | All (Scoped) |
| | PUT | `/jobs/:id/verify-documents` | TO |
| | PUT | `/jobs/:id/approve-request` | GM |
| | PUT | `/jobs/:id/assign` | GM |
| | PUT | `/jobs/:id/authorize-survey` | TM, ADMIN |
| | PUT | `/jobs/:id/review` | TO |
| | PUT | `/jobs/:id/finalize` | TM, GM |
| | PUT | `/jobs/:id/reschedule` | GM |
| | PUT | `/jobs/:id/priority` | GM, TM |
| | GET | `/jobs/:id/history` | ADMIN, GM, TM, TO |
| | POST | `/jobs/:id/notes` | ADMIN, GM, TM, TO |
| | POST | `/jobs/:id/messages` | All (Scoped) |
| | GET | `/jobs/:id/eligible-surveyors`| ADMIN, GM, TM |
| **Surveys** | POST | `/surveys/start` | SURVEYOR |
| | POST | `/surveys/jobs/:id/proof` | SURVEYOR |
| | POST | `/surveys/jobs/:id/location` | SURVEYOR |
| | POST | `/surveys/jobs/:id/sync` | SURVEYOR |
| | PUT | `/surveys/jobs/:id/signed-checklist`| SURVEYOR |
| | POST | `/surveys/` | SURVEYOR (Submit) |
| | PUT | `/surveys/jobs/:id/finalize` | TM |
| | PUT | `/surveys/jobs/:id/rework` | GM, TM |
| | POST | `/surveys/jobs/:id/statement/issue`| TM |
| **Checklists**| GET | `/checklist-templates` | ADMIN, GM, TM |
| | POST | `/checklist-templates` | ADMIN |
| | PUT | `/checklist-templates/:id`| ADMIN |
| | GET | `/checklists/jobs/:id` | All (Scoped) |
| | PUT | `/checklists/jobs/:id` | SURVEYOR |
| **Certificates**| GET | `/certificates/types` | All (Scoped) |
| | POST | `/certificates` | TM, GM |
| | POST | `/certificates/:id/issue` | GM |
| | GET | `/certificates/:id/download`| All (Scoped) |
| | PUT | `/certificates/:id/suspend` | TM |
| | PUT | `/certificates/:id/revoke` | TM |
| | PUT | `/certificates/:id/renew` | TM |
| | POST | `/certificates/:id/reissue`| TM |
| | GET | `/certificates/verify/:num`| Public |
| **Activity** | POST | `/activity-requests` | CLIENT, ADMIN, GM, TM |
| | GET | `/activity-requests` | All (Scoped) |
| | PUT | `/activity-requests/:id/status`| ADMIN, GM, TM |
| **Change Req**| POST | `/change-requests` | All (Scoped) |
| | PUT | `/change-requests/:id/approve`| ADMIN, GM |
| **NC** | POST | `/nc` | SURVEYOR, TO |
| | PUT | `/nc/:id/close` | TO, TM |
| | GET | `/nc/job/:jobId` | All (Scoped) |
| **Incidents** | POST | `/incidents` | CLIENT, ADMIN, GM, TM |
| | GET | `/incidents` | All (Scoped) |
| **TOCA** | POST | `/toca` | TM |
| | GET | `/toca` | ADMIN, GM, TM |
| **Clients** | GET | `/clients` | ADMIN, GM, TM, TO |
| | POST | `/clients` | ADMIN, GM, TM |
| | PUT | `/clients/:id/status` | ADMIN, GM |
| **Documents** | GET | `/documents/:type/:id` | All (Scoped) |
| | POST | `/documents/register` | All |
| | GET | `/documents/get-upload-url`| All |
| **Payments** | GET | `/payments` | ADMIN, GM, TM |
| | POST | `/payments` | ADMIN, CLIENT |
| **System** | GET | `/system/health` | All |
| | GET | `/system/audit-logs` | ADMIN |
| | GET | `/system/metrics` | ADMIN |
| **Website** | POST | `/website/newsletter/subscribe`| Public |
| | POST | `/website/videos` | ADMIN |
| | GET | `/site-static/:slug` | Public |
| **Feedback** | POST | `/feedback` | CLIENT |
| | GET | `/feedback/public` | Public |
| | PATCH | `/feedback/:id/visibility`| ADMIN |
| **Search** | GET | `/search` | All |
| **Dashboard** | GET | `/dashboard` | All |
