# GIRIK Backend - Maritime Certificate Generation System

## What This Is

An enterprise-grade maritime certification platform designed for classification societies and recognized organizations. It digitizes the complete lifecycle of vessel inspection and certification processes, replacing manual, error-prone workflows with a reliable, scalable, and auditable digital system.

## Core Value

Ensure the auditable, accurate, and seamless digitization of vessel inspections leading to verifiable maritime certificate generation.

## Requirements

### Validated

- ✓ [Job Lifecycle Management] — Tracks requests through approval, assignment, execution, review, and completion
- ✓ [Survey Execution System] — Provides checklists, evidence uploads (photos/GPS), detailed reports
- ✓ [Technical Review & Compliance] — Enables Technical Officers/Managers to approve or request rework (Non-Conformities)
- ✓ [Certificate Generation] — Lifecycle control (issuance, suspension, revocation, renewal)
- ✓ [Payment & Billing] — Manages invoicing, payment tracking, and financial records
- ✓ [RBAC] — Strict permissions for Admin, GM, TM, TO, Surveyor, Client
- ✓ [Audit & Compliance] — Logging of critical actions for regulatory traceability

### Active

- [ ] [Feature additions and enhancements for current milestone - Details pending]

### Out of Scope

- [Native Mobile Module] — The module appears to have been removed (as per `routes.js`); currently targeting web portals and using standard REST APIs which a future mobile app could consume.

## Context

- **Current State**: This is a robust brownfield project. A codebase map indicates an extensive Express.js modular monolith paired with Sequelize (`MySQL`).
- **Domain Structure**: Business logic is divided into feature slices in `src/modules/` (e.g., `jobs`, `surveys`, `checklists`, `payments`, `vessels`).
- **Documentation**: A Swagger documentation generation mechanism is actively maintained.

## Constraints

- **Tech Stack**: Node.js, Express (v5), Sequelize (MySQL) — New additions must align with existing architectural choices.
- **Workflow Integrity**: Must maintain transactional integrity and strict lifecycle states for jobs and certificates — Maritime compliance regulations make this non-negotiable.
- **Security**: Must adhere to RBAC definitions exactly as defined by the classification society models.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Modular Monolith over split services | Prevents distributed transaction complexity for closely related entities like surveys and certificates. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: April 2026 after project initialization*
