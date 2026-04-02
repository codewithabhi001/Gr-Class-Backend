# ARCHITECTURE.md

## Architecture Extensions for Maritime Cert Platforms

Given the existing Modular Monolith architecture, subsequent additions must respect the boundary contexts while answering the need for robust transactionality.

### Module Boundaries
- **Core Entities**: Vessel, Job, Client.
- **Execution Entities**: Surveyor, Survey Checklist, Non-Conformity (NC).
- **Output Entities**: Certificate, Invoice.

### Data Flow for Certificate Issuance
1. `Job Module` triggers allocation.
2. `Survey Module` records field realities (checklists, evidence).
3. `Non-Conformity Module` isolates pending failures and blocks progress.
4. `Approval Module` takes aggregated state and generates signatures.
5. `Certificate Module` captures the approved snapshot and freezes it into a PDF context block.

### Suggested Enhancements
- **Event-Driven Coupling**: To prevent `Survey Module` from needing explicit code to trigger `Invoice Module`, adopt a pub-sub approach using `EventEmitter` or Redis Pub/Sub within the Monolith `(e.g., SURVEY_APPROVED -> triggers Invoice Generation)`.
