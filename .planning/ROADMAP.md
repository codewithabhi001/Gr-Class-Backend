# Roadmap

**4 phases** | **4 requirements mapped** | All v1 requirements covered ✓

| Phase | Name | Goal | Requirements | Success Criteria |
|---|---|---|---|---|
| 1 | RBAC Enforcement Refactoring | Ensure strict separation of duties across all workflow interactions (TM, TO, Surveyor, Client, Admin). | CORE-01 | 3 |
| 2 | Immutable Audit Trails | Build event-sourcing and locked history logs for all critical workflow states (Jobs, Surveys, Certificates). | CORE-03 | 2 |
| 3 | Checklist Versioning | Restructure checklist templates so past generated templates use historical requirements natively. | CORE-02 | 3 |
| 4 | Offline Data Capture Sync | Expose an offline synchronization engine endpoint block to capture field data retroactively. | CORE-04 | 3 |

---

## Phase Details

### Phase 1: RBAC Enforcement Refactoring
**Goal**: Ensure strict separation of duties across all workflow interactions (TM, TO, Surveyor, Client, Admin).
**Requirements**: CORE-01
**Success criteria**:
1. Users cannot progress a survey state into 'Approved' if they were the assigning Surveyor.
2. The `Client` role attempts to access internal API modules (e.g. `jobs/assign`) and receives a 403 Forbidden.
3. Tests mapping RBAC matrix validate 100% boundary blocks correctly.

### Phase 2: Immutable Audit Trails
**Goal**: Build event-sourcing and locked history logs for all critical workflow states (Jobs, Surveys, Certificates).
**Requirements**: CORE-03
**Success criteria**:
1. All changes to `Job`, `Survey`, and `Certificate` lifecycle models generate parallel entries in an `AuditLog` table.
2. Deleting an audit history record via the standard ORM returns an explicit runtime framework error.

### Phase 3: Checklist Versioning
**Goal**: Restructure checklist templates so past generated templates use historical requirements natively.
**Requirements**: CORE-02
**Success criteria**:
1. Checklist Templates can be cloned and "version incremented" rather than mutated in-place.
2. A filled-in Checklist completed in early 2025 points directly (via FK) to a locked v1 Checklist Template.
3. Attempting to modify a completed checklist template throws an error.

### Phase 4: Offline Data Capture Sync
**Goal**: Expose an offline synchronization engine endpoint block to capture field data retroactively.
**Requirements**: CORE-04
**Success criteria**:
1. Given a single batched JSON payload representing 10 delayed survey entries, the backend validates and creates them correctly.
2. Offline payload validation isolates timezone offsets back to their native UTC origins securely.
3. Conflicting data states explicitly return error identifiers rather than overwriting server truth.
