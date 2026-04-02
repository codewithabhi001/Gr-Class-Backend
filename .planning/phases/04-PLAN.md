# Phase 4: Offline Data Capture Sync - Plan

<plan>
## 1. Create Offline Sync Service Function
- **Objective:** Accept a batched payload of checklist answers and GPS points captured offline and replay them within a single transaction.
- **File:** `src/modules/surveys/survey.service.js`
- **What to do:** Add `syncOfflineData(jobId, payload, userId)` which:
  1. Guards: job must be IN_PROGRESS, user must be the assigned surveyor.
  2. Upserts checklist (ActivityPlanning) answers in bulk.
  3. Bulk-creates GPS points from the offline GPS array.
  4. Returns a sync acknowledgment summary.

## 2. Add Controller Handler
- **File:** `src/modules/surveys/survey.controller.js`
- **What to do:** Add `syncOfflineData` controller that delegates to the service.

## 3. Register Route
- **File:** `src/modules/surveys/survey.routes.js`
- **What to do:** Add `POST /jobs/:jobId/sync` route, restricted to `SURVEYOR`.
</plan>

<verification>
## Verification Loop
1. Submitting a valid offline payload for an IN_PROGRESS job returns 200 with a sync summary.
2. Submitting for a wrong surveyor returns 403.
3. Submitting for a finalized/closed job returns 400.
</verification>
