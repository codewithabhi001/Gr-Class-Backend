# 🚢 Certificate Module: Frontend Implementation Guide

This document provides the technical specifications and workflow requirements for implementing the Certificate Management interface.

---

## 🏗️ 1. Core Workflow Logic

The certification process follows a strict state-machine driven by compliance guards.

### **Phase A: Preparation (Drafting)**
1.  **Trigger**: A Job moves to `FINALIZED` (Survey done + Reviewed + Payment Verified).
2.  **Action**: Admin/TM triggers `POST /api/v1/certificates`.
3.  **Outcome**: 
    *   A **Draft Certificate** is created.
    *   A preview PDF is generated based on the template.
    *   **Job Status remains `FINALIZED`**.
    *   The UI should show a "Draft" status on the certificate list.

### **Phase B: Review & Data Entry**
1.  **Action**: Admin/TM can edit the draft via `PUT /api/v1/certificates/:id`.
2.  **Fields**: They can update the Flag State, Authority, Expiry Date, or `manual_text` (JSON fields used for custom template tags like "Conditions of Class").

### **Phase C: Official Issuance**
1.  **Trigger**: GM clicks "Issue Certificate".
2.  **Endpoint**: `POST /api/v1/certificates/:id/issue`.
3.  **Outcome**:
    *   Certificate status moves to `VALID`.
    *   **Job Status moves to `CERTIFIED`** (Job becomes terminal).
    *   Official PDF is generated with a permanent S3 link.

---

## 🔐 2. Roles & Permissions

| Action | Allowed Roles | Endpoint |
| :--- | :--- | :--- |
| **View List / Search** | ADMIN, GM, TM, TO, CLIENT | `GET /api/v1/certificates` |
| **Generate Draft** | ADMIN, GM, TM | `POST /api/v1/certificates` |
| **Edit Draft** | ADMIN, GM, TM | `PUT /api/v1/certificates/:id` |
| **Official Issuance** | **GM ONLY** | `POST /api/v1/certificates/:id/issue` |
| **Revoke / Suspend** | TM, ADMIN | `PUT /api/v1/certificates/:id/revoke` |
| **Renewal / Reissue** | TM, ADMIN | `PUT /api/v1/certificates/:id/renew` |
| **Download PDF** | ANY | `GET /api/v1/certificates/:id/download` |

---

## 📡 3. API Reference

### **3.1 Generate Draft**
Used to initialize a certificate from a finalized job.
- **Method**: `POST`
- **URL**: `/api/v1/certificates`
- **Payload**:
```json
{
  "job_id": "uuid",
  "validity_years": 5, // Optional, default 1
  "certificate_term": "FULL_TERM", // FULL_TERM | SHORT_TERM
  "certificate_authority_id": "uuid", // Optional
  "flag_administration_id": "uuid" // Optional
}
```

### **3.2 Update Draft**
Used to refine the data before official signing.
- **Method**: `PUT`
- **URL**: `/api/v1/certificates/:id`
- **Payload**:
```json
{
  "manual_text": {
    "remarks": "Vessel must undergo annual survey...",
    "condition_1": "Standard class rules apply"
  },
  "remarks": "Internal note for the team",
  "expiry_date": "2029-12-31"
}
```

### **3.3 Issue Certificate**
**CRITICAL**: This is the final step that closes the job and notifies the client.
- **Method**: `POST`
- **URL**: `/api/v1/certificates/:id/issue`
- **Payload**: Same as Update Draft (optional).

### **3.4 Upload External Certificate**
Used for vessels that were certified by other societies before joining.
- **Method**: `POST`
- **URL**: `/api/v1/certificates/vessel/:vesselId/external`
- **Payload**:
```json
{
  "certificate_type_id": "uuid",
  "certificate_number": "EX-12345",
  "issue_date": "2024-01-01",
  "expiry_date": "2025-01-01",
  "s3_key": "raw/s3/path/to/uploaded/file.pdf"
}
```

---

## 📊 4. UI Components Requirements

### **Status Badges**
- `DRAFT`: Grey/Yellow (Editable).
- `VALID`: Green (Official).
- `EXPIRED`: Red.
- `REVOKED`: Black/Red.

### **History Component**
Use `GET /api/v1/certificates/:id/history` to show the lifecycle trail.
**Response Item:**
```json
{
  "status": "VALID",
  "change_reason": "Officially issued after review",
  "changed_at": "2024-05-06T10:00:00Z",
  "changed_by_user_id": "uuid"
}
```

### **Verification QR**
The certificates are publically verifiable. The frontend should provide a verification lookup at:
`/certificate/verify/:certificate_number`
(This hits the public backend endpoint `GET /api/v1/certificates/verify/:number`)

---

## ⚠️ 5. Common Errors & Guards

| Error Code | Meaning | UI Action |
| :--- | :--- | :--- |
| `COMPLIANCE_VIOLATION` | Payment missing or Survey not finalized. | Block "Generate" button, show warning. |
| `NC_OPEN_GUARD` | Open Non-Conformities found. | Show link to NC module for resolution. |
| `FORBIDDEN` | Role (e.g. TO) trying to Issue. | Hide "Issue" button for unauthorized roles. |
