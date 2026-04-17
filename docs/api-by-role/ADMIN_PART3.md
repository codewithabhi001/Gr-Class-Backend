# ADMIN Role — Part 3: Checklists, Documents, Dashboard, Reports, System & More

> [← Part 1](./ADMIN.md) | [← Part 2](./ADMIN_PART2.md)

**Auth:** `Authorization: Bearer <accessToken>`

---

## ✅ CHECKLISTS & TEMPLATES

### GET `/api/v1/checklists/jobs/:jobId`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid", "template_id": "uuid", "status": "SUBMITTED",
    "items": [
      { "id": "uuid", "question_code": "FS-001", "question_text": "Fire extinguishers inspected?", "answer": "YES", "remarks": "All 15 good", "file_url": "https://...", "created_at": "2026-03-05T19:00:00.000Z" },
      { "id": "uuid", "question_code": "FS-002", "question_text": "Fire alarm functional?", "answer": "NO", "remarks": "Deck 3 faulty", "file_url": null, "created_at": "2026-03-05T19:01:00.000Z" }
    ]
  }
}
```

### POST `/api/v1/checklist-templates` (ADMIN only)
**Request:**
```json
{
  "name": "ISM Safety Audit Checklist", "code": "ISM-CHK-001",
  "description": "Standard ISM Code safety audit checklist",
  "certificate_type_id": "uuid",
  "sections": [
    { "title": "Fire Safety", "items": [{ "code": "FS-001", "text": "Fire extinguishers inspected?", "type": "YES_NO_NA" }] },
    { "title": "Life-saving", "items": [{ "code": "LS-001", "text": "Lifeboats serviceable?", "type": "YES_NO_NA" }] }
  ],
  "status": "ACTIVE", "metadata": {}
}
```
**Response `201`:**
```json
{ "success": true, "message": "Checklist template created successfully", "data": { "id": "uuid", "name": "ISM Safety Audit Checklist", "code": "ISM-CHK-001", "status": "ACTIVE", "sections": [...] } }
```

### GET `/api/v1/checklist-templates`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "name": "ISM Safety Audit Checklist", "code": "ISM-CHK-001", "status": "ACTIVE", "sections": [...] }] }
```

### PUT `/api/v1/checklist-templates/:id/activate` (ADMIN only)
**Response `200`:**
```json
{ "success": true, "message": "Checklist template activated successfully", "data": { "id": "uuid", "status": "ACTIVE" } }
```

### POST `/api/v1/checklist-templates/:id/clone` (ADMIN only)
**Response `200`:**
```json
{ "success": true, "message": "Checklist template cloned successfully", "data": { "id": "new-uuid", "name": "ISM Safety Audit Checklist (Copy)", "status": "DRAFT" } }
```

### DELETE `/api/v1/checklist-templates/:id` (ADMIN only)
**Response `200`:**
```json
{ "success": true, "message": "Template deleted successfully" }
```

---

## 📂 DOCUMENTS

### GET `/api/v1/documents/get-upload-url`
**Query:** `?fileName=report.pdf&fileType=application/pdf&folder=documents`
**Response `200`:**
```json
{ "success": true, "data": { "uploadUrl": "https://s3.../presigned?...", "fileKey": "documents/report.pdf", "expiresIn": 3600 } }
```

### POST `/api/v1/documents/upload` — `multipart/form-data`
**Response `201`:**
```json
{ "success": true, "data": { "fileKey": "misc/1709672200000-report.pdf", "url": "https://storage.grclass.com/misc/report.pdf" } }
```

### DELETE `/api/v1/documents/:id`
**Response `200`:**
```json
{ "success": true, "message": "Document deleted" }
```

_(GET /:id, GET /:entityType/:entityId, POST upload, POST register — same as CLIENT.md)_

---

## 🚨 NON-CONFORMITIES

### GET `/api/v1/non-conformities/job/:jobId`
**Response `200`:**
```json
[
  { "id": "uuid", "job_id": "uuid", "description": "Fire extinguisher expired", "severity": "MAJOR", "status": "OPEN", "closure_remarks": null },
  { "id": "uuid", "job_id": "uuid", "description": "Navigation light not working", "severity": "MINOR", "status": "CLOSED", "closure_remarks": "Replaced", "closed_at": "2026-03-06T10:00:00.000Z" }
]
```

---

## 🔔 NOTIFICATIONS

### GET `/api/v1/notifications`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "user_id": "uuid", "title": "New Job Created", "message": "Client ABC Shipping submitted a new job request.", "type": "INFO", "is_read": false, "created_at": "2026-03-05T18:00:00.000Z" }] }
```

### PUT `/api/v1/notifications/:id/read`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "is_read": true } }`

