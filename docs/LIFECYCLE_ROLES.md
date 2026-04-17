# GR-Class Lifecycle Role Matrix

This document defines which roles are authorized to perform specific status transitions and actions for Jobs and Surveys.

## 1. Job Lifecycle Permissions

| Job Status Transition | Authorized Roles | Implementation Detail |
| :--- | :--- | :--- |
| **CREATE** (Initial Request) | CLIENT, ADMIN, GM | Managed via `POST /api/v1/jobs` |
| **APPROVE** (`DOCUMENT_VERIFIED` → `APPROVED`) | ADMIN, GM | Managed via `PUT /api/v1/jobs/:id/approve-request` |
| **ASSIGN** (`APPROVED` → `ASSIGNED`) | ADMIN, GM | Reassign: `PUT .../reassign` |
| **AUTHORIZE** (`ASSIGNED` → `SURVEY_AUTHORIZED`) | **ADMIN, TM** | Source of truth: `src/config/rbac.config.js` → `RBAC.AUTHORIZE_SURVEY` |
| **SRT** (`SURVEY_AUTHORIZED` → `IN_PROGRESS`) | **SURVEYOR ONLY** | Triggered by the `startSurvey` check-in action |
| **SUBMIT** (`IN_PROGRESS` → `SURVEY_DONE`) | **SURVEYOR ONLY** | Triggered by the `submitSurvey` check-out action |
| **REVIEW** (`SURVEY_DONE` → `REVIEWED`) | ADMIN, TO | `PUT .../review` |
| **REWORK** (→ `REWORK_REQUESTED`) | ADMIN, TM, TO | Also via survey rework endpoints |
| **FINALIZE** (`REVIEWED` → `FINALIZED`) | Survey-driven (TM/ADMIN) or non-survey job finalize | See `lifecycle.service.js` |
| **PAYMENT** | N/A (job row) | **Payment state lives on** `payments.payment_status` **(e.g. PAID), not** `job_status`. `PAYMENT_DONE` may exist on legacy ENUMs but the app does **not** transition jobs through it. |
| **CERTIFY** (`FINALIZED` → `CERTIFIED`) | ADMIN, GM, TM | After PAID payment + compliance checks in `certificate.service.js` |

## 2. Survey Lifecycle Permissions

| Survey Status Transition | Authorized Roles | Implementation Detail |
| :--- | :--- | :--- |
| **SRT SURVEY** | **SURVEYOR ONLY** | Sets `started_at` timestamp |
| **UPDATE CHECKLIST** | **SURVEYOR ONLY** | Blocked if Survey is locked/finalized |
| **UPLOAD PROOF** | **SURVEYOR ONLY** | Blocked if Survey is locked/finalized |
| **SUBMIT SURVEY** | **SURVEYOR ONLY** | Requires Proof + Checklist; increments `submission_count` |
| **REQUEST REWORK** | GM, TM | Moves Survey to `REWORK_REQUIRED` |
| **FINALIZE SURVEY** | **TM, ADMIN** | Locks survey (`survey_status` = FINALIZED); enforced in `lifecycle.service.js` |

## 3. Advanced Guardrails

- **Terminal Immutability**: Once a Job is `CERTIFIED` or `REJECTED`, no further status changes are permitted for anyone (including ADMIN).
- **Survey Locking**: Once a Survey is `FINALIZED`, all data-modifying endpoints (proofs, checklists, submission) will return a 400 error.
- **Ownership Check**: For Surveyor actions (Start, Proof, Submit), the system validates that the `user_id` matches the `assigned_surveyor_id` on the Job.
- **Role Hierarchy**: While ADMIN has broad access, critical technical sign-offs (**Finalization** and **Certification**) are strictly reserved for the **Technical Manager (TM)** to ensure professional compliance.
