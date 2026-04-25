# Product Requirements Document (PRD)

**Product Name:** GR-Class — Marine Certification & Operations Management System
**Version:** 1.0
**Owner:** GR-Class Backend Team
**Last Updated:** April 2026
**Status:** Active / In-Production

---

## 1. Document Purpose

This PRD describes **what** the GR-Class platform is, **why** it exists, **who** uses it, and **what business outcomes** it must deliver. It is intended for product managers, engineering leads, designers, surveyors, and customer-facing teams.

For technical (system / architecture / API) details, see the companion document `SRS.md`.
For per-module ownership and access details, see `MODULES_GUIDE.md`.

---

## 2. Background & Problem Statement

Maritime classification societies are responsible for issuing safety / structural / statutory certificates for ships and offshore assets. Today, a typical class society relies on a fragmented mix of:

- Email threads to receive certification requests from ship-owners.
- Excel sheets to track which surveyor has been assigned which job.
- Word / PDF templates filled in by hand to produce certificates.
- Local file shares to keep proof photos, GPS records, and survey reports.
- Manual phone calls to escalate delays, non-conformities, and TOCA (Transfer of Class) cases.
- No verifiable public way for port states / flag states / charterers to confirm a certificate is genuine.

This produces five very expensive problems:

1. **Slow turnaround** between job request and certificate issue.
2. **Audit gaps** — no single source of truth for who did what, when.
3. **Forgery risk** — paper certificates can be tampered with.
4. **Surveyor fraud risk** — no way to prove a surveyor was physically on the vessel.
5. **No client self-service** — ship-owners cannot see status without phoning the office.

GR-Class is built to solve all five problems in a single system.

---

## 3. Product Vision

> **One auditable, role-based platform that takes a maritime certification job from request → assignment → on-site survey → review → signed certificate, with proof at every step and a public verification page for the world.**

The product must work for two parallel audiences:

- **Internal staff** (Admin, GM, TM, TO) running the class society.
- **External users** (Ship-owners, Surveyors, Public verifiers).

---

## 4. Goals & Success Metrics

### 4.1 Business Goals

| # | Goal | Measurable Outcome |
|---|------|--------------------|
| G1 | Reduce average job turnaround time | Job request → certificate issue ≤ **30 days** for standard surveys |
| G2 | Eliminate paper certificates | **100%** of new certificates issued as signed PDFs with public verify URL |
| G3 | Provide tamper-proof audit trail | Every state change traceable to a user + timestamp; full history retrievable |
| G4 | Provide client self-service | Ship-owners create jobs, view status, download certificates without contacting staff |
| G5 | Enforce surveyor accountability | Every survey submission carries GPS proof + photos + checklist |
| G6 | Comply with data regulation | Support GDPR-style export & anonymization on request |

### 4.2 Product Success Indicators

- ≥ 80% of new jobs are submitted by clients themselves (not by GM staff on their behalf).
- ≥ 95% of submitted surveys pass the GPS-proximity check on the first attempt.
- < 1% disputed certificates per quarter.
- 99.5% backend uptime.
- Public verify endpoint responds in < 500 ms.

---

## 5. Target Users & Personas

The system supports six distinct roles. Each has a clearly different mental model.

### 5.1 ADMIN — System Administrator
- **Who:** IT / compliance lead at the class society HQ.
- **Goals:** Keep the platform running, manage users and roles, enforce compliance, sign certificates of last resort, run reports.
- **Frustrations being solved:** No way today to disable a leaving employee’s access in real time; no GDPR export tool.

### 5.2 GM — General Manager
- **Who:** Business / operations head running the certification line.
- **Goals:** Approve incoming job requests, assign surveyors, watch the pipeline, sign and issue certificates, review financials and SLAs.
- **Frustrations being solved:** Today they must chase surveyors and TMs by phone — they want a single dashboard view.

### 5.3 TM — Technical Manager
- **Who:** Senior technical authority for a region or vessel-type.
- **Goals:** Maintain checklist templates and certificate templates, manage surveyor roster, finalize jobs, suspend / revoke / renew certificates.
- **Frustrations being solved:** Templates today live as scattered Word files; surveyors use outdated versions.

### 5.4 TO — Technical Officer
- **Who:** Document and field-review specialist.
- **Goals:** Verify the documents a client uploaded, review what the surveyor submitted, raise non-conformities (NCs), close them after correction.
- **Frustrations being solved:** Currently has to re-key information into spreadsheets to track NCs.

