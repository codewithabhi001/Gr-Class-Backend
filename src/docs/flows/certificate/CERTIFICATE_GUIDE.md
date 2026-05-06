# 🚢 Certificate Module: Complete Implementation Guide

This guide defines the end-to-end certification lifecycle, role-based permissions, and API contracts for the backend.

---

## 🏗️ 1. Core Lifecycle & State Machine

### **Phase 1: Pre-Certification (Job Lifecycle)**
1.  **Survey Finalization**: The Survey Report is approved and moved to `FINALIZED`.
2.  **Job Sync**: The Job automatically moves to `FINALIZED`.
3.  **Status Meaning**: Work is done; compliance is verified; awaiting legal certificate.

### **Phase 2: Certificate Drafting**
*   **Trigger**: Admin/TM calls `POST /api/v1/certificates`.
*   **Guards**: Checks Payment (`PAID`), Survey (`FINALIZED`), Attendance Photo, and zero open NCs.
*   **State**: Certificate status = `DRAFT`. Job status remains `FINALIZED`.
*   **Outcome**: A preview PDF is generated in S3.

### **Phase 3: Official Issuance**
*   **Trigger**: General Manager (GM) calls `POST /api/v1/certificates/:id/issue`.
*   **Indirect Check (Dashboard)**: The GM Dashboard only displays jobs in **`actionable_items.pending_issuance`** if a draft has been generated (`generated_certificate_id !== null`).
*   **Safety Guard**: You cannot issue a certificate that hasn't been drafted. The system checks `cert.status === 'DRAFT'`.
*   **State**: Certificate status = `VALID`. Job status = `CERTIFIED`.
*   **Outcome**: Official legal PDF is generated and signed. Job is now closed (terminal).

---

## 🔐 2. Roles & Permissions Matrix

| User Role | Generate Draft | Edit Draft | Issue (Official) | Revoke/Renew | View/Download |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Admin** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **General Manager (GM)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Technical Manager (TM)** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Technical Officer (TO)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Client** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📡 3. API Reference

### **3.1 Generation & Issuance**

#### **Generate Certificate (Draft)**
`POST /api/v1/certificates`
*   **Request Payload**:
    ```json
    {
      "job_id": "uuid",
      "validity_years": 5,
      "certificate_term": "FULL_TERM",
      "certificate_authority_id": "uuid",
      "flag_administration_id": "uuid"
    }
    ```
*   **Response**: `201 Created` with Certificate object.

#### **Update Draft Details**
`PUT /api/v1/certificates/:id`
*   **Request Payload**:
    ```json
    {
      "manual_text": { "tag1": "value1", "remarks": "..." },
      "issue_date": "2024-05-06",
      "expiry_date": "2029-05-06"
    }
    ```

#### **Issue Certificate (Finalize)**
`POST /api/v1/certificates/:id/issue`
*   **Action**: Moves status to `VALID` and Job to `CERTIFIED`.
*   **Request Payload**: (Same as Update Draft - optional override).

---

### **3.2 Retrieval & Verification**

#### **List Certificates**
`GET /api/v1/certificates?page=1&limit=10&status=VALID&vessel_id=...`
*   **Response**: Paginated list with `status_counts`.

#### **Download PDF**
`GET /api/v1/certificates/:id/download`
*   **Action**: Returns a 302 Redirect to a secure, time-limited S3 signed URL.

#### **Public Verification**
`GET /api/v1/certificates/verify/:number`
*   **Action**: No auth required. Returns basic validity info for public scanning.

---

### **3.3 Lifecycle Maintenance**

#### **Revoke / Suspend**
`PUT /api/v1/certificates/:id/revoke` | `PUT /api/v1/certificates/:id/suspend`
*   **Payload**: `{ "reason": "Non-payment or non-compliance" }`

#### **Reissue (Correction)**
`POST /api/v1/certificates/:id/reissue`
*   **Action**: Revokes old version and creates a new `DRAFT` (Version +1).

#### **Renew (Expiry)**
`PUT /api/v1/certificates/:id/renew`
*   **Action**: Marks old cert as `EXPIRED` and creates a new `DRAFT`.

---

## 🔄 4. Dashboard Actionable Items
To ensure a smooth workflow, the following dashboards include specific actionable lists:

### **TM / Admin Dashboard**
*   **List**: `actionable_items.drafting_needed`
*   **Criteria**: Jobs that are **`FINALIZED`** but have **no draft certificate** yet (`generated_certificate_id IS NULL`).
*   **Purpose**: Alerts the TM/Admin that the survey is done and they need to generate the draft.

### **General Manager (GM) Dashboard**
*   **List**: `actionable_items.pending_issuance`
*   **Criteria**: Jobs that are **`FINALIZED`** and **already have a draft certificate** ready for review (`generated_certificate_id IS NOT NULL`).
*   **Purpose**: Alerts the GM that a draft is ready for official issuance/signing.

---

## 🔄 5. Automated Background Logic

*   **Expiration Monitor**: A cron job runs every night to check `expiry_date`. If today > expiry, status moves from `VALID` → `EXPIRED`.
*   **Tag Injection**: Templates automatically pull data using the following tags:
    *   `{{vessel_name}}`, `{{imo_number}}`, `{{flag_state}}`
    *   `{{issue_date}}`, `{{expiry_date}}`, `{{certificate_number}}`
    *   `{{place_of_survey}}` (mapped from Job's target port).
