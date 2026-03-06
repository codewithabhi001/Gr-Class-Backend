# 15 — Dashboard API

**Base URL:** `/api/v1/dashboard`  
**Auth:** `Authorization: Bearer <accessToken>`

---

## GET `/api/v1/dashboard`

> **Access:** ALL roles (`ADMIN`, `GM`, `TM`, `TO`, `TA`, `SURVEYOR`, `CLIENT`, `FLAG_ADMIN`)  
> Returns role-specific dashboard data. The backend automatically detects the user's role and returns appropriate data.

### Request Body
None

---

### Response for `ADMIN` — `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalClients": 30,
    "totalVessels": 200,
    "totalJobs": 500,
    "jobsByStatus": {
      "CREATED": 10,
      "DOCUMENT_VERIFIED": 5,
      "APPROVED": 8,
      "ASSIGNED": 12,
      "SURVEY_AUTHORIZED": 3,
      "IN_PROGRESS": 7,
      "SURVEY_DONE": 4,
      "REVIEWED": 2,
      "REWORK_REQUESTED": 1,
      "FINALIZED": 15,
      "PAYMENT_DONE": 20,
      "CERTIFIED": 400,
      "REJECTED": 13
    },
    "totalCertificates": 300,
    "expiringCertificates": 12,
    "totalPayments": 400,
    "pendingPayments": 50,
    "recentActivity": [
      {
        "action": "JOB_CREATED",
        "entity_type": "JOB",
        "entity_id": "uuid",
        "performed_by": "Client User",
        "timestamp": "2026-03-05T18:00:00.000Z"
      }
    ]
  }
}
```

### Response for `GM` — `200 OK`
```json
{
  "success": true,
  "data": {
    "totalClients": 30,
    "totalVessels": 200,
    "totalJobs": 500,
    "jobsByStatus": { "CREATED": 10, "APPROVED": 8, "..." : "..." },
    "totalCertificates": 300,
    "pendingApprovals": 5,
    "pendingPayments": 50,
    "recentActivity": [...]
  }
}
```

### Response for `TM` — `200 OK`
```json
{
  "success": true,
  "data": {
    "pendingAuthorizations": 3,
    "activeSurveys": 7,
    "pendingReview": 4,
    "totalSurveyors": 25,
    "availableSurveyors": 18,
    "jobsByStatus": { "..." : "..." },
    "recentSurveys": [...]
  }
}
```

### Response for `TO` — `200 OK`
```json
{
  "success": true,
  "data": {
    "pendingVerification": 10,
    "pendingReview": 4,
    "totalJobs": 500,
    "jobsByStatus": { "..." : "..." },
    "recentJobs": [...]
  }
}
```

### Response for `SURVEYOR` — `200 OK`
```json
{
  "success": true,
  "data": {
    "assignedJobs": 5,
    "inProgressJobs": 2,
    "completedJobs": 20,
    "upcomingJobs": [
      {
        "id": "uuid",
        "reason": "Annual survey",
        "target_date": "2026-04-15",
        "target_port": "Dubai Port",
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "recentSubmissions": [
      {
        "id": "uuid",
        "survey_status": "SUBMITTED",
        "submitted_at": "2026-03-04T20:00:00.000Z"
      }
    ]
  }
}
```

### Response for `CLIENT` — `200 OK`
```json
{
  "success": true,
  "data": {
    "totalVessels": 5,
    "activeJobs": 3,
    "pendingJobs": 2,
    "expiringSoon": 1,
    "recentJobs": [
      {
        "id": "uuid",
        "job_status": "ASSIGNED",
        "reason": "Annual survey",
        "target_date": "2026-04-15",
        "Vessel": { "vessel_name": "MV Star" }
      }
    ],
    "certificates": [
      {
        "id": "uuid",
        "certificate_number": "GIRIK-2026-0042",
        "status": "VALID",
        "expiry_date": "2031-01-15",
        "Vessel": { "vessel_name": "MV Star" },
        "CertificateType": { "name": "SMC" }
      }
    ]
  }
}
```
