# Phase 3: Checklist Versioning - Plan

<plan>
## 1. Prevent In-Place Mutation of Active Templates
- **Objective:** Fulfill requirement: "Attempting to modify a completed checklist template throws an error."
- **File:** `src/modules/checklists/checklist_template.service.js`
- **What to do:** In `updateChecklistTemplate`, throw a `400 Bad Request` if the template's `status` is not `DRAFT` (ie. it is `ACTIVE` or `INACTIVE` being used historically).

## 2. Implement Version Increments on Cloning
- **Objective:** Fulfill requirement: "Checklist Templates can be cloned and 'version incremented' rather than mutated in-place."
- **File:** `src/modules/checklists/checklist_template.service.js`
- **What to do:** In `cloneChecklistTemplate`, look at `metadata.version`. Initialize it to `"1.0"` if missing, and increment it for the new clone (e.g. `"2.0"`). Standardize the code field to reflect `_V2_0` instead of `_COPY`. Keep the same base name.
</plan>

<verification>
## Verification Loop
We need to verify:
1. `updateChecklistTemplate` returns a specific 400 error when triggered on a non-DRAFT template.
2. `cloneChecklistTemplate` correctly unpacks metadata and bumps versions.
</verification>