### PUT `/api/v1/notifications/read-all`
**Response `200`:** `{ "success": true, "data": { "updated": 12 } }`

---

## 📊 DASHBOARD

### GET `/api/v1/dashboard`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150, "totalClients": 30, "totalVessels": 200, "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "DOCUMENT_VERIFIED": 5, "APPROVED": 8, "ASSIGNED": 12, "SURVEY_AUTHORIZED": 3, "IN_PROGRESS": 7, "SURVEY_DONE": 4, "REVIEWED": 2, "REWORK_REQUESTED": 1, "FINALIZED": 15, "PAYMENT_DONE": 20, "CERTIFIED": 400, "REJECTED": 13 },
    "totalCertificates": 300, "expiringCertificates": 12,
    "totalPayments": 400, "pendingPayments": 50,
    "recentActivity": [{ "action": "JOB_CREATED", "entity_type": "JOB", "entity_id": "uuid", "performed_by": "Client User", "timestamp": "2026-03-05T18:00:00.000Z" }]
  }
}
```

---

## 📈 REPORTS

### GET `/api/v1/reports/certificates`
**Query:** `?from_date=2026-01-01&to_date=2026-12-31&status=VALID`
**Response `200`:**
```json
{ "total": 150, "by_status": { "VALID": 120, "EXPIRED": 20, "SUSPENDED": 5, "REVOKED": 5 }, "by_type": [{ "certificate_type": "SMC", "count": 50 }], "certificates": [{ "id": "uuid", "certificate_number": "GR-CLASS-2026-0042", "vessel_name": "MV Star", "status": "VALID", "issue_date": "2026-01-15", "expiry_date": "2031-01-15" }] }
```

### GET `/api/v1/reports/surveyors`
**Response `200`:**
```json
{ "total_surveyors": 25, "active_surveyors": 18, "total_surveys_completed": 200, "surveyors": [{ "id": "uuid", "name": "John Surveyor", "total_surveys": 30, "average_completion_days": 2.5, "rework_count": 1, "rating": 4.8 }] }
```

### GET `/api/v1/reports/non-conformities`
**Response `200`:**
```json
{ "total": 45, "by_severity": { "MINOR": 20, "MAJOR": 20, "CRITICAL": 5 }, "by_status": { "OPEN": 15, "CLOSED": 30 }, "items": [{ "id": "uuid", "description": "Fire extinguisher expired", "severity": "MAJOR", "status": "CLOSED", "vessel": "MV Star" }] }
```

### GET `/api/v1/reports/financials`
**Response `200`:**
```json
{ "total_invoiced": "250000.00", "total_collected": "200000.00", "outstanding": "50000.00", "by_month": [{ "month": "2026-01", "invoiced": "50000.00", "collected": "45000.00" }], "by_client": [{ "client": "ABC Shipping", "invoiced": "80000.00", "paid": "70000.00" }] }
```

---

## 🎫 SUPPORT TICKETS

### POST `/api/v1/support`
**Request:** `{ "subject": "System issue", "description": "Error in certificate generation", "priority": "HIGH" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "user_id": "uuid", "subject": "System issue", "status": "OPEN", "priority": "HIGH", "created_at": "2026-03-05T18:00:00.000Z" } }
```

### PUT `/api/v1/support/:id/status`
**Request:** `{ "status": "RESOLVED", "internal_note": "Fixed the certificate template" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "status": "RESOLVED", "resolved_at": "2026-03-06T10:00:00.000Z", "resolved_by": "uuid" } }
```

---

## 🏴 FLAG ADMINISTRATION (ADMIN manages)

### POST `/api/v1/flags` (ADMIN only)
**Request:** `{ "flag_state_name": "Panama", "country": "PA", "authority_name": "Panama Maritime Authority", "contact_email": "info@pma.gob.pa" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "flag_state_name": "Panama", "country": "PA", "authority_name": "Panama Maritime Authority", "contact_email": "info@pma.gob.pa", "created_at": "2026-03-05T18:00:00.000Z" } }
```

### GET `/api/v1/flags`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "flag_state_name": "Panama", "country": "PA", "authority_name": "Panama Maritime Authority", "contact_email": "info@pma.gob.pa" }] }
```

