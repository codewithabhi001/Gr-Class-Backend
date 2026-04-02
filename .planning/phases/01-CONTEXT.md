# Phase 1: RBAC Enforcement Refactoring - Context

**Gathered:** April 2026
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensure strict separation of duties across all workflow interactions (TM, TO, Surveyor, Client, Admin).
</domain>

<decisions>
## Implementation Decisions

### the agent's Discretion
User specified to follow best approaches completely autonomously. All middleware implementations, matrix mapping choices, and status restriction rules will use standard Express/Node best-practices without further prompts.
</decisions>

<code_context>
## Existing Code Insights
- Middlewares directory exists `src/middlewares`. 
- RBAC is defined heavily within individual routing blocks (e.g. `auth.routes.js`, `job.routes.js`).
- State transitions block access by roles intuitively but inconsistently.
</code_context>

<specifics>
## Specific Ideas
No specific requirements - autonomous selection for optimal security approach.
</specifics>

<deferred>
## Deferred Ideas
None
</deferred>
