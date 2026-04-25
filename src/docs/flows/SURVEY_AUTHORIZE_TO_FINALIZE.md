# Flow: Authorize → Survey Submit → Rework Loop

This document covers the operational core of GR-Class:

> *From the moment a job is authorised for survey, through field execution
> and submission, the technical-review rework loop, all the way to a
> finalised survey.*

It's a **frontend-friendly reference** — every actor, endpoint, status
transition, guard, and edge case in one place — but it doubles as a
**backend consistency audit** (see §10).

**Audience:** Frontend team (Web + Mobile/Surveyor), QA, anyone wiring
GM / TM / Surveyor screens.
**Last verified:** 2026-04-25 against `lifecycle.service.js`,
`survey.service.js`, `checklist.service.js`, `job.service.js`.

---

## 1. Actors and the slice of the state machine they touch

| Role | What they do in this slice | Endpoint set |
|---|---|---|
| **TM / ADMIN** | Authorise a survey; finalise a submitted survey; request rework | `PUT /jobs/:id/authorize-survey`, `PUT /surveys/jobs/:jobId/finalize`, `PUT /surveys/jobs/:jobId/rework` |
| **GM** | Request rework | `PUT /surveys/jobs/:jobId/rework` |
| **SURVEYOR** | Check in, submit checklist, upload proof, submit final report; redo any of those after a rework | `POST /surveys/start`, `PUT /checklists/jobs/:jobId`, `POST /surveys/jobs/:jobId/proof`, `POST /surveys`, `POST /surveys/jobs/:jobId/location`, `POST /surveys/jobs/:jobId/sync` |

---

## 2. The two state machines (and how they interlock)

The system tracks **two** statuses:

- `JobRequest.job_status` — operational stage of the job
- `Survey.survey_status` — execution stage of the field survey

`lifecycle.service.js` is the **only** place either may change.
A status update on one **automatically syncs** the other where the table below shows an arrow.

```
                           ┌─────────────┐
   TM/ADMIN                │  ASSIGNED   │  Job
   PUT /authorize-survey   └──────┬──────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │  SURVEY_AUTHORIZED   │  Job          (provisions Survey row in NOT_STARTED)
                        └──────────┬───────────┘
                                   │
        SURVEYOR                   │ POST /surveys/start
        (assigned only)            ▼
                        ┌──────────────────────┐                                ┌──────────────┐
                        │     IN_PROGRESS      │  Job  ◄── auto-sync ─── STARTED  │   Survey      │
                        └──────────┬───────────┘                                └──────────────┘
                                   │
                                   │ PUT /checklists/jobs/:jobId
                                   ▼
                        ┌──────────────────────┐                  CHECKLIST_SUBMITTED   Survey
                        │     IN_PROGRESS      │  Job             (no job-level change)
                        └──────────┬───────────┘
                                   │
                                   │ POST /surveys/jobs/:jobId/proof
                                   ▼
                        ┌──────────────────────┐                    PROOF_UPLOADED        Survey
                        │     IN_PROGRESS      │  Job             (no job-level change)
                        └──────────┬───────────┘
                                   │
                                   │ POST /surveys     (final submit)
                                   ▼
                        ┌──────────────────────┐                       SUBMITTED          Survey
        TM / GM         │     SURVEY_DONE      │  Job  ◄── auto-sync from SUBMITTED
                        └──┬───────────────┬───┘
                           │               │
        PUT .../rework     │               │ PUT .../finalize  (TM only, no open NCs)
                           │               │
                           ▼               ▼
                ┌────────────────────┐    ┌──────────────────────┐
                │ REWORK_REQUESTED   │    │      FINALIZED       │  Job (terminal-ish)
                └─────────┬──────────┘    └──────────────────────┘
                          │                          ▲ FINALIZED on Survey
                          │ surveyor redoes           │ (only path to job FINALIZED)
                          │ checklist / proof / submit
                          ▼
                  back to SURVEY_DONE
                  (via SUBMITTED on Survey)
```

### Job transitions (for this slice)

```
ASSIGNED          →  SURVEY_AUTHORIZED, REJECTED
SURVEY_AUTHORIZED →  IN_PROGRESS, REJECTED
IN_PROGRESS       →  SURVEY_DONE, REWORK_REQUESTED, REJECTED
SURVEY_DONE       →  REVIEWED, REWORK_REQUESTED, FINALIZED, REJECTED
REVIEWED          →  REWORK_REQUESTED, FINALIZED, REJECTED
REWORK_REQUESTED  →  IN_PROGRESS, SURVEY_DONE, REJECTED
FINALIZED         →  CERTIFIED                   (post-payment)
CERTIFIED, REJECTED → terminal
```