### PUT `/api/v1/flags/:id` (ADMIN only)
**Request:** `{ "contact_email": "new@pma.gob.pa" }`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "contact_email": "new@pma.gob.pa" } }
```

---

## 🔄 TOCA

### PUT `/api/v1/toca/:id/status`
**Request:** `{ "status": "ACCEPTED" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "ACCEPTED", "decision_date": "2026-03-06" } }`

### GET `/api/v1/toca`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "vessel_id": "uuid", "losing_class_society": "Bureau Veritas", "gaining_class_society": "Lloyd's Register", "request_date": "2026-03-05", "status": "PENDING", "Vessel": { "vessel_name": "MV Star" } }] }
```

---

## ✅ APPROVALS

### POST `/api/v1/approvals`
**Request:** `{ "entity_type": "JOB", "entity_id": "uuid", "steps": [{ "role": "TO", "order": 1 }, { "role": "TM", "order": 2 }] }`
**Response `201`:**
```json
{ "id": "uuid", "entity_type": "JOB", "entity_id": "uuid", "status": "PENDING", "steps": [{ "id": "uuid", "role": "TO", "order": 1, "status": "PENDING" }, { "id": "uuid", "role": "TM", "order": 2, "status": "PENDING" }] }
```

### PUT `/api/v1/approvals/:id/step`
**Request:** `{ "status": "APPROVED" }`
**Response `200`:** `{ "id": "uuid", "status": "APPROVED", "current_step": 2, "overall_status": "PENDING" }`

---

## 📝 ACTIVITY REQUESTS, CHANGE REQUESTS, INCIDENTS

### POST `/api/v1/activity-requests`
**Request:** `{ "vessel_id": "uuid", "activity_type": "INSPECTION", "requested_service": "Annual Safety", "priority": "HIGH", "description": "...", "location_port": "Dubai", "proposed_date": "2026-04-10" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "request_number": "AR-2026-001", "activity_type": "INSPECTION", "status": "PENDING", "created_at": "2026-03-05T18:00:00.000Z" } }
```

### PUT `/api/v1/activity-requests/:id/status`
**Request:** `{ "status": "APPROVED", "remarks": "Converting to job" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "APPROVED" } }`

### POST `/api/v1/change-requests`
**Request:** `{ "entity_type": "VESSEL", "entity_id": "uuid", "change_description": "Update port of registry", "old_value": { "port_of_registry": "Dubai" }, "new_value": { "port_of_registry": "Singapore" } }`
**Response `201`:** `{ "message": "Change request created successfully", "change_request": { "id": "uuid", "status": "PENDING" } }`

### PUT `/api/v1/change-requests/:id/approve`
**Request:** `{ "remarks": "Approved" }`
**Response `200`:** `{ "message": "Change request approved", "change_request": { "id": "uuid", "status": "APPROVED", "approved_by": "uuid" } }`

### POST `/api/v1/incidents`
**Request:** `{ "vessel_id": "uuid", "title": "Engine Fire Alarm", "description": "Smoke detected..." }`
**Response `201`:** `{ "success": true, "data": { "id": "uuid", "status": "OPEN", "created_at": "2026-03-05T18:00:00.000Z" } }`

### PUT `/api/v1/incidents/:id/status`
**Request:** `{ "status": "INVESTIGATING", "remarks": "Team dispatched" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "INVESTIGATING" } }`

---

## ⭐ FEEDBACK | 📧 CONCT | 📋 CERT TEMPLATES

### GET `/api/v1/customer-feedback`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "rating": 5, "timeliness": 4, "professionalism": 5, "documentation": 4, "remarks": "Excellent!", "Client": { "name": "Ahmed" } }], "count": 20 } }
```

### GET `/api/v1/contact`
**Response `200`:**
```json
{ "success": true, "total": 25, "data": [{ "id": "uuid", "full_name": "John", "corporate_email": "john@smith.com", "subject": "Inquiry", "status": "NEW", "created_at": "2026-03-05T18:00:00.000Z" }] }
```

### PATCH `/api/v1/contact/:id/status`
**Request:** `{ "status": "REPLIED", "internal_note": "Sent proposal" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "REPLIED", "replied_by": "uuid" } }`

### DELETE `/api/v1/contact/:id` (ADMIN only)
**Response `204`** No body.

### POST `/api/v1/certificate-templates` (ADMIN only)
Same as checklist templates structure.

### DELETE `/api/v1/certificate-templates/:id` (ADMIN only)
**Response `200`:** `{ "success": true, "message": "Template deleted successfully" }`

---

## 🛡️ COMPLIANCE (GDPR)

### GET `/api/v1/compliance/export/:id`
**Response `200`:**
```json
{ "success": true, "data": { "user": { "id": "uuid", "name": "User", "email": "user@example.com", "role": "CLIENT" }, "client": { "company_name": "ABC" }, "activity_logs": [...], "notifications": [...] } }
```

### POST `/api/v1/compliance/anonymize/:id` (ADMIN only)
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "name": "[ANONYMIZED]", "email": "anon-uuid@anonymized.gr-class", "phone": null, "status": "INACTIVE" } }
```

