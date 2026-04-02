# requirements

## Core Compliance & Operations (v1)
- [ ] **CORE-01**: Strict Role RBAC - The system must enforce explicit separation of duties (TM, TO, Surveyor, Client, Admin) so that users cannot perform conflicting lifecycle approvals.
- [ ] **CORE-02**: Checklist Versioning - The system must version checklist templates historically, ensuring a survey accessed in the future renders identically to the rules enforced at the time of its completion.
- [ ] **CORE-03**: Immutable Audit Trails - The system must persistently log all state transitions (Job created, Survey assigned, Cert issued) without the ability for standard users to hard-delete these history traces.
- [ ] **CORE-04**: Offline Capable Data Capture Sync - The backend must support payload syncing flows designed to handle offline data entries submitted retroactively by surveyors working without internet.

## Phase 2 (Deferred)
- [ ] **CORE-05**: IoT & Vessel Telemetry Integration
- [ ] **CORE-06**: Smart Non-Conformity Tracking (ML/Heuristics for previous resolutions)
- [ ] **CORE-07**: E-IDAS compliant remote cryptographic Digital Signatures

## Out of Scope
- Native Mobile App Module — The immediate API scope covers web portal endpoints (as outlined by the monolith restructuring).

## Traceability

- **CORE-01** → Phase 1
- **CORE-02** → Phase 3
- **CORE-03** → Phase 2
- **CORE-04** → Phase 4