### Survey transitions

```
NOT_STARTED         →  STARTED
STARTED             →  CHECKLIST_SUBMITTED
CHECKLIST_SUBMITTED →  PROOF_UPLOADED
PROOF_UPLOADED      →  SUBMITTED
SUBMITTED           →  REWORK_REQUIRED, FINALIZED
REWORK_REQUIRED     →  CHECKLIST_SUBMITTED, PROOF_UPLOADED, SUBMITTED
FINALIZED           →  terminal
```

### Auto-sync map (Survey → Job)

| Survey transition | Job becomes |
|---|---|
| `… → STARTED` | `IN_PROGRESS` |
| `… → SUBMITTED` | `SURVEY_DONE` |
| `… → REWORK_REQUIRED` | `REWORK_REQUESTED` |
| `… → FINALIZED` | `FINALIZED` *(only path, internal only)* |

> **Invariant:** `Job.FINALIZED` is reachable **exclusively** through
> `updateSurveyStatus(survey, 'FINALIZED', …)`. No HTTP route nor
> service can shortcut to `Job.FINALIZED` directly — `updateJobStatus`
> hard-rejects external callers from setting `FINALIZED` when the job
> requires a survey.

---

## 3. Step-by-step flow

### Step 0 — Precondition

The job is `ASSIGNED` (a surveyor has been picked, the GM did the
assignment). The Survey row may or may not exist yet — both cases are
handled.

### Step 1 — Authorise the survey  *(TM / ADMIN)*

```
PUT /api/v1/jobs/:id/authorize-survey
Authorization: Bearer <tm-or-admin-jwt>
Content-Type: application/json

{ "remarks": "Pre-survey doc check passed" }   // optional
```

**Guards (in service order):**

1. RBAC: caller role must be in `RBAC.AUTHORIZE_SURVEY` = `['ADMIN', 'TM']`.
2. Job must exist and be in **`ASSIGNED`** state.
3. `assigned_surveyor_id` must be set (defence-in-depth — it should be by definition).
4. Lifecycle: `ASSIGNED → SURVEY_AUTHORIZED` checked against `JOB_TRANSITIONS`.

**Side-effects:**
- `job.job_status = 'SURVEY_AUTHORIZED'`
- `job.approved_by_user_id = <caller.id>`
- `JobStatusHistory` row written (same txn).
- **A `Survey` row is auto-provisioned** in `NOT_STARTED` for the assigned surveyor (see lifecycle.service step 8). The frontend doesn't need to do anything for this.
- Notifications fire to the assigned surveyor and the client (`JOB_APPROVED` template).

**Common 4xx:**
- `400 ASSIGNED` is required → "Survey authorization is possible only after a surveyor has been assigned."
- `403` → wrong role.

### Step 2 — Surveyor checks in / starts the survey

```
POST /api/v1/surveys/start
Authorization: Bearer <surveyor-jwt>
Content-Type: application/json

{
  "job_id": "<uuid>",
  "latitude":  19.0760,
  "longitude": 72.8777
}
```

**Guards:**
1. Role = `SURVEYOR`.
2. Job not terminal (`CERTIFIED`, `REJECTED`).
3. Job in `SURVEY_AUTHORIZED`.
4. Caller **is** `job.assigned_surveyor_id` (any other surveyor → 403).
5. `job.is_survey_required !== false`.
6. Survey row is `NOT_STARTED`. (Idempotent: if it doesn't exist, it's created; if it exists in some other state, **400**.)

**Side-effects:**
- Survey: `NOT_STARTED → STARTED` + `started_at = now`, `start_latitude/longitude` recorded.
- Auto-sync: Job `SURVEY_AUTHORIZED → IN_PROGRESS`.
- Initial `GpsTracking` ping recorded.
- `SurveyStatusHistory` row, `JobStatusHistory` row.
- Notifications fire (`SURVEY_STARTED` to ADMIN/TM/TO).

**Response:**
```json
{ "success": true, "message": "Survey started successfully.",
  "data": { "message": "Survey started.", "survey_id": "<uuid>", "job_id": "<uuid>" } }
```

### Step 3 — Checklist screen (Surveyor): download docs → answer questions → upload scans

This step is what the Surveyor UI calls the “Checklist” screen. It has **three** independent pieces of data:

1. **Reference / blank checklist documents** (DOCX/PDF) — comes from the ACTIVE checklist template (`ChecklistTemplate.template_files`)
2. **Digital checklist answers** (YES/NO/NA + remarks + per-question photo) — stored in `activity_plannings`
3. **Filled & signed checklist scan(s)** (PDF/JPG) — stored on `surveys.signed_checklist_files`

