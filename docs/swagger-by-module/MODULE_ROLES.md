# API modules — roles & certificate-centric workflow

This guide complements per-module OpenAPI files in this folder. Regenerate specs after YAML changes:

```bash
cd GIRIK_BACKEND && node src/docs/generate-module-swagger.js
node scripts/audit-swagger-rbac.js
```

## Role abbreviations

| Role | Typical responsibility |
|------|------------------------|
| **CLIENT** | Own fleet; create jobs; upload documents; external messages |
| **TO** | Document verification; technical review per certificate |
| **GM** | Approve requests; assign/reassign surveyors (bulk or per cert) |
| **TM** | Authorize surveys; finalize surveys; issue survey statements |
| **ADMIN** | Full operational access (same as GM/TM where noted) |
| **SURVEYOR** | Field survey on assigned certificate(s) only |

## Jobs module (`jobs.json` + `jobs-certificate-workflow.json`)

Parent `JobRequest` status syncs to **CREATED → IN_PROGRESS → CERTIFIED**. Per-certificate work uses `JobCertificate.status`.

| Action | Endpoint | Roles |
|--------|----------|-------|
| List / detail | `GET /jobs`, `GET /jobs/{id}` | CLIENT, ADMIN, GM, TM, TO, SURVEYOR (scoped) |
| Create | `POST /jobs` | CLIENT, ADMIN, GM |
| Verify documents (per cert) | `PUT /jobs/certificates/{jobCertificateId}/verify-documents` | TO, GM, ADMIN |
| Approve request | `PUT /jobs/{id}/approve-request` | GM, ADMIN — records approval when all certs `DOCUMENT_VERIFIED` (job may stay `IN_PROGRESS`) |
| Assign all certs | `PUT /jobs/{id}/assign` | GM, ADMIN |
| Assign one cert | `PUT /jobs/certificates/{jobCertificateId}/assign` | GM, ADMIN |
| Reassign all | `PUT /jobs/{id}/reassign` | GM, TM, ADMIN |
| Reassign one cert | `PUT /jobs/certificates/{jobCertificateId}/reassign` | GM, TM, ADMIN |
| Authorize survey (per cert) | `PUT /jobs/certificates/{jobCertificateId}/authorize-survey` | TM, ADMIN |
| TO review (per cert) | `PUT /jobs/certificates/{jobCertificateId}/review` | TO |
| Eligible surveyors | `GET /jobs/{id}/eligible-surveyors?job_certificate_id=` | ADMIN, GM, TM |

Deprecated job-level verify/authorize/review paths remain documented for migration only.

## Surveys module (`surveys.json`)

All management routes use **`/surveys/job-certificates/{jobCertificateId}/...`**. Surveyor mobile flow uses `job_certificate_id` on start/submit.

| Action | Endpoint | Roles |
|--------|----------|-------|
| Start / proof / GPS / sync | `POST .../start`, `.../proof`, `.../location`, `.../sync` | SURVEYOR |
| Submit report | `POST /surveys` | SURVEYOR |
| Finalize | `PUT .../job-certificates/{id}/finalize` | TM |
| Rework | `PUT .../job-certificates/{id}/rework` | ADMIN, GM, TM |
| Statement draft / issue | `POST .../statement/draft`, `.../statement/issue` | SURVEYOR+TM draft; **TM only** issue |
| Read survey | `GET .../job-certificates/{id}` | ADMIN, GM, TM, TO, SURVEYOR, CLIENT |

## Non-conformities (`non_conformities.json`)

| Action | Endpoint | Roles |
|--------|----------|-------|
| Create | `POST /non-conformities` | SURVEYOR, TO — optional `job_certificate_id` scopes NC to one cert |
| List / by job | `GET /non-conformities`, `GET .../job/{jobId}` | Filter by `job_certificate_id` where supported |

Open NCs block finalize/issue only for the matching certificate (or job-wide NCs with null `job_certificate_id`).

## Certificates (`certificates.json`)

| Action | Notes | Roles |
|--------|-------|-------|
| Generate draft | Requires `job_certificate_id` on multi-cert jobs | ADMIN, GM, TM |
| Issue | Sets `JobCertificate` → ISSUED; parent → CERTIFIED when all issued | ADMIN, GM, TM |
