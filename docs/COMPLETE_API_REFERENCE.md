# GR-CLASS Backend — Complete API Reference

> **For**: Frontend & QA/Tester Teams  
> **Base URL**: `/api/v1`  
> **Last Updated**: April 2026

---

## Table of Contents

1. [Roles Overview](#1-roles-overview)
2. [Auth Module](#2-auth-module)
3. [Users Module](#3-users-module)
4. [Clients Module](#4-clients-module)
5. [Vessels Module](#5-vessels-module)
6. [Jobs Module](#6-jobs-module)
7. [Surveys Module](#7-surveys-module)
8. [Checklists Module](#8-checklists-module)
9. [Checklist Templates Module](#9-checklist-templates-module)
10. [Certificates Module](#10-certificates-module)
11. [Certificate Authorities Module](#11-certificate-authorities-module)
12. [Non-Conformities (NC) Module](#12-non-conformities-nc-module)
13. [Payments Module](#13-payments-module)
14. [Incidents Module](#14-incidents-module)
15. [Activity Requests Module](#15-activity-requests-module)
16. [Change Requests Module](#16-change-requests-module)
17. [Approvals Module](#17-approvals-module)
18. [TOCA Module](#18-toca-module)
19. [Surveyors Module](#19-surveyors-module)
20. [Documents Module](#20-documents-module)
21. [Feedback Module](#21-feedback-module)
22. [Portfolio Feedback Module](#22-portfolio-feedback-module)
23. [Notifications Module](#23-notifications-module)
24. [Dashboard Module](#24-dashboard-module)
25. [Search Module](#25-search-module)
26. [Reports Module](#26-reports-module)
27. [Flags Module](#27-flags-module)
28. [Templates Module](#28-templates-module)
29. [Support Module](#29-support-module)
30. [Compliance Module](#30-compliance-module)
31. [System Module](#31-system-module)
32. [Public Module](#32-public-module)
33. [Website / CMS Module](#33-website--cms-module)
34. [Newsletter Module](#34-newsletter-module)
35. [Site Static Content Module](#35-site-static-content-module)
36. [Contact Module](#36-contact-module)

---

## 1. Roles Overview

| Role | Code | Description |
| :--- | :--- | :--- |
| System Admin | `ADMIN` | Full system control — user management, configuration, audit logs. |
| General Manager | `GM` | Business approvals, surveyor assignment, certificate issuance. |
| Team Manager | `TM` | Operations oversight, survey finalization, certificate lifecycle. |
| Technical Officer | `TO` | Document verification, technical review post-survey. |
| Surveyor | `SURVEYOR` | Field inspection — checklist, GPS, photo, evidence capture. |
| Client (Vessel Owner) | `CLIENT` | Service requester — creates jobs, views certificates, pays invoices. |

---

## 2. Auth Module

**Why**: Handles login, logout, password management, and token refresh for all users.

**Base Path**: `/api/v1/auth`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/login` | 🌐 Public | Authenticate with email + password. Returns access + refresh tokens. Rate-limited (10 attempts / 15 min). |
| 2 | `POST` | `/logout` | 🔒 Any Authenticated | Invalidates current access token (adds to blacklist). |
| 3 | `POST` | `/refresh-token` | 🌐 Public | Exchange a valid refresh token for a new access token. Rate-limited (30 / 15 min). |
| 4 | `POST` | `/forgot-password` | 🌐 Public | Send a password-reset OTP to the user's registered email. |
| 5 | `POST` | `/reset-password` | 🌐 Public | Verify OTP and set new password. |
| 6 | `POST` | `/change-password` | 🔒 Any Authenticated | Change password while logged in (requires current password). |

---

## 3. Users Module

**Why**: Manage internal staff accounts (ADMIN, GM, TM, TO, SURVEYOR) and client user accounts.

**Base Path**: `/api/v1/users`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/me` | 🔒 Any Authenticated | Get own profile details. |
| 2 | `PUT` | `/me` | 🔒 Any Authenticated | Update own profile (name, phone, etc.). |
| 3 | `PUT` | `/profile-pic` | 🔒 Any Authenticated | Upload a new profile picture (multipart). |
| 4 | `PUT` | `/fcm-token` | 🔒 Any Authenticated | Register/update Firebase Cloud Messaging token for push notifications. |
| 5 | `GET` | `/` | `ADMIN` | List all users in the system. |
| 6 | `POST` | `/` | `ADMIN` | Create a new user account (staff or client). |
| 7 | `PUT` | `/:id` | `ADMIN` | Update another user's details (name, role, email). |
| 8 | `PUT` | `/:id/status` | `ADMIN` | Activate, suspend, or deactivate a user account. |
| 9 | `DELETE` | `/:id` | `ADMIN` | Permanently delete a user record. |

---

## 4. Clients Module

**Why**: Manage client company profiles. A "Client" is a shipping company that owns vessels and requests inspections.

**Base Path**: `/api/v1/clients`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/profile/documents` | `CLIENT` | Client views their own company documents. |
| 2 | `POST` | `/` | `ADMIN`, `GM`, `TM` | Register a new client company. |
| 3 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `TO` | List all client companies. |
| 4 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `TO` | Get details of a specific client company. |
| 5 | `GET` | `/:id/documents` | `ADMIN`, `GM`, `TM`, `TO` | View documents uploaded by a specific client. |
| 6 | `PUT` | `/:id` | `ADMIN`, `GM`, `TM` | Update client company details. |
| 7 | `DELETE` | `/:id` | `ADMIN` | Delete a client company record. |

---

## 5. Vessels Module

**Why**: Manage the fleet of vessels that are inspected and certified. Every job is tied to a vessel.

**Base Path**: `/api/v1/vessels`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `TO`, `CLIENT` | List vessels. Clients see only their own fleet. |
| 2 | `GET` | `/client/:clientId` | `ADMIN`, `GM`, `TM` | Get all vessels owned by a specific client company. |
| 3 | `POST` | `/` | `ADMIN`, `GM`, `TM` | Register a new vessel (IMO number, name, type, etc.). |
| 4 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR`, `CLIENT` | Get full details of a specific vessel. |
| 5 | `PUT` | `/:id` | `ADMIN`, `GM`, `TM` | Update vessel specifications. |

---

## 6. Jobs Module

**Why**: The core workflow engine. A "Job" represents a request for vessel inspection/certification. It flows through statuses: `CREATED` → `DOCUMENT_VERIFIED` → `APPROVED` → `ASSIGNED` → `SURVEY_AUTHORIZED` → `IN_PROGRESS` → `SURVEY_DONE` → `REVIEWED` → `FINALIZED` → `CERTIFIED`.

**Note**: Payment is a **parallel compliance gate**. While an invoice can be created at any stage, the system only allows certificate generation once the payment status is `PAID`.

**Base Path**: `/api/v1/jobs`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | List jobs. Clients see own vessels only; Surveyors see assigned jobs only. Supports filters: `status`, `vessel_id`, `certificate_type_id`, `created_from`, `created_to`. |
| 2 | `GET` | `/:id` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Full job details including vessel info, status history, survey data, payment status, and certificate link. |
| 3 | `POST` | `/` | `CLIENT`, `ADMIN`, `GM` | Create a new inspection request. Validates mandatory documents and vessel `ACTIVE` status. |
| 4 | `GET` | `/:id/eligible-surveyors` | `ADMIN`, `GM`, `TM` | Returns surveyors matching the job's vessel type and certificate authority requirements. Shows eligible vs ineligible with reasons. |
| 5 | `PUT` | `/:id/verify-documents` | `TO` | Technical Officer verifies uploaded documents. Moves: `CREATED` → `DOCUMENT_VERIFIED`. |
| 6 | `PUT` | `/:id/approve-request` | `GM` | Business approval. Records `approved_by_user_id`. Moves: `DOCUMENT_VERIFIED` → `APPROVED`. |
| 7 | `PUT` | `/:id/finalize` | `GM`, `TM` | Closes job for certification. Blocks if any NC is still OPEN. Moves → `FINALIZED`. |
| 8 | `PUT` | `/:id/assign` | `GM` | Assigns a surveyor. Runs Authorization Matrix check (vessel type + cert authority + availability). Moves: `APPROVED` → `ASSIGNED`. |
| 9 | `PUT` | `/:id/reassign` | `GM` | Swaps surveyor without changing job status. Syncs the linked survey record too. |
| 10 | `PUT` | `/:id/reschedule` | `GM` | Changes target port/date. Logs the old values. Notifies assigned surveyor. Only allowed before `IN_PROGRESS`. |
| 11 | `PUT` | `/:id/authorize-survey` | `TM`, `GM`, `ADMIN` | Final operational clearance for surveyor. Moves: `ASSIGNED` → `SURVEY_AUTHORIZED`. |
| 12 | `PUT` | `/:id/review` | `TO` | Post-survey technical review. Moves: `SURVEY_DONE` → `REVIEWED`. |
| 13 | `PUT` | `/:id/send-back` | `TM`, `TO` | Request surveyor to redo their work. Moves → `REWORK_REQUESTED`. |
| 14 | `PUT` | `/:id/reject` | `GM`, `TM` | Terminates the job. GM can reject at `CREATED` only; TM at `ASSIGNED`, `SURVEY_DONE`, `REVIEWED`. |
| 15 | `PUT` | `/:id/cancel` | `CLIENT`, `GM`, `TM`, `ADMIN` | Withdraw/cancel a job request. Cannot cancel terminal-state jobs. |
| 16 | `PUT` | `/:id/priority` | `GM`, `TM` | Set job priority (URGENT, HIGH, NORMAL, LOW). |
| 17 | `GET` | `/:id/history` | `ADMIN`, `GM`, `TM`, `TO` | Full audit trail of every status change (who, when, reason). |
| 18 | `POST` | `/:id/notes` | `ADMIN`, `GM`, `TM`, `TO` | Add private internal notes (not visible to Client). |
| 19 | `GET` | `/:id/messages/external` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Shared chat visible to all parties including Client. |
| 20 | `GET` | `/:id/messages/internal` | `ADMIN`, `GM`, `TM`, `TO` | Private staff-only messaging. Client CANNOT see these. |
| 21 | `POST` | `/:id/messages` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Send a message with optional file attachment. |

---

## 7. Surveys Module

**Why**: Manages the physical inspection execution done by surveyors on-site. Tracks GPS, checklists, evidence, and final report submission.

**Base Path**: `/api/v1/surveys`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/start` | `SURVEYOR` | Check-in at the vessel. Records start GPS and timestamp. Job must be `SURVEY_AUTHORIZED`. |
| 2 | `POST` | `/jobs/:jobId/proof` | `SURVEYOR` | Upload evidence proof (photo/document). Survey must have checklist submitted first. |
| 3 | `POST` | `/jobs/:jobId/location` | `SURVEYOR` | Stream live GPS coordinates during the inspection. |
| 4 | `GET` | `/jobs/:jobId/signed-checklist-upload-url` | `SURVEYOR` | Get pre-signed S3 URL for uploading a signed/stamped checklist scan. |
| 5 | `PUT` | `/jobs/:jobId/signed-checklist` | `SURVEYOR` | Save the S3 keys of the uploaded signed checklist documents. |
| 6 | `POST` | `/jobs/:jobId/sync` | `SURVEYOR` | Offline sync — batch upload checklist answers and GPS points captured without connectivity. |
| 7 | `POST` | `/` | `SURVEYOR` | Final survey report submission. Requires GPS, attendance photo, and generates an immutable SHA-256 declaration hash. |
| 8 | `PUT` | `/jobs/:jobId/finalize` | `TM` | Finalize survey. Checks all NCs are closed. Separation-of-duties enforced. |
| 9 | `PUT` | `/jobs/:jobId/rework` | `GM`, `TM` | Request the surveyor to redo the survey. Moves survey → `REWORK_REQUIRED`. |
| 10 | `POST` | `/jobs/:jobId/violation` | `TM` | Flag suspicious behavior. Logs to audit trail and alerts ADMIN. |
| 11 | `POST` | `/jobs/:jobId/statement/draft` | `SURVEYOR`, `TM` | Draft a survey statement (findings text). TM can trigger background PDF generation. |
| 12 | `POST` | `/jobs/:jobId/statement/issue` | `TM` | Issue the official survey statement with signed PDF. |
| 13 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `TO` | List all survey reports with pagination and filters. |
| 14 | `GET` | `/jobs/:jobId/timeline` | `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Full execution timeline with GPS trace and status history. |
| 15 | `GET` | `/jobs/:jobId` | `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get survey details for a specific job. |

---

## 8. Checklists Module

**Why**: Manages the digital inspection checklist that surveyors fill during a survey.

**Base Path**: `/api/v1/checklists`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/jobs/:jobId` | 🔒 Any Authenticated | Get the checklist questions and answers for a specific job. |
| 2 | `PUT` | `/jobs/:jobId` | `SURVEYOR` | Submit/update checklist answers. |
| 3 | `GET` | `/jobs/:jobId/get-upload-url` | `SURVEYOR` | Get pre-signed S3 URL for uploading checklist-related files. |

---

## 9. Checklist Templates Module

**Why**: Admin-managed templates that define what checklist questions a surveyor must fill for each certificate type.

**Base Path**: `/api/v1/checklist-templates`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `ADMIN` | Create a new checklist template with questions. |
| 2 | `GET` | `/get-upload-url` | `ADMIN` | Get pre-signed URL for uploading template PDFs. |
| 3 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `SURVEYOR` | List all templates. Filterable by `status` and `certificate_type_id`. |
| 4 | `GET` | `/job/:jobId/download` | `SURVEYOR`, `ADMIN`, `GM`, `TM`, `TO` | Download auto-filled checklist DOCX for a specific job. |
| 5 | `GET` | `/job/:jobId` | `SURVEYOR`, `ADMIN`, `GM`, `TM`, `TO` | Get the template assigned to a specific job's certificate type. |
| 6 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `SURVEYOR` | Get a specific template by ID. |
| 7 | `PUT` | `/:id` | `ADMIN` | Update template details and questions. |
| 8 | `PUT` | `/:id/activate` | `ADMIN` | Activate or deactivate a template. |
| 9 | `POST` | `/:id/clone` | `ADMIN` | Clone an existing template to create a new version. |
| 10 | `DELETE` | `/:id` | `ADMIN` | Soft-delete a checklist template. |

---

## 10. Certificates Module

**Why**: Manages the full lifecycle of maritime certificates — from draft generation to issuance, renewal, suspension, and revocation.

**Base Path**: `/api/v1/certificates`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/verify/:number` | 🌐 Public | Verify a certificate by its number. No authentication required. |
| 2 | `GET` | `/types` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | List all certificate types (e.g., Safety, Cargo, Load Line). |
| 3 | `POST` | `/types` | `ADMIN` | Create a new certificate type definition. |
| 4 | `GET` | `/types/:id` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get details of a specific certificate type. |
| 5 | `PUT` | `/types/:id` | `ADMIN`, `TM` | Update certificate type metadata. |
| 6 | `GET` | `/types/:id/required-documents` | `ADMIN`, `TM` | List mandatory documents for a certificate type. |
| 7 | `POST` | `/types/:id/required-documents` | `ADMIN`, `TM` | Add a mandatory document requirement. |
| 8 | `PUT` | `/types/:id/required-documents/:docId` | `ADMIN`, `TM` | Update a mandatory document requirement. |
| 9 | `DELETE` | `/types/:id/required-documents/:docId` | `ADMIN`, `TM` | Remove a mandatory document requirement. |
| 10 | `GET` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | List certificates (`?expiring_within_days=30` for expiring soon). |
| 11 | `GET` | `/upload-url` | `ADMIN`, `GM`, `TM` | Get pre-signed S3 URL for uploading certificate-related files. |
| 13 | `POST` | `/vessel/:vesselId/external` | `ADMIN`, `GM`, `TM` | Upload an externally-issued certificate for a vessel. |
| 14 | `GET` | `/vessel/:vesselId` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get all certificates for a specific vessel. |
| 15 | `GET` | `/job/:jobId` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get the certificate generated from a specific job. |
| 16 | `POST` | `/` | `TM`, `GM` | Generate a new certificate DRAFT for a finalized job. |
| 17 | `PUT` | `/:id` | `TM`, `GM` | Update draft certificate details before issuance. |
| 18 | `POST` | `/:id/issue` | `GM` | **ISSUE** the certificate. Generates the final PDF with QR code. |
| 19 | `GET` | `/:id` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get specific certificate details. |
| 20 | `GET` | `/:id/download` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Download the certificate PDF file. |
| 21 | `PUT` | `/:id/suspend` | `TM` | Temporarily suspend a certificate. |
| 22 | `PUT` | `/:id/revoke` | `TM` | Permanently revoke a certificate. |
| 23 | `PUT` | `/:id/restore` | `TM` | Restore a suspended certificate back to active. |
| 24 | `PUT` | `/:id/renew` | `TM` | Renew an expiring certificate with new dates. |
| 25 | `POST` | `/bulk-renew` | `TM` | Batch renew multiple certificates at once. |
| 26 | `POST` | `/:id/reissue` | `TM` | Reissue a certificate (increments version, revokes old). |
| 27 | `GET` | `/:id/preview` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Preview the certificate without downloading. |
| 28 | `GET` | `/:id/history` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | View full version history and status change audit trail. |
| 29 | `POST` | `/:id/transfer` | `GM` | Transfer a certificate to a different vessel (ownership change). |
| 30 | `POST` | `/:id/extend` | `GM` | Extend certificate validity period. |
| 31 | `PUT` | `/:id/downgrade` | `GM` | Downgrade certificate conditions. |

---

## 11. Certificate Authorities Module

**Why**: Manage the issuing authorities (organizations) that are referenced on certificates (e.g., Flag States, IMO bodies).

**Base Path**: `/api/v1/certificates/authorities`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | `ADMIN`, `GM` | List all certificate authorities. |
| 2 | `POST` | `/` | `ADMIN` | Register a new certificate authority. |
| 3 | `GET` | `/upload-logo` | `ADMIN` | Get pre-signed S3 URL for authority logo upload. |
| 4 | `GET` | `/:id` | `ADMIN`, `GM` | Get details of a specific authority. |
| 5 | `PUT` | `/:id` | `ADMIN` | Update authority details. |
| 6 | `DELETE` | `/:id` | `ADMIN` | Delete a certificate authority record. |

---

## 12. Non-Conformities (NC) Module

**Why**: Track regulatory failures found during inspections. An open NC blocks job finalization and certificate issuance.

**Base Path**: `/api/v1/non-conformities`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `SURVEYOR`, `TO` | Raise a new NC during or after a survey. Triggers alerts to TM and TO. |
| 2 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `TO` | List all NCs with filters (`job_id`, `status`). |
| 3 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get details of a specific NC. |
| 4 | `PUT` | `/:id/close` | `TO`, `TM` | Close an NC after corrective action is verified. Records `closure_remarks` and `closed_at`. |
| 5 | `GET` | `/job/:jobId` | `ADMIN`, `GM`, `TM`, `TO`, `SURVEYOR` | Get all NCs linked to a specific job. |

---

## 13. Payments Module

**Why**: Handles the complete financial lifecycle of a job, including invoicing, progressive payment collection (advances, installments), and ledger-based accounting.

**Work of the API**:
- **Anytime Invoicing**: Invoices can be generated as soon as a job is `CREATED`, enabling deposit collection before work begins.
- **Progressive Collection**: Support for multiple payments against a single invoice (e.g., 30% advance, 70% completion).
- **Compliance Guard**: Automatically blocks certificate issuance if the invoice is not fully `PAID`.
- **Financial Audit**: Every transaction creates a ledger entry for full transparency.

**Base Path**: `/api/v1/payments`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM` | List all payments/invoices. Shows `amount`, `amount_collected`, `remaining`, and `payment_status` (`UNPAID`, `PARTIALLY_PAID`, `PAID`). |
| 2 | `GET` | `/summary` | `CLIENT`, `ADMIN`, `GM` | Overall financial metrics: Total Invoiced, Total Collected, Total Refunded, and Pending Balance. |
| 3 | `GET` | `/:id` | `CLIENT`, `ADMIN`, `GM`, `TM` | Detailed invoice info including job links and enriched financial data from the ledger. |
| 4 | `POST` | `/invoice` | `ADMIN`, `GM`, `TM` | Create a new invoice for a job. **Flexible**: Can be created at any active stage from `CREATED` to `FINALIZED`. |
| 5 | `PUT` | `/:id/pay` | `ADMIN`, `GM`, `TM` | Mark an invoice as fully paid (Admin override). Logs a final settlement entry in the ledger. |
| 6 | `POST` | `/:id/refund` | `ADMIN`, `GM` | Record a refund. Creates a negative adjustment in the financial ledger. |
| 7 | `POST` | `/:id/partial` | `ADMIN`, `GM`, `TM` | **Progressive Collection**: Record a payment (type: `ADVANCE` or `PARTIAL_PAYMENT`). Auto-updates invoice to `PAID` once the total collected meets the invoice amount. |
| 8 | `GET` | `/:id/ledger` | `ADMIN`, `GM`, `TM` | View the step-by-step transaction history for a specific invoice. |
| 9 | `POST` | `/writeoff` | `ADMIN` | Zero out an unpaid invoice and move it to `ON_HOLD`. Used for bad debt or cancelled jobs. |

---

## 14. Incidents Module

**Why**: Report and manage unexpected vessel events, accidents, or technical failures.

**Base Path**: `/api/v1/incidents`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM` | Report a new incident for a vessel. |
| 2 | `GET` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO` | List all incidents. Clients see only their vessels. |
| 3 | `GET` | `/:id` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO` | Get details of a specific incident. |
| 4 | `PUT` | `/:id/status` | `ADMIN`, `GM`, `TM` | Update incident status and add remarks. |

---

## 15. Activity Requests Module

**Why**: Handle operational activity requests like additional inspections, schedule changes, or special surveys.

**Base Path**: `/api/v1/activity-requests`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM` | Create a new activity request. |
| 2 | `GET` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO` | List all requests. |
| 3 | `GET` | `/:id` | `CLIENT`, `ADMIN`, `GM`, `TM`, `TO` | Get details of a specific request. |
| 4 | `PUT` | `/:id/status` | `ADMIN`, `GM`, `TM` | Approve, reject, or update request status. |

---

## 16. Change Requests Module

**Why**: Formal requests to modify existing job data, certificates, or vessel records through an approval flow.

**Base Path**: `/api/v1/change-requests`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `CLIENT`, `ADMIN`, `GM`, `TM` | Submit a change request. |
| 2 | `GET` | `/` | `ADMIN`, `GM`, `TM` | List all pending change requests. |
| 3 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `CLIENT` | Get change request details. |
| 4 | `PUT` | `/:id/approve` | `ADMIN`, `GM` | Approve the change request. |
| 5 | `PUT` | `/:id/reject` | `ADMIN`, `GM` | Reject the change request. |

---

## 17. Approvals Module

**Why**: Generic multi-step workflow approval engine used across various modules.

**Base Path**: `/api/v1/approvals`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `ADMIN`, `GM`, `TM` | Create a new approval workflow record. |
| 2 | `PUT` | `/:id/step` | `ADMIN`, `GM`, `TM` | Advance or update a specific step in the approval chain. |

---

## 18. TOCA Module

**Why**: Manages Transfer of Class Authority — when a vessel's classification responsibility transfers between organizations.

**Base Path**: `/api/v1/toca`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `TM` | Create a new TOCA record. |
| 2 | `PUT` | `/:id/status` | `TM`, `ADMIN` | Update TOCA status (approve, reject, finalize). |
| 3 | `GET` | `/` | `ADMIN`, `GM`, `TM` | List all TOCA records. |

---

## 19. Surveyors Module

**Why**: Manage surveyor profiles, applications, authorizations, availability, and GPS tracking.

**Base Path**: `/api/v1/surveyors`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/get-upload-url` | 🌐 Public | Get pre-signed URLs for uploading application documents. Rate-limited. |
| 2 | `POST` | `/apply` | 🌐 Public | Submit a surveyor application with credentials and documents. Rate-limited. |
| 3 | `GET` | `/` | `ADMIN`, `GM`, `TM` | List all registered surveyors. |
| 4 | `POST` | `/` | `ADMIN`, `TM` | Manually create a new surveyor profile. |
| 5 | `GET` | `/applications` | `ADMIN`, `TM` | List pending surveyor applications for review. |
| 6 | `PUT` | `/applications/:id/review` | `TM`, `ADMIN` | Approve or reject a surveyor application. |
| 7 | `PUT` | `/:id/status` | `ADMIN`, `TM` | Suspend or activate a surveyor. |
| 8 | `GET` | `/:id/profile` | `ADMIN`, `TM`, `SURVEYOR`, `GM` | View surveyor profile (certifications, authorized ship types, etc.). |
| 9 | `PUT` | `/:id/profile` | `ADMIN`, `TM` | Update surveyor profile and authorizations. |
| 10 | `POST` | `/availability` | `SURVEYOR` | Toggle availability status (online/offline). |
| 11 | `POST` | `/location` | `SURVEYOR` | Report current GPS location. |
| 12 | `GET` | `/:id/location-history` | `ADMIN`, `TM`, `GM` | View GPS history for a specific surveyor. |

---

## 20. Documents Module

**Why**: Centralized document management system — upload, view, and manage files attached to any entity (vessel, job, client, etc.).

**Base Path**: `/api/v1/documents`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/get-upload-url` | `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR` | Get a pre-signed S3 URL for direct browser upload. |
| 2 | `POST` | `/upload` | `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR` | Upload a standalone file via multipart. |
| 3 | `POST` | `/register` | `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR` | Register an already-uploaded S3 key as a document. |
| 4 | `GET` | `/:id` | All Roles | Get document metadata and download URL. |
| 5 | `GET` | `/:entityType/:entityId` | All Roles | List all documents for an entity (e.g., `/vessel/123` or `/job/456`). |
| 6 | `POST` | `/:entityType/:entityId` | `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR` | Upload documents directly attached to an entity. |
| 7 | `POST` | `/:entityType/:entityId/register` | `CLIENT`, `ADMIN`, `GM`, `TM`, `SURVEYOR` | Register pre-uploaded files to an entity. |
| 8 | `DELETE` | `/:id` | `ADMIN`, `GM` | Delete a document record. |

---

## 21. Feedback Module

**Why**: Captures client satisfaction feedback after a job completion.

**Base Path**: `/api/v1/feedback`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `CLIENT` | Submit feedback/rating for a completed job. |
| 2 | `GET` | `/` | `ADMIN`, `GM` | List all submitted feedback entries. |
| 3 | `GET` | `/:id` | `ADMIN`, `GM` | Get a specific feedback entry. |
| 4 | `GET` | `/job/:jobId` | `ADMIN`, `GM`, `CLIENT` | Get feedback for a specific job. |

---

## 22. Portfolio Feedback Module

**Why**: Manages public-facing testimonials/reviews displayable on the company portfolio website.

**Base Path**: `/api/v1/portfolio-feedback`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/public` | 🌐 Public | Get all visible testimonials for the portfolio website. |
| 2 | `POST` | `/` | `CLIENT` | Submit or update portfolio feedback/testimonial. |
| 3 | `GET` | `/my-feedback` | `CLIENT` | Client views their own submitted testimonial. |
| 4 | `GET` | `/` | `ADMIN`, `GM` | List all portfolio feedback entries (visible + hidden). |
| 5 | `PATCH` | `/:id/visibility` | `ADMIN` | Toggle whether a testimonial appears on the public website. |

---

## 23. Notifications Module

**Why**: Push notification management — lists, reads, and clears notifications for the logged-in user.

**Base Path**: `/api/v1/notifications`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | 🔒 Any Authenticated | Get own notifications (paginated). |
| 2 | `PUT` | `/:id/read` | 🔒 Any Authenticated | Mark a specific notification as read. |
| 3 | `PUT` | `/read-all` | 🔒 Any Authenticated | Mark all notifications as read. |

---

## 24. Dashboard Module

**Why**: Returns role-specific aggregated statistics and KPIs for the home dashboard.

**Base Path**: `/api/v1/dashboard`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | All Roles | Returns dashboard data customized per role (e.g., Client sees their vessel count, GM sees pending approvals, Surveyor sees assigned jobs). |

---

## 25. Search Module

**Why**: Global cross-module search — finds jobs, vessels, certificates, and clients from a single query.

**Base Path**: `/api/v1/search`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | 🔒 Any Authenticated | Global search across all entities. Results are scoped by user role. |

---

## 26. Reports Module

**Why**: Generate analytical reports for management oversight — certificate stats, surveyor performance, NC trends, and financials.

**Base Path**: `/api/v1/reports`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/certificates` | `ADMIN`, `GM`, `TM` | Certificate issuance, expiry, and status distribution report. |
| 2 | `GET` | `/surveyors` | `ADMIN`, `GM`, `TM` | Surveyor performance and workload report. |
| 3 | `GET` | `/non-conformities` | `ADMIN`, `GM`, `TM` | NC trends, severity distribution, and resolution time report. |
| 4 | `GET` | `/financials` | `ADMIN`, `GM`, `TM` | Revenue, invoicing, and payment collection report. |

---

## 27. Flags Module

**Why**: Manage maritime flag administrations (country registries that vessels are registered under).

**Base Path**: `/api/v1/flags`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `ADMIN` | Create a new flag administration entry. |
| 2 | `GET` | `/` | `ADMIN`, `GM`, `TM`, `TO` | List all flag administrations. |
| 3 | `GET` | `/:id` | `ADMIN`, `GM`, `TM`, `TO` | Get details of a specific flag. |
| 4 | `PUT` | `/:id` | `ADMIN` | Update a flag administration entry. |

---

## 28. Templates Module

**Why**: Manage reusable checklist/form templates for inspections.

**Base Path**: `/api/v1/templates`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | `ADMIN` | Create a new template. |
| 2 | `GET` | `/` | `ADMIN`, `GM`, `TM` | List all templates. |
| 3 | `GET` | `/:id` | `ADMIN`, `GM`, `TM` | Get template details. |
| 4 | `PUT` | `/:id` | `ADMIN` | Update template. |
| 5 | `DELETE` | `/:id` | `ADMIN` | Delete a template. |

---

## 29. Support Module

**Why**: Internal ticketing system for users to report issues, request help, or submit queries.

**Base Path**: `/api/v1/support`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | 🔒 Any Authenticated | Create a new support ticket. |
| 2 | `GET` | `/` | 🔒 Any Authenticated | List own support tickets. |
| 3 | `GET` | `/:id` | 🔒 Any Authenticated | Get details of a specific ticket. |
| 4 | `PUT` | `/:id/status` | `ADMIN`, `GM` | Update ticket status (resolve, close, escalate). |
| 5 | `PUT` | `/:id` | `ADMIN`, `GM` | Update ticket details. |

---

## 30. Compliance Module

**Why**: GDPR and data governance — export user data or anonymize records upon request.

**Base Path**: `/api/v1/compliance`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/export/:id` | `ADMIN`, `CLIENT` | Export all data related to a user (GDPR data subject request). |
| 2 | `POST` | `/anonymize/:id` | `ADMIN` | Anonymize a user's personal data (right to erasure). |

---

## 31. System Module

**Why**: Health checks, audit logs, and system administration tools for DevOps and ADMIN users.

**Base Path**: `/api/v1/system`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/health` | 🔒 Any Authenticated | System health check endpoint. |
| 2 | `GET` | `/readiness` | 🔒 Any Authenticated | Readiness probe (DB, Redis, S3 connectivity). |
| 3 | `GET` | `/version` | 🔒 Any Authenticated | Current API version and build info. |
| 4 | `GET` | `/metrics` | `ADMIN` | System performance metrics. |
| 5 | `GET` | `/audit-logs` | `ADMIN` | View all audit log entries. |
| 6 | `POST` | `/users/:id/logout` | `ADMIN` | Force logout a specific user (invalidate their tokens). |
| 7 | `GET` | `/migrations` | `ADMIN` | View database migration status. |
| 8 | `GET` | `/jobs/failed` | `ADMIN` | View failed background jobs. |
| 9 | `POST` | `/jobs/:id/retry` | `ADMIN` | Retry a failed background job. |
| 10 | `POST` | `/maintenance/:action` | `ADMIN` | Trigger maintenance actions (cache clear, etc.). |
| 11 | `GET` | `/feature-flags` | `ADMIN` | View feature flag configuration. |
| 12 | `GET` | `/locales` | `ADMIN` | View available localization strings. |

---

## 32. Public Module

**Why**: Unauthenticated endpoints for external verification and website content.

**Base Path**: `/api/v1/public`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/certificate/verify/:number` | 🌐 Public | Verify a certificate's authenticity by number. |
| 2 | `GET` | `/vessel/:imo` | 🌐 Public | Look up a vessel by IMO number. |
| 3 | `GET` | `/website/videos` | 🌐 Public | Get portfolio showcase videos. |

---

## 33. Website / CMS Module

**Why**: Content management for the public-facing portfolio website — videos and static page management.

**Base Path**: `/api/v1/website`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/videos` | 🌐 Public | List published portfolio videos. |
| 2 | `POST` | `/videos` | `ADMIN` | Upload a new showcase video with thumbnail. |
| 3 | `PUT` | `/videos/:id` | `ADMIN` | Update video details or replace file. |
| 4 | `DELETE` | `/videos/:id` | `ADMIN` | Delete a video. |

---

## 34. Newsletter Module

**Why**: Email newsletter subscription management and broadcast for the portfolio website.

**Base Path**: `/api/v1/website/newsletter`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/subscribe` | 🌐 Public | Subscribe to newsletter with email. |
| 2 | `POST` | `/unsubscribe` | 🌐 Public | Unsubscribe from newsletter. |
| 3 | `GET` | `/unsubscribe-one-click` | 🌐 Public | RFC 8058 one-click unsubscribe (GET). |
| 4 | `POST` | `/unsubscribe-one-click` | 🌐 Public | RFC 8058 one-click unsubscribe (POST). |
| 5 | `GET` | `/subscribers` | `ADMIN` | List all newsletter subscribers. |
| 6 | `POST` | `/send` | `ADMIN` | Broadcast a newsletter to all subscribers. |

---

## 35. Site Static Content Module

**Why**: CMS for static pages on the portfolio website — FAQ, About Us, Terms of Service, Privacy Policy, etc.

**Base Path**: `/api/v1/website/static-content`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | 🌐 Public (optional auth) | List published static pages. ADMINs also see draft pages. |
| 2 | `GET` | `/:slug` | 🌐 Public (optional auth) | Get a page by URL slug. ADMINs see unpublished pages too. |
| 3 | `POST` | `/` | `ADMIN` | Create a new static page. |
| 4 | `PUT` | `/:slug` | `ADMIN` | Update a page by slug. |
| 5 | `DELETE` | `/:slug` | `ADMIN` | Delete a page by slug. |
| 6 | `GET` | `/admin/:id` | `ADMIN` | Get a page by ID (admin view). |
| 7 | `PUT` | `/admin/:id` | `ADMIN` | Update a page by ID (admin view). |
| 8 | `DELETE` | `/admin/:id` | `ADMIN` | Delete a page by ID (admin view). |

---

## 36. Contact Module

**Why**: "Contact Us" form from the portfolio website — enquiry submission and admin management.

**Base Path**: `/api/v1/contact`

| # | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/` | 🌐 Public | Submit a contact enquiry (name, email, message). Sends auto-acknowledgement email. |
| 2 | `GET` | `/stats` | `ADMIN`, `GM` | Get enquiry statistics (total, new, responded). |
| 3 | `GET` | `/` | `ADMIN`, `GM` | List all enquiries with pagination. |
| 4 | `GET` | `/:id` | `ADMIN`, `GM` | Get enquiry details. |
| 5 | `PATCH` | `/:id/status` | `ADMIN`, `GM` | Update enquiry status (new → responded → closed). |
| 6 | `DELETE` | `/:id` | `ADMIN` | Delete an enquiry. |

---

## Legend

| Icon | Meaning |
| :--- | :--- |
| 🌐 Public | No authentication required |
| 🔒 Any Authenticated | Any logged-in user |
| `ROLE_NAME` | Only these specific roles can access |
