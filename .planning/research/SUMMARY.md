# SUMMARY.md

## Research Synthesis: Maritime Certification Platform

The research into the ecosystem for maritime certification systems highlights a strict adherence to offline-capable logic, immutable data transitions, and rock-solid architectural foundations over rapid feature deployment.

### Key Takeaways
1. **Immutable Records & Document Reliability**: Maritime laws mandate that what was signed yesterday must look exactly the same mathematically and visually 5 years from now. Integrating `puppeteer` (which we already have) with immutable PDF S3 pushing is critical. We must avoid dynamic HTML templates generating completely new versions of old certificates.
2. **Offline-Capable Architectures**: The application must decouple the data-gathering front end (used by surveyors at sea) from the rigid verification backend.
3. **Data Schemas**: Relational integrity via `Sequelize` and `MySQL` handles the core structure well, but care should be taken to push heavily dynamic fields into JSON column structures to avoid God-Object schemas inflating past query efficiency limits.
4. **Timezone Uniformity**: Storing local time is a primary failure vector. All survey occurrences must be strictly logged in UTC at the database layer with localized presentation layers. 

### Recommendations for Immediate Implementation
- **Implement Event-Driven Decoupling**: Rather than coupling jobs directly to payment actions inherently inside controllers, an event-driven pub-sub loop internally would greatly aid breaking up the monolith logically.
- **Reinforce RBAC logic**: Due to regulatory demands, RBAC should not just protect endpoints, but protect state transitions (e.g. `Can TM progress Survey 123 to Approved`).
