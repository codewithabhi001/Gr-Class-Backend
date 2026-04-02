# Phase 1: RBAC Enforcement Refactoring - Plan

<plan>
## 1. Implement Enhanced Separation of Duties Middleware
- **Objective:** Add an advanced RBAC middleware that dynamically checks database entity properties against `req.user.id` to prevent self-approval.
- **File:** `src/middlewares/rbac.middleware.js`
- **What to do:** Create `preventSelfApproval(entityType, fieldName)` that loads the database object (like a `Job` or `Survey`) and throws a `403` if `req.user.id === entity[fieldName]`.

## 2. Apply Strict Separation Checks to Survey Lifecycle
- **Objective:** Fulfill the requirement: "Users cannot progress a survey state into 'Approved' if they were the assigning Surveyor / TM."
- **File:** `src/modules/surveys/survey.routes.js`
- **What to do:** Attach the new `preventSelfApproval` middleware to `PUT /jobs/:jobId/finalize`, checking the parent Job to ensure `req.user.userId !== job.assignedBy`.

## 3. Apply Strict Client Separation on Jobs
- **Objective:** Fulfill the requirement: "The Client role attempts to access internal API modules (e.g. jobs/assign) and receives a 403 Forbidden."
- **File:** `src/modules/jobs/job.routes.js`
- **What to do:** Validate and ensure the `CLIENT` role is explicitly absent from transitions like `assign`, `approve-request`, `verify-documents`. (Currently correct in routing, but need to verify strict API rejection in practice).
</plan>

<verification>
## Verification Loop
We need to verify:
1. `finalizeSurvey` returns a 403 when called by the TM who assigned the job.
2. `assignSurveyor` returns 403 when called by a `CLIENT`.
</verification>
