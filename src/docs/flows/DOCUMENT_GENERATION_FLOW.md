# Dynamic Document Generation Workflow

This document explains the end-to-end architecture and workflow for generating automated Checklists and Certificates within the GIRIK system. It covers how templates are uploaded, stored, dynamically filled with job data, and securely accessed by clients and surveyors.

---

## 1. Core Concept & Technologies
The system uses a **Mail Merge (Document Generation)** pattern. 
- **Administrators** upload standard MS Word documents (`.docx`) containing placeholder tags like `{{vessel_name}}` or `{{imo_number}}`.
- **Backend Service** (using libraries like `docxtemplater`) intercepts these templates when needed.
- **Dynamic Injection**: The backend pulls live data from the Database (Vessel, Client, Job, Surveyor) and replaces the `{{tags}}` with actual values.
- **Output**: The system produces job-specific DOCX checklists for Surveyors to fill, and read-only PDF Certificates for Clients to download.

---

## 2. Template Storage & Management Flow

### 2.1 Uploading Templates (Frontend to S3)
1. Admin selects a `.docx` file in the UI.
2. Frontend calls `GET /api/v1/templates/get-upload-url` (or checklist equivalent).
3. Backend returns a short-lived **S3 Presigned PUT URL** and a **Raw S3 Key** (e.g., `checklist-templates/1234_abc.docx`).
4. Frontend uploads the file directly to S3 using the PUT URL.
5. Frontend saves the template metadata (passing the **Raw S3 Key**) to the database.

### 2.2 Template Variables (Strict vs Auto-Extract)
- The database schema supports an optional `variables` JSON array.
- **Auto-Extract (Preferred & Scalable)**: If left empty, the backend automatically reads the `.docx` file on the fly and finds all `{{tags}}`.
- **Strict Validation**: If defined by the Admin, the system enforces that the DOCX file contains exactly those tags, preventing spelling mistakes by surveyors/admins.

### 2.3 Resolving S3 Keys (The `NoSuchKey` Prevention)
- In the Database, template files are stored as **Raw Keys** (e.g., `template_file_url`, `template_files`).
- **Important Backend Rule**: The global `fileAccess.service.js` `resolveEntity()` function is **bypassed** for template file keys.
- If the backend eagerly resolved these keys into full Signed URLs, the Admin UI's "View/Download" action (which expects a Raw Key to fetch a fresh URL on-demand) would crash with an S3 `NoSuchKey` error.
- **Flow**: DB (Raw Key) ➝ Frontend UI (Raw Key) ➝ User Clicks View ➝ Frontend requests Signed URL for Raw Key ➝ Opens Document securely.

---

## 3. Automated Generation Workflows

### 3.1 Checklist Generation (For Surveyors)
When a Surveyor opens an assigned job, they need a pre-filled checklist to take onto the ship.
1. Surveyor requests the checklist.
2. Backend identifies the `ACTIVE` Checklist Template linked to the job's Certificate Type.
3. Backend fetches the master `.docx` template from S3.
4. `buildTagValuesForJob(jobId)` aggregates all Vessel, Client, and Surveyor details.
5. Backend injects the tag values into the master DOCX.
6. The newly generated, job-specific `.docx` is saved to S3 under `documents/jobs/{id}/checklists/`.
7. A record is created in the `documents` table with `document_type = 'CHECKLIST_PREFILLED'`.
8. Surveyor receives a secure signed URL to download the pre-filled DOCX.

### 3.2 Certificate Generation & Issuance Flow
The certificate lifecycle is separated into two distinct phases to ensure administrative oversight.

**Phase A: Generating the Draft (Admin / Technical Manager)**
1. Admin or Technical Manager (TM) initiates draft generation via `POST /api/v1/certificates`.
2. Backend validates job status is `FINALIZED` and payment is `PAID`.
3. Backend identifies the specific Certificate Template and fetches the master `.docx`.
4. Injects Vessel, Client, and Job findings into the document.
5. The system generates a `.docx` (and optional preview PDF) saved to S3.
6. A `Certificate` DB record is created with **`status = 'DRAFT'`**.
7. The Job remains in the **`FINALIZED`** state.

**Phase B: Official Issuance (General Manager)**
1. General Manager (GM) reviews the draft and initiates official issuance via `POST /api/v1/certificates/:id/issue`.
2. Backend finalizes the document, potentially adding official signatures or digital stamps.
3. The certificate record is updated to **`status = 'VALID'`**.
4. The Job status is updated to **`CERTIFIED`** (Terminal state).
5. Client receives a notification and can download the official finalized Certificate.

---

## 4. Standard Tag Mapping Glossary
The backend `tagBuilder.util.js` maps the following standard tags into any uploaded template:

| Tag Category | Placeholder Tags Available in DOCX | Source |
| :--- | :--- | :--- |
| **Vessel Details** | `{{vessel_name}}`, `{{imo_number}}`, `{{gross_tonnage}}`, `{{flag}}`, `{{port_of_registry}}`, `{{vessel_type}}` | `Vessel` Model |
| **Client Details** | `{{client_name}}`, `{{company_name}}`, `{{client_address}}` | `Client` Model |
| **Job Details** | `{{job_id}}`, `{{survey_date}}`, `{{port_of_survey}}` | `JobRequest` Model |
| **Surveyor Details** | `{{surveyor_name}}`, `{{surveyor_license_no}}` | `User` (Surveyor) Model |

*Note: Any template uploaded into the system will automatically have these tags replaced during the generation phase.*
