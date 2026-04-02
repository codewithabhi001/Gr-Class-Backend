# STACK.md

## Standard Stack for Maritime Certification Systems

When extending a maritime certification system, the technology choices heavily prioritize data integrity, offline capabilities, and auditable history over sheer processing speed.

### Suggested Extensions for the Existing Stack (Node.js/Sequelize/MySQL)

1. **State Machine / Workflow Engine**: 
   - *Why*: Survey and certificate lifecycles are complex and rigid. 
   - *Tool*: `xstate` or custom database-backed state machine.

2. **File Processing Line**:
   - *Why*: Marine surveyors upload gigabytes of evidence (photos, docs) from weak connections.
   - *Tool*: S3 presigned URLs (already present), paired with background processing queues (e.g., `bullmq` using the existing Redis instance) for PDF assembly and image optimization.

3. **PDF Document Reliability**:
   - *Why*: Certificates must look pixel-perfect for years.
   - *Tool*: `puppeteer` (already present) is the standard. Ensure templates are versioned alongside data so re-generating a 5-year-old certificate produces the same visual output.

4. **Audit Storage**:
   - *Why*: Regulatory requirement.
   - *Tool*: Event sourcing tables alongside standard MySQL tables, or tools like `sequelize-paper-trail`.
