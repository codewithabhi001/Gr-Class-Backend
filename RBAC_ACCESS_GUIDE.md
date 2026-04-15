# GR-Class Maritime Certification System — RBAC Access Guide

> **Purpose:** This document defines exactly what each role can **see**, **do**, and **change** in the system.
> Use this as the primary reference for frontend access control and UI rendering decisions.

---

## 📑 Table of Contents

1. [Roles Overview](#roles-overview)
2. [Role-by-Role Access Guide](#role-by-role-access-guide)
   - [ADMIN](#1-admin--system-administrator)
   - [GM — General Manager](#2-gm--general-manager)
   - [TM — Technical Manager](#3-tm--technical-manager)
   - [TO — Technical Officer](#4-to--technical-officer)
   - [SURVEYOR](#5-surveyor)
   - [CLIENT](#6-client--shipowner)
3. [Module-wise Access Matrix](#module-wise-access-matrix)
4. [Job Lifecycle — Who Does What](#job-lifecycle--who-does-what)
5. [Frontend Implementation Notes](#frontend-implementation-notes)

---

## Roles Overview

| Role Code  | Full Name             | Description |
|------------|-----------------------|-------------|
| `ADMIN`    | System Administrator  | Full system access. Manages users, roles, system config, compliance |
| `GM`       | General Manager       | Oversees operations. Approves jobs, assigns surveyors, manages payments |
| `TM`       | Technical Manager     | Manages surveyors, checklists, templates, certificate lifecycle |
| `TO`       | Technical Officer     | Reviews surveys, verifies documents, raises NCs |
| `SURVEYOR` | Marine Surveyor       | Conducts on-site inspections, submits surveys and checklists |
| `CLIENT`   | Ship Owner / Operator | Creates job requests, views own vessel certs and status |

---

## Role-by-Role Access Guide

---

### 1. ADMIN — System Administrator

> Full access to everything. The only role that can perform destructive or compliance-sensitive actions.

#### ✅ What ADMIN Can Do

**User Management**
- Create, update, disable, and permanently delete any user account
- Force-logout any user session
- View all users in the system

**Client Management**
- Create, update, and delete client accounts
- View all client profiles and documents

**Vessel Management**
- Create, update vessels

**Job Management**
- Create job requests
- Approve or reject jobs
- Assign and reassign surveyors
- Reschedule jobs
- Finalize, send back, cancel, or reject jobs
- Update job priority
- Add internal notes
- View full job history and all messages

**Survey & Checklist**
- Review and approve submitted surveys
- View all checklists

**Certificates**
- Generate certificate drafts
- Issue and sign certificates
- Suspend, revoke, restore, renew, reissue, or bulk-renew certificates
- Create and manage certificate types and their required documents
- Manage Certificate Authorities (create, update, delete)
- Upload external certificates

**Payments**
- Create invoices
- Mark payments as paid
- Process refunds
- Record partial payments
- View full payment ledger
- Write off bad debt

**System Operations**
- View audit logs, metrics, feature flags, migration status
- Retry failed background jobs
- Trigger maintenance actions
- Manage system locales

**Compliance (GDPR)**
- Export any user's data
- Anonymize any user's data

**Content Management**
- Create, update, delete static pages, email templates
- Create, update flag state records
- Publish/manage newsletter and website videos
- Toggle portfolio feedback visibility

**Checklist Templates**
- Create, update, assign, delete checklist templates

---

### 2. GM — General Manager

> Operational oversight role. Can approve, assign, and manage the core job lifecycle.

#### ✅ What GM Can Do

**Job Lifecycle (Key Actions)**
- ✅ Approve job requests (`PUT /jobs/:id/approve-request`)
- ✅ Assign surveyor to job (`PUT /jobs/:id/assign`)
- ✅ Reassign surveyor (`PUT /jobs/:id/reassign`)
- ✅ Reschedule job (`PUT /jobs/:id/reschedule`)
- ✅ Finalize job after survey (`PUT /jobs/:id/finalize`)
- ✅ Reject jobs (`PUT /jobs/:id/reject`)
- ✅ Cancel jobs (`PUT /jobs/:id/cancel`)
- ✅ Update job priority
- ✅ View internal messages and job history
- ✅ Add internal notes

**Certificates**
- ✅ Generate certificate drafts
- ✅ Issue and sign certificates
- ✅ Upload external certificates
- ✅ View all certificates and expiring certificates

**Clients & Vessels**
- ✅ Create, view, update clients and vessels

**Payments**
- ✅ Create invoices, process refunds, view ledger, record partial payments
- ✅ View financial summary

**Reports**
- ✅ View certificate, surveyor, NC, and financial reports

**Change Requests**
- ✅ Approve or reject change requests

**Feedback & Enquiries**
- ✅ View all client feedback and contact enquiries

#### ❌ What GM Cannot Do
- Cannot delete users, clients permanently
- Cannot access compliance/GDPR tools
- Cannot manage system operations (audit logs, metrics)
- Cannot create/delete checklist templates or certificate types

---

### 3. TM — Technical Manager

> Technical authority. Manages surveyor lifecycle, checklist templates, and certificate management.

#### ✅ What TM Can Do

**Surveyor Management**
- ✅ Create surveyor accounts directly (`POST /surveyors`)
- ✅ Review and approve/reject surveyor applications
- ✅ Activate/deactivate surveyor status
- ✅ Update surveyor profiles
- ✅ View GPS history of surveyors

**Checklist Templates**
- ✅ Create and update checklist templates
- ✅ Assign templates to vessel types and certificate types
- ✅ View template master files

**Certificates**
- ✅ Generate drafts, update drafts
- ✅ Suspend, revoke, restore, renew, reissue, bulk-renew certificates
- ✅ Manage certificate type required documents
- ✅ Upload external certificates

**Job Lifecycle**
- ✅ Finalize jobs
- ✅ Send jobs back for correction
- ✅ Reject jobs
- ✅ Cancel jobs
- ✅ View job history, internal messages, add notes

**Surveys**
- ✅ Review and approve submitted surveys

**Reports**
- ✅ Access all reports

**Payments**
- ✅ Create invoices, record partial payments

#### ❌ What TM Cannot Do
- Cannot issue or sign certificates (only ADMIN/GM can issue and sign)
- Cannot approve job requests (only GM/ADMIN)
- Cannot assign surveyors to jobs (only GM/ADMIN)
- Cannot delete users or checklist templates

---

### 4. TO — Technical Officer

> Field review role. Reviews survey submissions, verifies documents, and raises non-conformities.

#### ✅ What TO Can Do

**Job Actions**
- ✅ Verify job documents (`PUT /jobs/:id/verify-documents`) — **primary action**
- ✅ Review completed survey (`PUT /jobs/:id/review`) — **primary action**
- ✅ Send job back for correction

**Non-Conformities**
- ✅ Create NC findings (`POST /non-conformities`)
- ✅ Close / resolve NCs after corrections (`PUT /non-conformities/:id/close`)
- ✅ View all NCs for a job

**Surveys**
- ✅ Review and approve survey submissions

**Access (View Only)**
- ✅ View jobs, vessels, clients, documents, checklists, certificates
- ✅ View internal job messages
- ✅ View dashboard

#### ❌ What TO Cannot Do
- Cannot create, approve, assign, finalize, or cancel jobs
- Cannot generate or issue certificates
- Cannot manage users, surveyors, or payments
- Cannot access reports or system admin features

---

### 5. SURVEYOR

> On-site survey execution role. Works only on jobs assigned to them.

#### ✅ What SURVEYOR Can Do

**Survey Work**
- ✅ Create and update survey records for their job
- ✅ Add findings/observations to survey
- ✅ Submit final survey (`POST /surveys/submit`)

**Checklist**
- ✅ View checklist assigned to their job
- ✅ Submit completed checklist (`PUT /checklists/jobs/:jobId`)
- ✅ Upload signed physical checklist scan (`PUT /templates/:id/upload-signed`)

**Job Communication**
- ✅ View and send external job messages
- ✅ View job details (their assigned jobs)

**Profile & Availability**
- ✅ Update own availability schedule
- ✅ Report live GPS location
- ✅ View own profile

**Documents**
- ✅ Get upload URLs and upload documents for jobs

#### ❌ What SURVEYOR Cannot Do
- Cannot create, approve, finalize, or cancel jobs
- Cannot generate or view certificates
- Cannot access client data, payments, or reports
- Cannot access any administrative features
- Cannot see internal messages between staff

---

### 6. CLIENT — Ship Owner / Operator

> External client role. Can only see their own vessels, jobs, and certificates.

#### ✅ What CLIENT Can Do

**Self Service**
- ✅ View and update own profile
- ✅ View own dashboard (`GET /clients/dashboard`)
- ✅ View own documents

**Job Management**
- ✅ Create new survey/inspection job requests
- ✅ View their own jobs and status
- ✅ Cancel their own jobs
- ✅ View and send external (non-internal) messages on their jobs

**Vessels & Certificates**
- ✅ View their registered vessels
- ✅ View and download their vessel certificates
- ✅ Preview certificate PDF

**Feedback**
- ✅ Submit job feedback/ratings
- ✅ Submit and view portfolio feedback

**Payments**
- ✅ View their own payment records and invoices

**Support & Contact**
- ✅ Submit support tickets and contact enquiries
- ✅ Submit activity/change requests
- ✅ Upload supporting documents for jobs

#### ❌ What CLIENT Cannot Do
- Cannot see other clients' data
- Cannot see internal messages, notes, or audit history  
- Cannot assign surveyors, approve, finalize, or manage jobs
- Cannot generate certificates or access any admin features
- Cannot see other vessels' certificates

---

## Module-wise Access Matrix

> ✅ = Full Access | 👁 = View Only | 🔒 = No Access | 🎯 = Specific Actions Only

| Module                | ADMIN | GM  | TM  | TO  | SURVEYOR | CLIENT |
|-----------------------|-------|-----|-----|-----|----------|--------|
| Auth / Login          | ✅    | ✅  | ✅  | ✅  | ✅       | ✅     |
| User Management       | ✅    | 🔒  | 🔒  | 🔒  | 🔒       | 🔒     |
| Client Management     | ✅    | ✅  | 👁  | 👁  | 🔒       | 🎯     |
| Vessel Management     | ✅    | ✅  | ✅  | 👁  | 👁       | 👁     |
| Surveyor Management   | ✅    | 👁  | ✅  | 🔒  | 🎯       | 🔒     |
| Jobs                  | ✅    | ✅  | 🎯  | 🎯  | 🎯       | 🎯     |
| Surveys               | ✅    | ✅  | ✅  | 🎯  | ✅       | 🔒     |
| Checklists            | ✅    | ✅  | ✅  | 🔒  | ✅       | 🔒     |
| Checklist Templates   | ✅    | 👁  | ✅  | 🔒  | 👁       | 🔒     |
| Certificates          | ✅    | ✅  | ✅  | 👁  | 🔒       | 👁     |
| Cert Authorities      | ✅    | 👁  | 🔒  | 🔒  | 🔒       | 🔒     |
| Documents             | ✅    | ✅  | ✅  | 👁  | ✅       | ✅     |
| Non-Conformities      | ✅    | ✅  | ✅  | ✅  | ✅       | 🔒     |
| Incidents             | ✅    | ✅  | ✅  | 👁  | 🔒       | ✅     |
| Payments              | ✅    | ✅  | 🎯  | 🔒  | 🔒       | 👁     |
| Reports               | ✅    | ✅  | ✅  | 🔒  | 🔒       | 🔒     |
| Notifications         | ✅    | ✅  | ✅  | ✅  | ✅       | ✅     |
| Approvals             | ✅    | ✅  | ✅  | 🔒  | 🔒       | 🔒     |
| Activity Requests     | ✅    | ✅  | ✅  | 👁  | 🔒       | ✅     |
| Change Requests       | 🔒    | ✅  | 🔒  | 🔒  | 🔒       | ✅     |
| TOCA                  | ✅    | ✅  | ✅  | 🔒  | 🔒       | 🔒     |
| Flags                 | ✅    | 👁  | 🔒  | 👁  | 🔒       | 🔒     |
| Feedback              | ✅    | ✅  | 🔒  | 🔒  | 🔒       | ✅     |
| Dashboard             | ✅    | ✅  | ✅  | ✅  | ✅       | ✅     |
| Compliance (GDPR)     | ✅    | 🔒  | 🔒  | 🔒  | 🔒       | 🎯     |
| System / Audit        | ✅    | 🔒  | 🔒  | 🔒  | 🔒       | 🔒     |
| Templates             | ✅    | 👁  | 👁  | 🔒  | 🔒       | 🔒     |
| Newsletter            | ✅    | 🔒  | 🔒  | 🔒  | 🔒       | 🔒     |
| Website / Videos      | ✅    | 🔒  | 🔒  | 🔒  | 🔒       | 🔒     |
| Support Tickets       | ✅    | ✅  | 🔒  | 🔒  | 🔒       | ✅     |

---

## Job Lifecycle — Who Does What

```
CLIENT creates job request
       ↓
TO verifies submitted documents  ──→  TO: PUT /jobs/:id/verify-documents
       ↓
GM/ADMIN approves job request    ──→  GM: PUT /jobs/:id/approve-request
       ↓
GM assigns surveyor to job       ──→  GM: PUT /jobs/:id/assign
       ↓
GM reschedules if needed         ──→  GM: PUT /jobs/:id/reschedule
       ↓
SURVEYOR is authorized to start  ──→  AUTH_SURVEY role: PUT /jobs/:id/authorize-survey
       ↓
SURVEYOR conducts on-site survey
  → Creates survey record        ──→  SURVEYOR: POST /surveys
  → Fills checklist              ──→  SURVEYOR: PUT /checklists/jobs/:jobId
  → Adds findings                ──→  SURVEYOR: POST /surveys/:id/findings
  → Raises NCs if any            ──→  SURVEYOR/TO: POST /non-conformities
  → Submits survey               ──→  SURVEYOR: POST /surveys/submit
       ↓
TO reviews submitted survey      ──→  TO: PUT /jobs/:id/review
  → Closes NCs after correction  ──→  TO/TM: PUT /non-conformities/:id/close
       ↓
TM/GM finalizes job              ──→  TM/GM: PUT /jobs/:id/finalize
       ↓
TM/ADMIN generates certificate   ──→  TM: POST /certificates
  → Updates draft                ──→  TM: PUT /certificates/:id
       ↓
GM/ADMIN issues certificate      ──→  GM: POST /certificates/:id/issue
       ↓
GM/ADMIN signs certificate       ──→  GM: POST /certificates/:id/sign
       ↓
CLIENT downloads certificate     ──→  CLIENT: GET /certificates/:id/download
```

---

## Frontend Implementation Notes

### 🔐 Auth & Token Handling
- Store `accessToken` in memory (not localStorage) for security
- Store `refreshToken` in httpOnly cookie
- Call `POST /auth/refresh-token` automatically when access token expires (401 response)
- Clear all tokens on logout

### 👁 Conditional UI Rendering by Role

```js
// Example: Show "Assign Surveyor" button only for GM and ADMIN
const canAssign = ['ADMIN', 'GM'].includes(user.role);

// Example: Show "Submit Survey" only for SURVEYOR
const canSubmitSurvey = user.role === 'SURVEYOR';

// Example: Show certificate actions based on role
const canIssueCert   = ['ADMIN', 'GM'].includes(user.role);
const canRevokeCert  = ['ADMIN', 'TM'].includes(user.role);
```

### 📋 Job Detail Page — Action Buttons by Role

| Action Button         | Shown To              |
|-----------------------|-----------------------|
| Verify Documents      | TO, ADMIN             |
| Approve Request       | GM, ADMIN             |
| Assign Surveyor       | GM, ADMIN             |
| Reschedule            | GM, ADMIN             |
| Finalize              | TM, GM, ADMIN         |
| Send Back             | TO, TM, ADMIN         |
| Reject                | GM, TM, ADMIN         |
| Cancel                | CLIENT, GM, TM, ADMIN |
| Add Internal Note     | TO, TM, GM, ADMIN     |
| Internal Messages Tab | TO, TM, GM, ADMIN     |
| External Messages Tab | All roles             |

### 🏆 Certificate Actions — Visibility

| Action              | Roles |
|---------------------|-------|
| Generate Draft      | ADMIN, GM, TM |
| Issue Certificate   | ADMIN, GM |
| Sign Certificate    | ADMIN, GM |
| Suspend             | ADMIN, TM |
| Revoke              | ADMIN, TM |
| Restore             | ADMIN, TM |
| Renew / Bulk Renew  | ADMIN, TM |
| Reissue             | ADMIN, TM |
| Download / Preview  | All roles |

### 🚫 Routes to Protect on Frontend

These routes should **redirect to 403/dashboard** if user doesn't have the required role:

| Route                     | Minimum Role |
|---------------------------|--------------|
| `/admin/users`            | ADMIN        |
| `/admin/system`           | ADMIN        |
| `/admin/compliance`       | ADMIN        |
| `/admin/newsletter`       | ADMIN        |
| `/reports`                | GM           |
| `/surveys/review`         | TO           |
| `/checklists/templates`   | TM           |
| `/surveyors/applications` | TM, ADMIN    |

---

*Last Updated: April 2026 | GR-Class Backend Team*