### 5.5 SURVEYOR — Marine Surveyor
- **Who:** Field engineer who physically inspects the vessel (often at port, sometimes at sea).
- **Goals:** See assigned jobs, fill checklists on a phone, capture GPS and photos as proof, submit reports.
- **Frustrations being solved:** Today they courier paper checklists back to the office and prove their presence with hotel receipts.

### 5.6 CLIENT — Ship Owner / Operator
- **Who:** Shipping company, fleet manager, or vessel owner.
- **Goals:** Raise inspection / certification requests, upload required documents, monitor progress, download certificates, pay invoices.
- **Frustrations being solved:** Today they must email and phone the class society for status updates.

A seventh, implicit “role” is **PUBLIC** — port state inspectors, charterers, insurers — who never log in but need to verify a certificate is authentic.

---

## 6. Scope (What the Product MUST Do)

### 6.1 In Scope (v1.0)

The following capabilities are **required**:

1. **User & Role Management** — Six roles, with row-level scoping (clients see only their own data; surveyors see only their own jobs).
2. **Client & Vessel Registry** — Ship-owners register; vessels are linked to flag states and tracked by IMO number.
3. **Job Request Lifecycle** — From client request to issued certificate, with explicit transitions and the right role gating each step.
4. **Surveyor Workflow** — Application → onboarding → assignment → on-site survey → submission, with GPS proof and photo evidence.
5. **Checklist Engine** — Configurable templates per vessel type / certificate type, completed by surveyor, scanned signed copies retained.
6. **Certificate Lifecycle** — Draft → issue → digitally signed PDF → public-verifiable → suspend / revoke / renew / reissue.
7. **Document Management** — Upload via pre-signed S3 URLs, attach to any entity, version-aware.
8. **Non-Conformity Management** — Raise, track, close NCs against a job.
9. **Approvals & Change Requests** — Multi-step internal approvals; client-initiated post-issue change requests.
10. **TOCA Workflow** — Transfer of Class requests between class societies.
11. **Notifications** — In-app + push (FCM) + email for material events.
12. **Public Verification** — Anyone can verify a certificate by number or vessel by IMO without logging in.
13. **Reports & Dashboards** — Role-aware dashboards plus exportable reports (financial, NC trends, surveyor productivity).
14. **Compliance Tools** — GDPR-style data export and anonymize.
15. **Website / Marketing Surface** — Public videos, static content, contact form, newsletter signup.
16. **Customer Support** — Ticketing for clients, with admin/GM triage.
17. **Background Jobs** — Daily expiry scans on certificates, SLA timers, notification fan-out.

### 6.2 Out of Scope (v1.0 — explicitly deferred)

- Mobile offline sync (was prototyped; module removed).
- Real-time chat between surveyor and client.
- AI-assisted anomaly detection (placeholder routes only).
- Automated payment gateway integration (invoicing is manual; gateway is future work).
- IoT sensor ingestion from the vessel.

---

## 7. Key User Journeys (End-to-End)

### Journey 1 — Client Requests a Certification

1. Client logs in, opens dashboard, clicks **“New Job Request”**.
2. Selects one of their registered vessels and the certificate type.
3. Uploads the required documents (the system tells them which ones based on certificate type).
4. Submits → status = `submitted`.

### Journey 2 — Internal Staff Approves and Assigns

1. **TO** opens the job, verifies the uploaded documents (`PUT /jobs/:id/verify-documents`).
2. **GM** approves the request (`PUT /jobs/:id/approve-request`).
3. **GM** assigns a surveyor and a date (`PUT /jobs/:id/assign`).
4. The assigned surveyor receives a push notification.

### Journey 3 — Surveyor Conducts the Survey

1. Surveyor logs into the mobile-friendly UI, sees the assigned job.
2. **Authorized** to start (`PUT /jobs/:id/authorize-survey`).
3. Goes on board, presses **Start Survey** which captures their GPS.
4. Walks through the checklist, photographs each item, captures signed scans.
5. Raises any NCs found.
6. Submits the survey (`POST /surveys`).

### Journey 4 — Review & Certify

1. **TO** reviews the submission (`PUT /jobs/:id/review`).
2. NCs are closed (`PUT /non-conformities/:id/close`).
3. **TM/GM** finalizes the job.
4. **TM** generates a certificate draft (`POST /certificates`).
5. **GM/ADMIN** issues and digitally signs it (`POST /certificates/:id/issue`, `POST /certificates/:id/sign`).
6. Client is notified.

### Journey 5 — Client Downloads & Public Verification