#### 3A) Load the entire checklist screen in ONE API call

```
GET /api/v1/checklists/jobs/:jobId
Authorization: Bearer <surveyor-jwt>
```

**Response (unified checklist screen payload):**

- `items`: saved checklist answers (with per-question `file_url` resolved to HTTPS)
- `signed_checklist_files`: resolved HTTPS URLs for the filled & signed master checklist scans (may be `[]`)
- `template_files`: resolved HTTPS URLs for the **reference/blank checklist documents** attached to the active checklist template for this job’s certificate type (may be `[]`)
- `template`: minimal active-template metadata `{ id, name, code }` (or `null` if no active template exists)

Frontend should render this as three sections:
- **Reference docs** (download links) ← `template_files`
- **Questions** (editable) ← `items`
- **Signed scans** (upload + already uploaded list) ← `signed_checklist_files`

#### 3B) Download the job-specific prefilled DOCX (optional button)

If the Surveyor needs a **prefilled** printable checklist (vessel/job tags filled in), use:

`GET /api/v1/checklist-templates/job/:jobId/download`

This endpoint generates a DOCX (and caches it). It does **not** store the Surveyor’s filled answers.

#### 3C) Save checklist answers + (optionally) attach signed scan keys

To persist the Surveyor’s work (answers + uploaded scan keys), use:

```
PUT /api/v1/checklists/jobs/:jobId
Authorization: Bearer <surveyor-jwt>
Content-Type: application/json

{
  "items": [
    { "question_code": "LS-01", "question_text": "Lifeboats present?", "answer": "YES", "remarks": "OK", "file_url": "checklists/.../photo.jpg" },
    { "question_code": "LS-02", "question_text": "Lifejackets count",  "answer": "YES", "remarks": "32 found"                                            }
  ],
  "signed_checklist_files": ["surveys/signed-checklists/<jobId>/.../master.pdf"]    // OPTIONAL here, REQUIRED at final submit
}
```

**Per-question photos:** if a question has a photo, get an upload URL first via
`GET /api/v1/checklists/jobs/:jobId/get-upload-url?fileName=&contentType=`,
PUT the file to the returned `uploadUrl`, and put the `fileKey` into `items[].file_url`.

**The full signed-checklist scan (the paper sheet scan):** get the upload URL from:

`GET /api/v1/checklists/jobs/:jobId/signed-checklist-upload-url?fileName=&contentType=`

Then:
- `PUT uploadUrl` directly to S3
- send the returned `fileKey` back to the backend in `signed_checklist_files` (array) via `PUT /checklists/jobs/:jobId`

**Where it is stored:** the raw S3 keys are stored on the Survey row:
`surveys.signed_checklist_files` (JSON array). Responses always show resolved HTTPS URLs.

#### 3D) Replace / remove signed checklist scans (before final submit)

Yes — the Surveyor can re-upload (replace) and/or remove signed checklist scans **any time before** the final survey submission (`POST /api/v1/surveys`), because the keys are stored as an array and the backend treats updates as a **full replace of the array**.

How FE should do it:

1. Show current scans (URLs):
   - `GET /api/v1/checklists/jobs/:jobId` → `signed_checklist_files: [https..., ...]`
2. If user removes a scan from UI:
   - Build a new array of **raw S3 keys** you want to keep (not the signed URLs)
3. If user uploads a new scan:
   - `GET /api/v1/checklists/jobs/:jobId/signed-checklist-upload-url`
   - `PUT uploadUrl` to S3
   - append returned `fileKey` into your array
4. Persist the new array:
   - `PUT /api/v1/checklists/jobs/:jobId` with `signed_checklist_files: [...]`

Important:
- Removing a file from the array **only removes the reference** from DB; it does not delete the object from S3.
- If the user removes all scans (`signed_checklist_files=[]`), the final submit (`POST /api/v1/surveys`) will be blocked until at least one scan is attached again.

**Guards:**
1. Role = `SURVEYOR` (in route).
2. Caller is the assigned surveyor.
3. Job not terminal, not past finalisation (`FINALIZED` / `CERTIFIED`).
4. Survey is in one of `['STARTED', 'CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED']`.

**Side-effects:**
- Existing `ActivityPlanning` rows for this job are wiped and replaced (idempotent re-submit during the same phase is safe).
- If `signed_checklist_files` was sent, it's persisted on the Survey row.
- Survey transitions only when it's a *forward* move:
  - `STARTED → CHECKLIST_SUBMITTED` (first time)
  - `REWORK_REQUIRED → CHECKLIST_SUBMITTED` (after rework)
  - already `CHECKLIST_SUBMITTED` / `PROOF_UPLOADED` → **stays put**, just data is overwritten.
