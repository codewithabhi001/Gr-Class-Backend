# GR-CLASS Marine Certification — API Documentation

**Base URL:** `/api/v1`

## 📌 Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Super Admin — full system access |
| `GM` | General Manager |
| `TM` | Technical Manager |
| `TO` | Technical Officer |
| `SURVEYOR` | Field Surveyor |
| `CLIENT` | Ship Owner / Operator |
| `FLAG_ADMIN` | Flag State Administration |

## 📁 API Documentation Files

| File | Module | Endpoints |
|------|--------|-----------|
| [01_AUTH.md](./01_AUTH.md) | Authentication | Login, Logout, Refresh, Password Reset |
| [02_PUBLIC.md](./02_PUBLIC.md) | Public APIs | Certificate Verify, Vessel Verify, Videos |
| [03_USERS.md](./03_USERS.md) | User Management | CRUD, Profile, FCM, Status |
| [04_CLIENTS.md](./04_CLIENTS.md) | Client Management | CRUD, Profile, Dashboard, Documents |
| [05_VESSELS.md](./05_VESSELS.md) | Vessel Management | CRUD, List by Client |
| [06_JOBS.md](./06_JOBS.md) | Job Workflow | Create, Status Transitions, History, Messaging |
| [07_SURVEYS.md](./07_SURVEYS.md) | Survey Workflow | Start, Checklist, Proof, Submit, Finalize |
| [08_CERTIFICATES.md](./08_CERTIFICATES.md) | Certificate Management | Generate, Verify, Suspend, Renew, Transfer |
| [09_PAYMENTS.md](./09_PAYMENTS.md) | Payments | Invoice, Pay, Refund, Ledger, Summary |
| [10_SURVEYORS.md](./10_SURVEYORS.md) | Surveyor Management | Apply, Review, Profile, GPS |
| [11_CHECKLISTS.md](./11_CHECKLISTS.md) | Checklists & Templates | Submit Checklist, Template CRUD |
| [12_NON_CONFORMITIES.md](./12_NON_CONFORMITIES.md) | Non-Conformities | Create, Close, List |
| [13_DOCUMENTS.md](./13_DOCUMENTS.md) | Document Management | Upload, Download, Pre-signed URLs |
| [14_NOTIFICATIONS.md](./14_NOTIFICATIONS.md) | Notifications | List, Mark Read |
| [15_DASHBOARD.md](./15_DASHBOARD.md) | Dashboard | Role-based dashboard data |
| [16_REPORTS.md](./16_REPORTS.md) | Reports | Certificates, Surveyors, NC, Financial |
| [17_SUPPORT.md](./17_SUPPORT.md) | Support Tickets | Create, List, Status Update |
| [18_FLAGS.md](./18_FLAGS.md) | Flag Administration | CRUD |
| [19_TOCA.md](./19_TOCA.md) | Transfer of Class | Create, Accept/Reject, List |
| [20_APPROVALS.md](./20_APPROVALS.md) | Approvals | Create, Update Step |
| [21_ACTIVITY_REQUESTS.md](./21_ACTIVITY_REQUESTS.md) | Activity Requests | Create, List, Status Update |
| [22_CHANGE_REQUESTS.md](./22_CHANGE_REQUESTS.md) | Change Requests | Create, Approve, Reject |
| [23_INCIDENTS.md](./23_INCIDENTS.md) | Incidents | Report, List, Status Update |
| [24_FEEDBACK.md](./24_FEEDBACK.md) | Customer Feedback | Submit, List |
| [25_SEARCH.md](./25_SEARCH.md) | Global Search | Search across all modules |
| [26_COMPLIANCE.md](./26_COMPLIANCE.md) | Compliance (GDPR) | Data Export, Anonymize |
| [27_SYSTEM.md](./27_SYSTEM.md) | System Administration | Health, Metrics, Audit Logs, Maintenance |
| [28_WEBSITE.md](./28_WEBSITE.md) | Website Management | Video CRUD |
| [29_CONCT.md](./29_CONCT.md) | Contact Enquiries | Submit, Manage |
| [30_CERT_TEMPLATES.md](./30_CERT_TEMPLATES.md) | Certificate Templates | CRUD |

## 🔐 Authentication

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

## ❌ Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "field_name": "error message"
  }
}
```

| HTTP Code | Meaning |
|-----------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (Deleted) |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized |
| `403` | Forbidden (role not allowed) |
| `404` | Not Found |
| `409` | Conflict (invalid state transition) |
| `429` | Rate Limited |
| `500` | Internal Server Error |