---

## 📺 WEBSITE MANAGEMENT (ADMIN only)

### POST `/api/v1/website/videos` — `multipart/form-data`
Fields: `video`/`videoKey`, `thumbnail`/`thumbnailKey`, `section` (✅), `title`, `description`
**Response `201`:**
```json
{ "id": "uuid", "section": "HOME", "title": "About GR-Class", "video_url": "https://...", "thumbnail_url": "https://...", "uploaded_by": "uuid", "created_at": "2026-03-05T18:00:00.000Z" }
```

### PUT `/api/v1/website/videos/:id` — `multipart/form-data`
**Response `200`:** `{ "id": "uuid", "title": "Updated", "video_url": "https://...", "updated_at": "2026-03-06T10:00:00.000Z" }`

### DELETE `/api/v1/website/videos/:id`
**Response `204`** No body.

---

## ⚙️ SYSTEM ADMINISTRATION (ADMIN only)

### GET `/api/v1/system/health`
**Response `200`:** `{ "status": "UP", "timestamp": "2026-03-05T18:00:00.000Z" }`

### GET `/api/v1/system/readiness`
**Response `200`:** `{ "success": true, "data": { "status": "READY", "components": { "database": { "status": "CONNECTED" }, "uptime": 123456, "memory": { "used": "256MB", "total": "1024MB" } } } }`

### GET `/api/v1/system/version`
**Response `200`:** `{ "success": true, "data": { "version": "1.5.0", "build": "2026-03-05", "environment": "production" } }`

### GET `/api/v1/system/metrics`
**Response `200`:**
```json
{ "success": true, "data": { "uptime": 123456, "database": { "status": "CONNECTED", "pool_size": 10, "active_connections": 3 }, "memory": { "rss": "256MB", "heapTotal": "180MB", "heapUsed": "120MB" }, "cpu": { "user": 1234, "system": 567 } } }
```

### GET `/api/v1/system/audit-logs`
**Query:** `?page=1&limit=50&entity_type=JOB&user_id=uuid&action=UPDATE_STUS`
**Response `200`:**
```json
{ "success": true, "data": { "rows": [{ "id": "uuid", "user_id": "uuid", "action": "UPDATE_STUS", "entity_type": "JOB", "entity_id": "uuid", "old_value": "CREATED", "new_value": "DOCUMENT_VERIFIED", "ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0...", "created_at": "2026-03-05T19:10:00.000Z", "User": { "name": "TO User", "role": "TO" } }], "count": 500 } }
```

### POST `/api/v1/system/users/:id/logout`
**Response `200`:** `{ "success": true, "data": { "userId": "uuid", "message": "User session invalidated" } }`

### GET `/api/v1/system/migrations`
**Response `200`:** `{ "success": true, "data": [{ "name": "20260101-create-users", "status": "completed" }] }`

### GET `/api/v1/system/jobs/failed`
**Response `200`:** `{ "success": true, "data": [{ "id": "uuid", "type": "EMAIL_NOTIFICATION", "error": "SMTP timeout", "failed_at": "2026-03-05T17:00:00.000Z", "retry_count": 3 }] }`

### POST `/api/v1/system/jobs/:id/retry`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "status": "RETRYING" } }`

### POST `/api/v1/system/maintenance/:action` (enable/disable)
**Response `200`:** `{ "success": true, "data": { "maintenance_mode": true, "performed_by": "admin@grclass.com" } }`

### GET `/api/v1/system/feature-flags`
**Response `200`:** `{ "success": true, "data": { "flags": { "NEW_UI": true, "BE_REPORTS": false } } }`

### GET `/api/v1/system/locales`
**Response `200`:** `{ "success": true, "data": [{ "code": "en", "name": "English", "active": true }, { "code": "ar", "name": "Arabic", "active": true }] }`

---

## 🔍 SEARCH

### GET `/api/v1/search?q=star&type=vessel&limit=10`
**Response `200`:**
```json
{ "success": true, "data": { "vessels": [{ "id": "uuid", "vessel_name": "MV Star", "imo_number": "1234567", "class_status": "ACTIVE" }], "jobs": [...], "certificates": [...], "clients": [...] } }
```
