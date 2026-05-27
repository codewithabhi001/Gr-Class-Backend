# Full Multi-Certificate Job Flow — UAT Log

**Automated run date:** 2026-05-27  
**Script:** `npm run test:full-job-flow` → `test_full_job_flow_e2e.js`  
**Result:** PASSED (exit code 0)

## Reference job (latest successful run)

| Field | Value |
|-------|--------|
| Job ID | `019e6932-947f-77d8-84d0-9df3e4adfd25` |
| Vessel | vessel one |
| JobCertificate A | `019e6932-9c95-773a-b968-a099a10da288` — BOTTOM INSPECTION |
| JobCertificate B | `019e6932-9fc8-7321-a143-a4e5149a1513` — Annual |
| Surveyor 1 | abhivishwkarmaa52@gmail.com |
| Surveyor 2 | abhivishwkarmaa54@gmail.com |
| Final job status | **CERTIFIED** |

## Status gates (automated)

| Phase | Expected | Verified |
|-------|----------|----------|
| 1 Create | Job `CREATED`, certs `PENDING` | Yes |
| 2 Doc reject | Doc `REJECTED`, cert stays `PENDING` | Yes |
| 3 Re-upload | New row `PENDING`, old row `REJECTED` (audit) | Yes |
| 4 Doc verify | Both `DOCUMENT_VERIFIED`, job `IN_PROGRESS` | Yes |
| 5 GM approve | `approved_by_user_id` set, job `IN_PROGRESS` | Yes |
| 6 Assign | Surveyor1 on both certs | Yes |
| 7 Authorize | Both `SURVEY_AUTHORIZED` | Yes |
| 8 Survey | B then A → both `SURVEY_DONE` | Yes |
| 9 Pass/rework | A `SURVEY_DONE`, B `REWORK_REQUESTED` / survey `REWORK_REQUIRED` | Yes |
| 10 Issue A | A `ISSUED`, job not `CERTIFIED` | Yes |
| 11 Reassign B | Surveyor2 on jcB + survey | Yes |
| 12 Complete B | B `ISSUED`, job **CERTIFIED** | Yes |

## Manual UI smoke checklist (optional spot-check)

Use the reference job above in the web app, or run a fresh job following the same steps.

| Step | Role | URL / surface | Check |
|------|------|---------------|--------|
| Job detail | CLIENT | `/client/jobs/[id]` | Two cert cards, documents tab shows reject + re-upload history |
| Verify docs | TO | `/to/jobs/[id]` | Per-cert verify actions work |
| Approve | GM | `/gm/jobs/[id]` | Approve request visible after all docs verified |
| Assign | GM | `/gm/jobs/[id]` | Per-cert assign / reassign modals |
| Authorize | TM | `/tm/jobs/[id]` | Per-cert authorize (not legacy `/tm/authorize` queue only) |
| Survey order | SURVEYOR | Mobile job detail | Start Cert B then A via cert cards + `job_certificate_id` |
| Review / rework | TO, TM | Web job detail | TO review on passed cert; TM rework on other |
| Cert issue | TM, GM | Web | Draft + issue per cert |
| Rework + reassign | GM, SURVEYOR 2 | Web + mobile | Rework cert visible after `REWORK_REQUESTED`; Surveyor2 sees assignment |
| Complete | All | Job detail | Job status **CERTIFIED** when both certs issued |

## Notes for manual testers

1. **Re-upload UX:** Backend creates a **new** `JobDocument` row; the rejected row remains for audit. UI should show the latest PENDING upload, not expect the old row to flip to PENDING.
2. **Surveyor profiles:** Assign fails with “Surveyor profile not found or inactive” if profile missing — ensure ACTIVE profile with authorized cert names matching certificate types.
3. **Certificate PDF template:** Automated run logged `No valid template found for certificate` warnings; issuance still succeeded. Configure templates in admin if PDF preview is required in UI.
4. **TM authorize page:** Prefer per-cert authorize on job detail; legacy `/tm/authorize` may not list cert-centric jobs.
