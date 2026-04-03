# Phase 4: Offline Data Capture Sync - Context

**Gathered:** April 2026
**Status:** Ready for planning

<domain>
## Phase Boundary
Expose an offline synchronization engine endpoint block to capture field data retroactively.
</domain>

<decisions>
## Implementation Decisions
Autonomously decided: Create a dedicated `POST /api/v1/surveys/sync` endpoint that accepts an array of payload updates (checklists, gps points, proofs) and processes them within a database unit-of-work transaction while verifying temporal consistency.
</decisions>

<code_context>
## Existing Code Insights
- `src/modules/surveys/survey.routes.js`
- `src/modules/surveys/survey.controller.js`
- `src/modules/surveys/survey.service.js`
</code_context>

<specifics>
## Specific Ideas
Use standard array map transactions. Verify Job is still "IN_PROGRESS" and surveyor matches.
</specifics>

<deferred>
## Deferred Ideas
None
</deferred>
