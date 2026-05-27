# GR-CLASS: Complete Job Lifecycle & API Flow

This document provides a single-source-of-truth for the entire lifecycle of a Maritime Certification Job, from initial request to official certificate issuance.

---

## 🏗️ 1. High-Level Process Map

```mermaid
graph TD
    %% Roles
    subgraph "CLIENT / GM"
        START((START)) --> REQUEST[1. Job Request]
    end

    subgraph "ADMIN / TO"
        REQUEST --> VERIFY[2. Document Verification]
    end

    subgraph "GM / ADMIN"
        VERIFY --> APPROVE[3. Job Approval]
        APPROVE --> ASSIGN[4. Surveyor Assignment]
    end

    subgraph "TM / ADMIN"
        ASSIGN --> AUTH[5. Survey Authorization]
    end

    subgraph "SURVEYOR (Hybrid Flow)"
        AUTH --> CHECKIN[6. Check-in]
        CHECKIN --> DOWNLOAD[7. Fetch Master Blanks]
        DOWNLOAD --> INSPECT[8. Vessel Inspection]
        INSPECT --> SIGN[9. Physical wet-signature]
        SIGN --> UPLOAD_SCAN[10. Upload Signed Scans]
        UPLOAD_SCAN --> SUBMIT[11. Submit Report]
    end

    subgraph "TO / TM / ADMIN"
        SUBMIT --> TECH_REVIEW[12. Technical Review]
        TECH_REVIEW --> FINALIZE[13. Final Approval]
        FINALIZE --> ISSUE[14. Certificate Issuance]
        ISSUE --> END((CERTIFIED))
    end

    %% Rejection/Rework paths
    TECH_REVIEW -- "REWORK_REQUIRED" --> CHECKIN
    FINALIZE -- "REWORK_REQUIRED" --> CHECKIN
```

---

## 🛠️ 2. Step-by-Step API Guide (Strict RBAC Enforced)

> [!CAUTION]
> **Segregation of Duties (SoD)** is strictly enforced. No role (including `ADMIN`) can bypass these assigned operational authorities.

### Phase 1: Initiation & Planning
| Step | Action | Endpoint | Role Allowed | Status Change |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Request Job** | `POST /api/v1/jobs` | `CLIENT`, `GM` | `CREATED` |
| 2 | **Update Priority** | `PUT /api/v1/jobs/:id/priority` | `GM`, `TM` | `URGENT / NORMAL` |
| 3 | **Verify Docs (per cert)** | `PUT /api/v1/jobs/certificates/:jobCertificateId/verify-documents` | `TO`, `GM`, `ADMIN` | Cert → `DOCUMENT_VERIFIED`; parent → `IN_PROGRESS` |
| 4 | **Approve** | `PUT /api/v1/jobs/:id/approve-request` | `GM`, `ADMIN` | `APPROVED` when all certs are `DOCUMENT_VERIFIED` (or legacy single-cert `DOCUMENT_VERIFIED` job) |
| 5a | **Assign all certs** | `PUT /api/v1/jobs/:id/assign` | `GM`, `ADMIN` | Sets surveyor on job + every `JobCertificate` |
| 5b | **Assign one cert** | `PUT /api/v1/jobs/certificates/:jobCertificateId/assign` | `GM`, `ADMIN` | Split surveyor assignment per certificate |
| 5c | **Reassign one cert** | `PUT /api/v1/jobs/certificates/:jobCertificateId/reassign` | `GM`, `TM`, `ADMIN` | Updates cert row + linked survey |

### Phase 2: Authorization & Field Work (The Hybrid Flow)
| Step | Action | Endpoint | Role Allowed | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 6 | **Authorize (per cert)** | `PUT /api/v1/jobs/certificates/:jobCertificateId/authorize-survey` | `TM`, `ADMIN` | Cert → `SURVEY_AUTHORIZED` |
| 7 | **Check-in** | `POST /api/v1/surveys/start` | **ONLY `SURVEYOR`** | Records GPS/Timestamp. |
| 8 | **Fetch Templates**| `GET /api/v1/checklist-templates/job/:id`| **ONLY `SURVEYOR`** | Downloads PDF/Docs blanks. |
| 9 | **Item Evidence** | `GET /api/v1/checklists/jobs/:id/get-upload-url` | **ONLY `SURVEYOR`** | Photo evidence upload URL. |
| 10 | **Upload Scans** | `PUT /api/v1/surveys/job-certificates/:jobCertificateId/signed-checklist` | **ONLY `SURVEYOR`** | Scanned wet-signatures. |
| 11 | **Submit Report** | `POST /api/v1/surveys` | **ONLY `SURVEYOR`** | Moves to `SURVEY_DONE`. |

### Phase 3: Review, Rework & Certification
| Step | Action | Endpoint | Role Allowed | Status Change |
| :--- | :--- | :--- | :--- | :--- |
| 12 | **Tech Review (per cert)** | `PUT /api/v1/jobs/certificates/:jobCertificateId/review` | `TO` | Checklist approval; cert stays `SURVEY_DONE` |
| 13 | **Request Rework (per cert)** | `PUT /api/v1/surveys/job-certificates/:jobCertificateId/rework` | `TM`, `GM`, `TO`, `ADMIN` | Cert/survey rework without blocking sibling certs |
| 14 | **Finalize** | `PUT /api/v1/surveys/jobs/:id/finalize` | **ONLY `TM`** | `FINALIZED` |
| 15 | **Draft Cert** | `POST /api/v1/certificates` | `TM`, `GM` | Creates cert draft. |
| 16 | **Issue Cert** | `POST /api/v1/certificates/:id/issue` | **ONLY `GM`** | **FINISH** (Generates PDF). |

---

## 📂 3. Document Requirements per Role

### For CLIENT
- Upload Vessel Particulars (Registration, Drawings) during initiation.
- Download issued certificates once the job is `CERTIFIED`.

### For SURVEYOR (Hybrid workflow)
1. **Check-in**: Must be within GPS range of the vessel.
2. **Master Templates**: Download the `template_files` provided by Admin.
3. **Wet Signatures**: Print, sign physically, and scan.
4. **Digitization**: Upload the scans via `signed-checklist` API.
5. **Double-Check**: Ensure all non-conformities are logged before submission.

### For MANAGEMENT (GM/TM/TO)
- **TO**: Cross-verify "Digital Yes/No" with the "Scanned Document" findings.
- **TM**: Final quality gate. Can trigger **Rework** if the signed scan is blurry or incomplete.

---

## 🔄 4. State Machine Summary
| Status | Meaning |
| :--- | :--- |
| `CREATED` | New request from Client. |
| `APPROVED` | GM has cleared the financial/admin check. |
| `ASSIGNED` | Surveyor is selected. |
| `IN_PROGRESS` | Surveyor has checked-in and is working. |
| `SURVEY_DONE` | Report submitted, pending technical review. |
| `REWORK_REQUIRED`| Report sent back to Surveyor for corrections. |
| `FINALIZED` | Technical and Management approval complete. |
| `CERTIFIED` | Official certificate has been issued. |

---

> [!IMPORTANT]
> **Data Integrity Rule**: A survey cannot be submitted (`SURVEYOR`) unless at least one proof or signed checklist scan is present if the "Digital-Physical Hybrid" mode is enabled.
 is enabled.
