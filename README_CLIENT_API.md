# GIRIK Maritime Operations - Client API Documentation (Final Audit v1.0)

This is the definitive API reference for developing the **GIRIK Client Portal**.  
*All endpoints are prefixed with `/api/v1`.*

---

## 1. Authentication & Security

### Public Access
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | `{ "email": "", "password": "" }` | Generic login for all roles |
| `/auth/forgot-password` | `POST` | `{ "email": "" }` | Trigger reset email |
| `/auth/reset-password` | `POST` | `{ "token": "", "newPassword": "" }` | Submit new password |
| `/certificates/verify/:num`| `GET` | - | Public certificate verification |

### Authenticated (Bearer Token required)
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/auth/change-password` | `POST` | `{ "oldPassword": "", "newPassword": "" }` | Update from profile |
| `/clients/profile` | `GET` | - | Fetches company & user details |
| `/auth/logout` | `POST` | - | Invalidate session |

---

## 2. Vessel & Certificate Portfolio

### Vessels
- **List Vessels:** `GET /vessels`
  - *Returns:* Array of ships owned by the client.
- **Vessel Detail:** `GET /vessels/:id`
  - *Includes:* Stats, status, and related documents.

### Certificates
- **List issued:** `GET /certificates`
- **Expiring soon:** `GET /certificates/expiring` (Defaults to 90 days)
- **Vessel-specific:** `GET /certificates/vessel/:vesselId`
- **Download PDF:** `GET /certificates/:id/download` (HTTP 302 Redirect to S3)
- **Types Lookup:** `GET /certificates/types` (Use for dropdowns in Request Job)

---

## 3. Job Workflow & Communication

### Survey Requests
- **Create Job:** `POST /jobs`
  - **Body:**
    ```json
    {
      "vessel_id": "UUID",
      "certificate_type_id": "UUID",
      "reason": "Annual/Renewal/Occasional",
      "target_port": "Port Name",
      "target_date": "YYYY-MM-DD",
      "uploaded_documents": [
        { "required_document_id": "UUID", "file_url": "S3-Key" }
      ]
    }
    ```
- **Cancel:** `PUT /jobs/:id/cancel` (Only if in `CREATED` status)

### Real-time Communication
- **Chat History:** `GET /jobs/:id/messages/external`
- **Post Message:** `POST /jobs/:id/messages` (Form-Data)
  - `message`: String
  - `attachment`: Binary (Optional small file)

---

## 4. Special Requests & Reporting

### Activity Requests (General Service)
- **Endpoint:** `POST /activity-requests`
- **Payload:** `{ "vessel_id": "UUID", "activity_type": "INSPECTION/AUDIT/...", "requested_service": "...", "priority": "...", "location_port": "...", "proposed_date": "..." }`

### Incident Reporting
- **Endpoint:** `POST /incidents`
- **Payload:** `{ "vessel_id": "UUID", "title": "...", "description": "..." }`

### Change Requests (Data Correction)
- **Endpoint:** `POST /change-requests`
- **Payload:** `{ "entity_type": "VESSEL/CERTIFICATE", "entity_id": "UUID", "change_description": "...", "new_value": {} }`

---

## 5. Support & Notifications

### Help Desk
- **New Ticket:** `POST /support`
- **Payload:** `{ "subject": "...", "description": "...", "priority": "LOW/MEDIUM/HIGH" }`
- **My Tickets:** `GET /support`

### Real-time Notifications
- **Fetch Alerts:** `GET /notifications`
- **Mark Read:** `PUT /notifications/:id/read`
- **Mark All:** `PUT /notifications/read-all`

---

## 6. S3 File Upload (Direct-to-Cloud)

**Standard Workflow for Frontend:**
1.  **Request URL:** `GET /documents/get-upload-url?fileName=ship.pdf&fileType=application/pdf&folder=documents`
2.  **Immediate Action:** Perform `PUT` to `uploadUrl` with binary data.
3.  **Completion:** Store the `fileKey` to send in subsequent business API calls.

---

## Response Formats

### Standard Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed"
}
```

### Standard Error (4xx/5xx)
```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "errors": { "field_name": "error detail" }
}
```