- No job-level transition (job stays `IN_PROGRESS` or `REWORK_REQUESTED`).

**What moves the process forward:** saving the checklist (this PUT) **does not** move the job to `SURVEY_DONE`.
The job moves to `SURVEY_DONE` only when the Surveyor submits the final survey report (`POST /api/v1/surveys`),
and that call will hard-block unless at least one signed checklist scan exists in `signed_checklist_files`.

### Step 4 — Upload evidence proof

```
POST /api/v1/surveys/jobs/:jobId/proof
Authorization: Bearer <surveyor-jwt>
Content-Type: multipart/form-data

proof: <file>          # OR  fileKey: "<presigned-uploaded-key>" in body
```

**Guards:**
1. Survey in `['CHECKLIST_SUBMITTED', 'PROOF_UPLOADED', 'REWORK_REQUIRED']`.
2. (Repeated calls just overwrite the URL; survey advances **only** if it wasn't already `PROOF_UPLOADED`.)

**Side-effects:**
- `survey.evidence_proof_url = <S3 key>`.
- Status goes to `PROOF_UPLOADED` if it wasn't already.
- Notification (`SURVEY_PROOF_UPLOADED` to ADMIN/TM/TO).

> Two upload paths are supported: direct multipart `proof` or registering a
> pre-signed-uploaded `fileKey`. Frontend should prefer the pre-signed path
> for large files.

### Step 4b — Live GPS ping (any time during the survey)

```
POST /api/v1/surveys/jobs/:jobId/location
{ "latitude": 19.0822, "longitude": 72.8814 }
```
Allowed during `STARTED / CHECKLIST_SUBMITTED / PROOF_UPLOADED / REWORK_REQUIRED`.
Returns the `GpsTracking` row.

### Step 4c — Offline replay (mobile)

```
POST /api/v1/surveys/jobs/:jobId/sync
{
  "checklist":  [{ "question_code":"…","question_text":"…","answer":"YES","remarks":"…" }],
  "gps_points": [{ "latitude":19.08,"longitude":72.88,"captured_at":"2026-04-25T13:40:00Z" }]
}
```
Atomic: either every checklist row + GPS point lands or nothing does.
Allowed when job is `SURVEY_AUTHORIZED / IN_PROGRESS / SURVEY_DONE`.

### Step 5 — Submit the final survey report (Surveyor's check-out)

```
POST /api/v1/surveys
Authorization: Bearer <surveyor-jwt>
Content-Type: multipart/form-data

job_id:           <uuid>
submit_latitude:  19.0833
submit_longitude: 72.8800
photoKey:         "<pre-signed-uploaded key>"      # required
signatureKey:     "<pre-signed-uploaded key>"      # required
survey_statement: "All inspections completed; no major findings."  # optional
```

(Multipart `photo` / `signature` files are also accepted in lieu of `photoKey` / `signatureKey`.)

**Guards (this is the strictest one):**
1. Job not in `FINALIZED` / `CERTIFIED`.
2. Survey in `PROOF_UPLOADED` or `REWORK_REQUIRED`.
3. ≥ 1 `ActivityPlanning` row exists for the job.
4. **`signed_checklist_files` is non-empty** on the Survey (set in step 3).
5. `submit_latitude` and `submit_longitude` provided.
6. `photoKey` (or `photo` file) provided → becomes `attendance_photo_url`.
7. `signatureKey` (or `signature` file) provided → becomes `signature_url`.

**Side-effects:**
- Survey: `… → SUBMITTED`, `submitted_at = now`, `submission_count++`, `declared_by`/`declared_at`.
- Auto-sync: Job → `SURVEY_DONE`.
- A SHA-256 `declaration_hash` is computed over the canonical payload (statement + checklist + proof + GPS + iteration) and stored on the Survey row — **immutable evidence the surveyor declared this exact data**.
- Final GPS ping logged.
- Notifications fire (`SURVEY_SUBMITTED` to ADMIN/TM/TO).

### Step 6a — Finalise the survey  *(TM only — happy path)*

```
PUT /api/v1/surveys/jobs/:jobId/finalize
```

**Guards (lifecycle.service):**
1. Caller role = `TM` or `ADMIN` (controller + lifecycle both check).
2. Survey in `SUBMITTED`.
3. **No open Non-Conformities** for the job (status not in `CLOSED` / `RESOLVED`) — otherwise a friendly "resolve N open NCs first" 400.
4. The `preventSelfApproval` middleware blocks the same user who *assigned* the surveyor from finalising too (4-eye principle).

**Side-effects:**
- Survey: `SUBMITTED → FINALIZED`, `finalized_at = now`. Terminal.
- Auto-sync: Job: `SURVEY_DONE → FINALIZED` (only via this internal path).
- Notification (`JOB_FINALIZED` to surveyor).

### Step 6b — Request rework  *(TM or GM)*

```
PUT /api/v1/surveys/jobs/:jobId/rework
{ "reason": "Section B photos blurred — please re-upload." }
```

**Guards:**
1. Role = `GM` or `TM` (route).
2. Job not in `FINALIZED` / `CERTIFIED`.
3. Survey in `SUBMITTED` (rework can only be raised on a submitted report).

**Side-effects:**
- Survey: `SUBMITTED → REWORK_REQUIRED`, `reason` stored on the history row.
- Auto-sync: Job: `SURVEY_DONE → REWORK_REQUESTED`.
- Notification to the assigned surveyor (`SURVEY_REWORK_REQUESTED` with reason).

### Step 7 — The rework loop

After step 6b the surveyor sees the job in `REWORK_REQUESTED` and must
re-do *some* of steps 3–5. Three valid paths:

| Path | When to use | Sequence |
|---|---|---|
| **Statement / metadata only** | "Rephrase your finding" | (no checklist or proof change) → step 5 (`POST /surveys`) — allowed because guard accepts `REWORK_REQUIRED` |
| **Photos / proof only** | "Re-upload evidence" | step 4 (`POST .../proof`) → step 5 |
| **Full rework** | Major issue | step 3 (`PUT /checklists/jobs/:jobId`) → step 4 → step 5 |

In every case:
- Survey transitions are tracked atomically through the same `lifecycle.service` calls.
- `submission_count` increments on each `SUBMITTED` (so iterations are auditable).
- A **new** `declaration_hash` is computed.
- After the surveyor re-submits, survey → `SUBMITTED` again, job auto-syncs back to `SURVEY_DONE`.

The TM/GM can request rework as many times as they want, but only while
the job hasn't crossed `FINALIZED`. Each rework round produces its own
`SurveyStatusHistory` row with `submission_iteration` set, so the UI can
show "Round 2 of 3" and the reasons given each round.

---

## 4. Audit / history surface

Anything the FE needs to render the timeline lives in three tables:

| Table | What it tells you |
|---|---|
| `JobStatusHistory` | Every job status change with `previous_status`, `new_status`, `changed_by`, `reason`, `createdAt` |
| `SurveyStatusHistory` | Every survey status change with the same shape **plus** `submission_iteration` |
| `GpsTracking` | Every recorded location with `timestamp`, `latitude`, `longitude` |

Two read endpoints stitch them together:

- `GET /api/v1/surveys/jobs/:jobId/timeline` → returns `{ job_id, gps_trace: [...], survey_details: { ..., SurveyStatusHistories: [...] } }`. Designed for the timeline / map view.
- `GET /api/v1/surveys/jobs/:jobId` → flat survey detail, including `SurveyStatusHistory` for the audit drawer.
- `GET /api/v1/jobs/:id/history` → job-level timeline (status transitions + reasons).

---

## 5. RBAC at a glance for this slice

| Action | ADMIN | GM | TM | TO | SURVEYOR | CLIENT |
|---|---|---|---|---|---|---|
| `PUT /jobs/:id/authorize-survey` | ✓ |  | ✓ |  |  |  |
| `POST /surveys/start` |  |  |  |  | ✓ (assigned only) |  |
| `PUT /checklists/jobs/:jobId` |  |  |  |  | ✓ (assigned only) |  |
| `POST /surveys/jobs/:jobId/proof` |  |  |  |  | ✓ (assigned only) |  |
| `POST /surveys/jobs/:jobId/location` |  |  |  |  | ✓ (assigned only) |  |
| `POST /surveys/jobs/:jobId/sync` |  |  |  |  | ✓ (assigned only) |  |
| `POST /surveys` (final submit) |  |  |  |  | ✓ (assigned only) |  |
| `PUT /surveys/jobs/:jobId/finalize` | ✓\* |  | ✓\* |  |  |  |
| `PUT /surveys/jobs/:jobId/rework` |  | ✓ | ✓ |  |  |  |
| `POST /surveys/jobs/:jobId/violation` |  |  | ✓ |  |  |  |
| Read endpoints (`GET …`) | ✓ | ✓ | ✓ | ✓ | ✓ |  |

\* `preventSelfApproval` middleware further blocks the same user who *assigned* the surveyor from finalising the same job (four-eye principle).

---

## 6. Status-aware UI guidance

Use the table below to drive button enable/disable in the dashboards:

| Job status | What surveyor can do | What TM can do | What GM can do |
|---|---|---|---|
| `ASSIGNED` | nothing yet | **Authorise survey** | nothing here |
| `SURVEY_AUTHORIZED` | **Start survey** | — | — |
| `IN_PROGRESS` | submit/edit checklist · upload/replace proof · stream GPS · sync offline · **Final submit** (only when survey is `PROOF_UPLOADED`) | — | — |
| `SURVEY_DONE` | nothing | **Finalize** · **Request rework** | **Request rework** |
| `REWORK_REQUESTED` | redo any of: checklist, proof, final submit | (waits for surveyor) | (waits for surveyor) |
| `FINALIZED` | nothing | (move to certificate flow) | — |

For the *survey* status, the granular button state inside step 5 is:

| Survey status | "Final submit" button |
|---|---|
| `STARTED`, `CHECKLIST_SUBMITTED` | **disabled** (must upload proof first) |
| `PROOF_UPLOADED` | **enabled** |
| `REWORK_REQUIRED` | **enabled** (statement-only or partial rework path) |
| `SUBMITTED` | **disabled** ("waiting for review") |
| `FINALIZED` | **disabled** ("locked") |

---

## 7. Common 4xx errors (and what they mean)

| Status | Trigger | Friendly UI mapping |
|---|---|---|
| `400 Action not allowed: cannot move from X to Y status.` | Invalid state transition (covers most "wrong button at wrong time" cases) | "This action isn't available right now — please refresh." |
| `400 Survey authorization is possible only after a surveyor has been assigned.` | TM clicks Authorise on a non-`ASSIGNED` job | Hide the button when status ≠ `ASSIGNED` |
| `400 Please upload all required evidence proofs before submitting the survey report.` | Surveyor calls final-submit while survey is at `STARTED` or `CHECKLIST_SUBMITTED` | Greyed out submit button (see §6) |
| `400 Please upload the filled and signed checklist document before submitting the survey report.` | `signed_checklist_files` array is empty | Mandatory file upload widget on the submit screen |
| `400 GPS coordinates must be recorded on-site before submission.` | Missing `submit_latitude`/`submit_longitude` | Mobile: capture GPS just-in-time in the submit handler |
| `400 Cannot finalize survey: please resolve the N open Non-Conformity report(s) first.` | TM tries to finalise with open NCs | Show banner with NC list link |
| `400 Rework can only be requested for submitted survey reports.` | TM/GM clicks rework when survey ≠ `SUBMITTED` | Hide button unless `survey_status === 'SUBMITTED'` |
| `400 Rework cannot be requested when job is FINALIZED.` | TM/GM clicks rework after job already finalized | Hide button when `JOB_POST_FINALIZATION_STATES.includes(job.job_status)` |
| `403 Only Technical Managers (TM) or Admins have permission to finalize surveys.` | Wrong role | Don't show button for non-TM/ADMIN |
| `403 You are not the assigned surveyor for this job.` | Different surveyor logged in | Don't show edit affordances on the job card unless it's yours |
| `409 Survey is already in <status> state.` | Idempotent retry of `updateSurveyStatus` | Treat as success / refetch |

---

## 8. Useful `data.*` fields on the survey object

When the FE renders the *Survey* drawer / page, these are the fields you'll need:

| Field | Source | Notes |
|---|---|---|
| `survey_status` | direct | drives the timeline pill |
| `submission_count` | direct | "Submitted Round 2 of 3" |
| `started_at` / `submitted_at` / `finalized_at` | direct | ISO timestamps |
| `start_latitude/longitude` / `submit_latitude/longitude` | direct | map markers |
| `evidence_proof_url` | resolved signed URL | gallery |
| `attendance_photo_url` | resolved signed URL | "Surveyor on-site" photo |
| `signature_url` | resolved signed URL | sign-off image |
| `signed_checklist_files` | array of resolved signed URLs | "View signed checklist" link(s) |
| `survey_statement` / `survey_statement_status` / `survey_statement_pdf_url` | resolved signed URL | DRAFTED / ISSUED stamp + download |
| `declaration_hash` | direct | SHA-256, surfaceable as a tooltip on the "submitted" pill — immutable proof |
| `SurveyStatusHistories` | included via timeline endpoint | for the round-by-round table |

> Same convention as the Templates module: **DB stores raw S3 keys; responses
> contain fully resolved signed URLs**. Drop them straight into `<a href>`.

---

## 9. Sequence diagrams (rework path)

### 9.1 Happy path

```
Surveyor → POST /surveys/start            → Survey STARTED       Job IN_PROGRESS
Surveyor → PUT  /checklists/jobs/:jobId   → Survey CHECKLIST_SUBMITTED
Surveyor → POST /surveys/.../proof        → Survey PROOF_UPLOADED
Surveyor → POST /surveys                  → Survey SUBMITTED     Job SURVEY_DONE
TM       → PUT  /surveys/.../finalize     → Survey FINALIZED     Job FINALIZED
```

### 9.2 Rework path (statement-only fix)

```
… (as above, until SUBMITTED / SURVEY_DONE)
TM/GM    → PUT  /surveys/.../rework       → Survey REWORK_REQUIRED   Job REWORK_REQUESTED
Surveyor → POST /surveys (with new statement)
                                          → Survey SUBMITTED         Job SURVEY_DONE
TM       → PUT  /surveys/.../finalize     → Survey FINALIZED         Job FINALIZED
```

### 9.3 Rework path (full re-do)

```
… SUBMITTED / SURVEY_DONE
TM/GM    → rework                          → REWORK_REQUIRED / REWORK_REQUESTED
Surveyor → PUT /checklists/jobs/:jobId     → CHECKLIST_SUBMITTED
Surveyor → POST /surveys/.../proof         → PROOF_UPLOADED
Surveyor → POST /surveys                   → SUBMITTED / SURVEY_DONE
TM       → finalize                        → FINALIZED / FINALIZED
```

`submission_count` increments on each `SUBMITTED`, so the audit drawer
should render *N* rounds of `SurveyStatusHistories` grouped by
`submission_iteration`.

---

## 10. Backend consistency audit

I walked the entire path through the codebase. The summary:

### 10.1 Things that are correct

- ✅ **Single source of truth**. `lifecycle.service.js` is the only
  module that mutates `job_status` or `survey_status`. Every controller
  /service goes through it. Direct `model.update({job_status: …})` is
  not used in the survey/job pipeline.
- ✅ **Atomic transitions.** Every status change happens inside a DB
  transaction with `lock: txn.LOCK.UPDATE` on the row. No race window.
- ✅ **Audit-on-transition.** Both `JobStatusHistory` and
  `SurveyStatusHistory` are written *inside* the same transaction as
  the status change. The FE timeline can never disagree with the
  current status.
- ✅ **Job FINALIZED is unforgeable.** The only path to `Job.FINALIZED`
  is via the survey-finalize call (which sets the internal flag).
  `updateJobStatus` rejects external callers from setting `FINALIZED`
  when `is_survey_required = true`.
- ✅ **NC guard before finalisation.** Cannot finalise a survey while
  any `NonConformity` is open (non-`CLOSED` / non-`RESOLVED`).
- ✅ **Four-eye principle.** `preventSelfApproval('JobRequest', 'assigned_by_user_id')`
  on the finalise route prevents the same user who assigned the surveyor
  from also finalising.
- ✅ **Survey provisioning is idempotent.** Whenever a job moves to
  `ASSIGNED` / `SURVEY_AUTHORIZED` / `IN_PROGRESS`, the lifecycle service
  ensures a Survey row exists for the assigned surveyor. Re-assignment
  also syncs `surveyor_id`.
- ✅ **Checklist re-submission is idempotent.** `submitChecklist` deletes
  & re-creates `ActivityPlanning` rows in one transaction; no orphans.
- ✅ **Declaration hash.** A SHA-256 digest of the canonical payload is
  stored on every `SUBMITTED` transition — tamper-evident.
- ✅ **Rework is bounded.** `requestRework` is rejected once the job is
  `FINALIZED` or `CERTIFIED`. The state machine itself wouldn't allow
  it from a terminal state, but the explicit guard means a much friendlier
  error message.
- ✅ **Statement workflow is decoupled.** `survey_statement_status`
  (`DRAFTED → ISSUED`) and `survey_statement_pdf_url` are separate from
  the survey status — drafting/issuing the SOF doesn't accidentally bump
  the survey state.

### 10.2 Minor gaps (worth a follow-up but **not blocking**)

| # | Gap | Impact | Suggested fix |
|---|---|---|---|
| 1 | **No Joi validator on `PUT /surveys/jobs/:jobId/rework`.** The route reaches the controller without `validate(schemas.requestRework)`, so `req.body.reason` can be `undefined` / `""` / a JSON object. | The reason ends up `null` in `SurveyStatusHistory` and the surveyor notification — the FE doesn't *see* a clear reason. | Add to `validate.middleware.js`: `requestRework: Joi.object({ reason: Joi.string().min(3).max(2000).required() })` and mount it on the route. |
| 2 | **Dead service code.** `survey.service.js` still exports `getSignedChecklistUploadUrl` and `updateSignedChecklist`. Those routes were moved to the `checklists` module; the service exports are unreachable except from the legacy `test_full_flow.js`. | Confusing for new readers; minor footprint. | Delete the two functions and import from `checklist.service.js` in `test_full_flow.js`. |
| 3 | **Stale module docs.** `docs/api-by-module/surveys.md` references the moved endpoints at `survey.service.js:621` / `:636`. | Out-of-date docs. | Regenerate (or hand-edit to point to the checklists module). |
| 4 | **Slightly misleading 400 on double-submit.** Calling `POST /surveys` twice (already `SUBMITTED`) returns "Please upload all required evidence proofs before submitting the survey report." rather than "Survey already submitted." | Confusing UX during retries. | In `submitSurveyReport`, check `survey.survey_status === 'SUBMITTED'` first and throw `409 Survey already submitted`. |
| 5 | **Legacy `PAYMENT_DONE` references.** `lifecycle.service.js` and `job.service.js` still mention `PAYMENT_DONE` as a guarded state. Comments confirm the application no longer drives lifecycle through it (truth lives on `payments.payment_status`). | Pure noise — already documented as legacy in the lifecycle service header comments. | Optional: drop the legacy MySQL ENUM value in a future migration. |

None of these affect the soundness of the flow today; the contract is
correct, atomic, and auditable. They're cleanups, not fixes.

### 10.3 Things to double-check on the FE side

- **Always re-fetch after a status-changing call.** Two clients can both
  hit "Finalize" and one will get a `409 Survey is already in FINALIZED state`
  (idempotency guard). Treat 409 as success-after-refresh, not as an error.
- **Don't try to skip steps via the UI.** `STARTED → SUBMITTED` directly
  is rejected by the transition map; the surveyor *must* go through
  checklist + proof. Validate this client-side too, but the server is
  the authority.
- **The `signed_checklist_files` array is mandatory at final submit.**
  Don't surface the "Final submit" button until the surveyor has uploaded
  at least one signed checklist scan.
- **Watch the `submission_count`** on the survey object — that's how you
  know which "round" of rework you're in (great for tab labels / badges).

---

## 11. Endpoint cheatsheet

```
# Authorisation (TM / ADMIN)
PUT  /api/v1/jobs/:id/authorize-survey                       { remarks? }

# Surveyor execution
POST /api/v1/surveys/start                                   { job_id, latitude, longitude }
PUT  /api/v1/checklists/jobs/:jobId                          { items, signed_checklist_files? }
GET  /api/v1/checklists/jobs/:jobId/get-upload-url           ?fileName=&contentType=
GET  /api/v1/checklists/jobs/:jobId/signed-checklist-upload-url   ?fileName=&contentType=
POST /api/v1/surveys/jobs/:jobId/proof                       multipart proof | { fileKey }
POST /api/v1/surveys/jobs/:jobId/location                    { latitude, longitude }
POST /api/v1/surveys/jobs/:jobId/sync                        { checklist[], gps_points[] }
POST /api/v1/surveys                                         multipart photo|signature | { photoKey, signatureKey, … }

# Review (TM / GM)
PUT  /api/v1/surveys/jobs/:jobId/finalize                    (TM/ADMIN, no open NCs, preventSelfApproval)
PUT  /api/v1/surveys/jobs/:jobId/rework                      { reason }                   (TM/GM)
POST /api/v1/surveys/jobs/:jobId/violation                   (TM)
POST /api/v1/surveys/jobs/:jobId/statement/draft             { survey_statement }
POST /api/v1/surveys/jobs/:jobId/statement/issue             multipart statement | (auto-promote)

# Reads
GET  /api/v1/surveys/jobs/:jobId
GET  /api/v1/surveys/jobs/:jobId/timeline
GET  /api/v1/surveys?survey_status=&surveyor_id=&job_id=
GET  /api/v1/jobs/:id/history
```

---

## 12. Where else to look

- **State machine:** `src/services/lifecycle.service.js` — every transition
  rule, every guard, every auto-sync.
- **Surveyor workflow:** `src/modules/surveys/survey.service.js` — pre-flight
  guards, per-step business rules.
- **Checklist persistence:** `src/modules/checklists/checklist.service.js` —
  the `submitChecklist` & signed-checklist-scan logic.
- **Authorisation:** `src/modules/jobs/job.service.js` (`authorizeSurvey`)
  + `src/config/rbac.config.js` (`RBAC.AUTHORIZE_SURVEY`).
- **OpenAPI spec:** `http://localhost:5000/api-docs` (filter tags *Surveys*,
  *Jobs*, *Checklists*).
- **Live integration test (optional):** `test_full_flow.js` walks an
  end-to-end happy path through the same lifecycle service calls.

If anything in this doc disagrees with the OpenAPI spec or the lifecycle
service, the **lifecycle service is the source of truth**, and please
ping backend so we update this doc.
