# PITFALLS.md

## Common Domain Pitfalls

When managing digital transformations for classification societies and recognized organizations, standard SaaS pitfalls are amplified by international maritime law.

### 1. Template Disassociation
- **Warning Sign**: Storing structured data but relying on a dynamic HTML template that changes over time.
- **Prevention**: When a Certificate is issued, ensure either the generated PDF is locked immutably into S3, OR the template version is locked in the DB so rebuilding the record uses the historical template.

### 2. Timezone Collisions
- **Warning Sign**: Jobs and Surveys using server-local time. Ships moving across timezones lead to logs saying an inspection was completed before it legally started.
- **Prevention**: Store all dates strictly in UTC. Ask the client/surveyor for their localized timezone at the moment of submission and store it as a separate metadata field for UI rendering.

### 3. God-Object Bottlenecks
- **Warning Sign**: The `Vessel` or `Survey` table acquiring 150+ columns as edge-case maritime rules are added.
- **Prevention**: Store rigid base schemas in MySQL tables, but consider using `JSON` fields (natively supported in MySQL 5.7/8.0) for dynamic checklist answers to prevent schema bloat.
