# FLAG_ADMIN Role — All APIs with Full Schemas

> **FLAG_ADMIN** = Flag State Administration. Very limited access — mainly viewing jobs.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE

### POST `/api/v1/auth/logout`
**Response `200`:** `{ "message": "Logged out successfully", "accessToken": null, "refreshToken": null }`

### GET `/api/v1/users/me`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "name": "Flag Admin", "email": "flag@girik.com", "role": "FLAG_ADMIN", "phone": "+971506666666", "status": "ACTIVE", "client_id": null, "profile_pic_url": null, "last_login_at": "2026-03-05T08:00:00.000Z" } }
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "profile_pic_url": "https://..." } }`

### PUT `/api/v1/users/fcm-token`
**Request:** `{ "fcmToken": "token" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "fcm_token": "token" } }`

---

## 📋 JOBS (Read Only)

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "certificate_type_id": "uuid",
        "reason": "Annual survey due", "target_port": "Dubai Port",
        "target_date": "2026-04-15", "job_status": "ASSIGNED",
        "priority": "NORMAL", "is_survey_required": true,
        "Vessel": { "vessel_name": "MV Star", "imo_number": "1234567" },
        "CertificateType": { "name": "Safety Management Certificate" },
        "requester": { "name": "Ahmed Ali" },
        "surveyor": { "name": "John Surveyor" }
      }
    ],
    "count": 500
  }
}
```

---

## 📊 DASHBOARD

### GET `/api/v1/dashboard`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "APPROVED": 8, "ASSIGNED": 12, "IN_PROGRESS": 7, "CERTIFIED": 400, "REJECTED": 13 },
    "recentActivity": [{ "action": "JOB_CERTIFIED", "entity_type": "JOB", "entity_id": "uuid", "timestamp": "2026-03-05T18:00:00.000Z" }]
  }
}
```

---

## 🔔 NOTIFICATIONS

### GET `/api/v1/notifications`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "user_id": "uuid", "title": "Job Certified", "message": "Job #JOB-2026-042 for MV Star has been certified.", "type": "INFO", "is_read": false, "created_at": "2026-03-05T18:00:00.000Z" }] }
```

### PUT `/api/v1/notifications/:id/read`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "is_read": true } }`

### PUT `/api/v1/notifications/read-all`
**Response `200`:** `{ "success": true, "data": { "updated": 2 } }`

---

## 🎫 SUPPORT

### POST `/api/v1/support`
**Request:** `{ "subject": "Access issue", "description": "Cannot view certain jobs", "priority": "MEDIUM" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "user_id": "uuid", "subject": "Access issue", "status": "OPEN", "priority": "MEDIUM", "created_at": "2026-03-05T18:00:00.000Z" } }
```

### GET `/api/v1/support` | GET `/api/v1/support/:id`
Same as [CLIENT.md](./CLIENT.md)

---

## 🔍 SEARCH

### GET `/api/v1/search?q=keyword`
**Response `200`:**
```json
{ "success": true, "data": { "vessels": [...], "jobs": [...], "certificates": [...], "clients": [...] } }
```

---

## ✅ CHECKLISTS (Read Only)

### GET `/api/v1/checklists/jobs/:jobId`
Same as [SURVEYOR.md](./SURVEYOR.md)

---

## ⚙️ SYSTEM

### GET `/api/v1/system/health`
**Response `200`:** `{ "status": "UP", "timestamp": "2026-03-05T18:00:00.000Z" }`

### GET `/api/v1/system/readiness`
**Response `200`:** `{ "success": true, "data": { "status": "READY", "components": { "database": { "status": "CONNECTED" } } } }`

### GET `/api/v1/system/version`
**Response `200`:** `{ "success": true, "data": { "version": "1.5.0", "build": "2026-03-05", "environment": "production" } }`
