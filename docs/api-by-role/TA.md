# TA (Technical Assistant) — All APIs with Full Schemas

> **TA** has limited access — primarily viewing jobs and processing payments.

**Auth:** `Authorization: Bearer <accessToken>`

---

## 🔑 AUTH & PROFILE

### POST `/api/v1/auth/logout`
**Response `200`:** `{ "message": "Logged out successfully", "accessToken": null, "refreshToken": null }`

### GET `/api/v1/users/me`
**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "name": "TA User", "email": "ta@girik.com", "role": "TA", "phone": "+971505555555", "status": "ACTIVE", "client_id": null, "profile_pic_url": null, "last_login_at": "2026-03-05T08:00:00.000Z" } }
```

### PUT `/api/v1/users/profile-pic` — `multipart/form-data`
Field: `profile_pic` (file)
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "profile_pic_url": "https://..." } }`

### PUT `/api/v1/users/fcm-token`
**Request:** `{ "fcmToken": "token" }`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "fcm_token": "token" } }`

---

## 📋 JOBS (Read Only)

### GET `/api/v1/jobs`
**Query:** `?page=1&limit=20&status=PAYMENT_DONE`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "uuid", "vessel_id": "uuid", "certificate_type_id": "uuid",
        "reason": "Annual survey due", "target_port": "Dubai Port",
        "target_date": "2026-04-15", "job_status": "PAYMENT_DONE",
        "priority": "NORMAL", "is_survey_required": true,
        "Vessel": { "vessel_name": "MV Star" },
        "CertificateType": { "name": "SMC" },
        "requester": { "name": "Ahmed Ali" }
      }
    ],
    "count": 20
  }
}
```

---

## 💰 PAYMENTS

### PUT `/api/v1/payments/:id/pay` — `multipart/form-data`
Fields: `receipt` (file), `payment_date` (string)
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "payment_status": "PAID",
    "payment_date": "2026-03-05",
    "receipt_url": "https://storage.girik.com/receipts/receipt.pdf",
    "verified_by_user_id": "uuid"
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
    "pendingPayments": 10,
    "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "APPROVED": 8, "FINALIZED": 15, "PAYMENT_DONE": 20, "CERTIFIED": 400 },
    "recentActivity": [{ "action": "PAYMENT_RECEIVED", "entity_type": "PAYMENT", "entity_id": "uuid", "timestamp": "2026-03-05T18:00:00.000Z" }]
  }
}
```

---

## 🔔 NOTIFICATIONS

### GET `/api/v1/notifications`
**Response `200`:**
```json
{ "success": true, "data": [{ "id": "uuid", "user_id": "uuid", "title": "Payment Received", "message": "Payment of $5000 received for job #JOB-2026-042.", "type": "INFO", "is_read": false, "created_at": "2026-03-05T18:00:00.000Z" }] }
```

### PUT `/api/v1/notifications/:id/read`
**Response `200`:** `{ "success": true, "data": { "id": "uuid", "is_read": true } }`

### PUT `/api/v1/notifications/read-all`
**Response `200`:** `{ "success": true, "data": { "updated": 3 } }`

---

## 🎫 SUPPORT

### POST `/api/v1/support`
**Request:** `{ "subject": "Receipt upload failing", "description": "Cannot upload receipt PDF", "priority": "MEDIUM" }`
**Response `201`:**
```json
{ "success": true, "data": { "id": "uuid", "user_id": "uuid", "subject": "Receipt upload failing", "status": "OPEN", "priority": "MEDIUM", "created_at": "2026-03-05T18:00:00.000Z" } }
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
