# Phase 2: Immutable Audit Trails - Plan

<plan>
## 1. Apply Sequelize Global Hooks for Auditing
- **Objective:** Event-source all state changes for jobs, surveys, and certificates.
- **File:** `src/models/index.js`
- **What to do:** Attach `afterCreate`, `afterUpdate`, and `afterDestroy` hooks to the `JobRequest`, `Survey`, and `Certificate` models. These hooks should inject an `AuditLog` creation call in the background using `previousDataValues` and `dataValues`.

## 2. Block Audit Log Deletions
- **Objective:** Prevent standard users and admins from hard-deleting history traces via the ORM framework.
- **File:** `src/models/audit_log.model.js`
- **What to do:** Attach a `beforeDestroy` hook to `AuditLog` that explicitly throws an Error (e.g. `Error('Immutable Audit Trail cannot be deleted.')`).
</plan>

<verification>
## Verification Loop
We need to verify:
1. Creating or modifying a `JobRequest` generates an entry in the `AuditLog` table silently.
2. Programmatically invoking `.destroy()` on an `AuditLog` entry fails with a framework error.
</verification>