1. Client opens **Certificates** → preview / download PDF.
2. The PDF carries a QR code → resolves to `GET /public/certificate/verify/:number`.
3. A port-state inspector scans the QR, sees a valid signed entry.

### Journey 6 — Compliance Action (GDPR)

1. Client requests data export.
2. ADMIN runs `GET /compliance/export/:id`.
3. On user departure, ADMIN runs `POST /compliance/anonymize/:id`, which scrubs PII while preserving audit linkage.

---

## 8. Functional Requirements (High Level)

| # | Requirement | Priority |
|---|-------------|----------|
| FR-1 | Authenticated, role-based access for all internal data | Must |
| FR-2 | Public, unauthenticated certificate verification by number | Must |
| FR-3 | All file uploads via secure pre-signed URLs (no large body proxying through the API) | Must |
| FR-4 | Every job state transition writes an audit-history record | Must |
| FR-5 | Every survey submission carries GPS lat/lng + timestamp | Must |
| FR-6 | Certificates are PDF, QR-coded, and signed before issue | Must |
| FR-7 | Notifications fire on assignment, status change, certificate issue, and expiry | Must |
| FR-8 | Daily cron checks for certificates expiring in 30/60/90 days | Must |
| FR-9 | TM/GM can revoke or suspend a certificate with a reason | Must |
| FR-10 | Client can download their own certificate; cannot see others’ | Must |
| FR-11 | Client portfolio feedback is admin-moderated before going public | Should |
| FR-12 | TOCA (Transfer of Class) request flow between classification societies | Should |
| FR-13 | Bulk renewal of certificates by ADMIN/TM | Should |
| FR-14 | Global search across vessels, jobs, certificates, scoped by role | Should |
| FR-15 | Newsletter subscribe + admin broadcast | Could |
| FR-16 | Activity / Incident tracking outside the certification workflow | Could |

---

## 9. Non-Functional Requirements (Business Lens)

> Detailed thresholds live in `SRS.md` § Non-Functional Requirements. This section captures the **business expectation**.

- **Reliability:** The platform is the system of record for legally required certificates. It must not lose data and must remain auditable.
- **Performance:** UI feels instant for staff (≤ 1s typical); public verify is fast enough for a cargo agent on port-side mobile data.
- **Security:** Roles must be strictly enforced server-side, not just hidden in the UI. Sensitive actions (revoke, anonymize) require admin authority.
- **Compliance:** Support data export and anonymize. Keep an audit log for at least 7 years.
- **Usability:** Surveyors must be able to use the field UI on a phone in poor signal; clients must self-serve without training.
- **Internationalisation:** Certificates and templates support multiple locales (planned).

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| A surveyor submits a survey without actually being on the vessel | Loss of integrity | Mandatory GPS capture; geo-fence around vessel position; flagging suspicious submissions |
| A revoked certificate continues to be presented as valid | Legal / safety risk | Public verify endpoint always returns the live status; QR code resolves to live page |
| Insider misuses role to issue a fraudulent certificate | Catastrophic | RBAC + separation of duties (`preventSelfApproval`); full audit log; ADMIN-only revoke |
| Client uploads malware as a document | Security risk | S3 storage + content-type validation + size limits |
| Database loss | Operational | Backups, migrations versioned, environment separation |
| Email / SMS / push outage | Notification gap | In-app notifications stored in DB regardless; resend supported |

---

## 11. Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| GR-Class executive team | Operational efficiency, audit-readiness |
| Surveyors | Easy field tool that doesn’t fail in poor connectivity |
| Ship-owners | Self-service status visibility, fast certificate delivery |
| Port states / Flag states | Trustable public verification |
| Compliance & Legal | GDPR, ISO 9001 audit trail |
| Engineering | Maintainable monolith with a clear modular structure |

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **ADMIN / GM / TM / TO** | Internal staff roles (see § 5) |
| **SURVEYOR** | Marine surveyor, conducts field inspections |
| **CLIENT** | Ship owner / operator |
| **IMO Number** | Unique identifier of a vessel issued by the International Maritime Organization |
| **NC** | Non-Conformity — a deficiency found during a survey |
| **TOCA** | Transfer of Class — a vessel moving from one classification society to another |
| **Certificate Authority (CA)** | The legal issuing entity behind a class certificate |
| **Geo-fence** | A virtual radius around the vessel’s declared position used to validate that the surveyor is actually on board |
| **QR Verify** | The QR code printed on every certificate that resolves to a public verification page |

---

*See `SRS.md` for the technical specification and `MODULES_GUIDE.md` for the module-by-module purpose and RBAC reference.*
