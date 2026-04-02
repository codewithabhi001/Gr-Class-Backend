# FEATURES.md

## Maritime Platform Feature Sets

When adding capabilities to a maritime domain platform, features break down into specific strict categories based on compliance bodies (IACS, IMO).

### Table Stakes (Must-Have)
- **Strict Role RBAC**: Separation of duties is legally required (the person inspecting cannot be the person approving).
- **Checklist Versioning**: Regulations change frequently; a vessel inspected under 2025 rules must preserve that checklist format, even if accessed in 2030.
- **Offline Capable Data Capture**: Surveyors work in drydocks or at sea with zero connection. They must be able to fill forms offline and sync later.
- **Immutable Audit Trails**: Every state change MUST track who, what, when, and from what IP.

### Differentiators
- **IoT & Vessel Telemetry Integration**: Auto-filling hull thickness measurements or engine metrics direct from the ship's AIS/IoT sensors.
- **Smart Non-Conformity Tracking**: Suggesting previously used resolutions for similar ship types when non-conformities are raised.
- **Digital Signatures**: Fully e-IDAS compliant digital stamping of PDF certificates.

### Anti-Features (Do Not Build)
- **Destructive Deletion**: Never hard-delete records. Always soft-delete or archive.
- **Bypass Overrides**: Admin bypasses for survey steps should not exist unless heavily logged and dual-authorized.
