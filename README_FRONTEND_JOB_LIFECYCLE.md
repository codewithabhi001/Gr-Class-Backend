# GIRIK Job & Document Lifecycle Guide (For Web Developers)

This document outlines the complete workflow from the perspective of a **Client** (creating the job and uploading documents) and internal staff like **Technical Officers (TO)**, **General Managers (GM)**, and **Technical Managers (TM)**.

---

## 1. Job Creation & Initial Uploads (Client)

The workflow begins when a client wants to request a certification survey for their vessel.

**Endpoint:** `POST /api/v1/jobs`
**Role:** `CLIENT`

- When a client creates a job, they specify the `vessel_id` and the `certificate_type_id`.
- The system checks if there are **mandatory documents** required for that certificate type.
- The client MUST upload all mandatory documents in the `uploaded_documents` array to successfully create the job.
- **Additional/Custom Documents:** The client can also upload extra documents that aren't on the mandatory list by providing a `custom_document_name` instead of a `required_document_id`.

**Payload Example:**
```json
{
  "vessel_id": "uuid-vessel",
  "certificate_type_id": "uuid-cert",
  "priority": "NORMAL",
  "remarks": "Please process quickly",
  "uploaded_documents": [
    {
      "required_document_id": "uuid-req-doc-1",
      "file_url": "https://s3.aws.com/..."
    },
    {
      "custom_document_name": "Additional Insurance Copy",
      "file_url": "https://s3.aws.com/..."
    }
  ]
}
```

*Result:* The job is created with `job_status: 'CREATED'`.

---

## 2. Managing Job Documents (Client & TO)

While the job is in the `CREATED` status, both the Client and the TO can view, upload, and review documents.

### View Documents
**Endpoint:** `GET /api/v1/jobs/{id}/documents`
**Roles:** `CLIENT`, `TO`, `TM`, `GM`, `ADMIN`

- Returns a list of all uploaded documents with their `verification_status` (`PENDING`, `APPROVED`, `REJECTED`).
- Includes securely signed AWS URLs for downloading the files.
- Returns lists of `missing_documents` and `required_documents`.

### Upload Additional Documents
**Endpoint:** `POST /api/v1/jobs/{id}/documents`
**Role:** `CLIENT`

- If the client forgot an additional document, they can upload it here.
- Payload is similar to creation: use `required_document_id` for mandatory docs, or `custom_document_name` for extra files.

---

## 3. Document Verification (Technical Officer)

The TO is responsible for checking if the uploaded documents are valid, legible, and correct.

**Endpoint:** `PUT /api/v1/jobs/certificates/{jobCertificateId}/verify-documents`
**Role:** `TO`, `GM`, `ADMIN`

For multi-certificate jobs, call this **once per certificate**. The parent job moves to `IN_PROGRESS` when any certificate is verified.

The TO has two choices:

**Path A: Reject Specific Documents**
If the TO finds a document is illegible or incorrect, they mark `approved: false` and list the rejected documents.
```json
{
  "approved": false,
  "rejected_documents": [
    {
      "document_id": "uuid-of-bad-document",
      "reason": "Document is blurry, please re-scan and upload."
    }
  ]
}
```
*Result:* The specific documents are marked `REJECTED`. The job **remains in the `CREATED` status**. A notification is sent to the client.

**Path B: Approve All Documents**
If everything looks good, the TO approves the documents.
```json
{
  "approved": true
}
```
*Result:* All `PENDING` documents for that certificate become `APPROVED`. That certificate becomes `DOCUMENT_VERIFIED`; the parent job becomes or stays `IN_PROGRESS`.

---

## 4. Re-uploading Rejected Documents (Client)

If the TO rejected a document, the client must fix the issue. The client will use the UI to see the `rejection_reason` from the GET documents API.

**Endpoint:** `PUT /api/v1/jobs/{id}/documents/{documentId}`
**Role:** `CLIENT`

- The client submits a new file for the specific rejected document.
```json
{
  "file_url": "https://s3.aws.com/.../new-clear-scan.pdf"
}
```
*Result:* The document's `verification_status` resets from `REJECTED` back to `PENDING`. The TO is notified to verify the document again. *(Loops back to Step 3).*

---

## 5. Job Approval (General Manager)

Once the job is `DOCUMENT_VERIFIED`, the General Manager reviews the overarching request (vessel eligibility, outstanding payments, priority, etc.).

**Endpoint:** `PUT /api/v1/jobs/{id}/approve-request`
**Role:** `GM`, `ADMIN`

*Result:* When **all** certificates are `DOCUMENT_VERIFIED`, GM approval is recorded (`approved_by_user_id`). Multi-certificate jobs typically remain `IN_PROGRESS` while certificates progress independently.

---

## 6. Job Finalization & Assignment Prep (Technical Manager)

The Technical Manager takes the `APPROVED` job and finalizes technical details (like defining survey locations, assigning a primary technical reviewer, or confirming scope).

**Endpoint:** `PUT /api/v1/jobs/{id}/finalize`
**Role:** `TM`, `ADMIN`

*Result:* Job transitions from `APPROVED` to `FINALIZED`. 

*(After this, the job moves into Surveyor Assignment and actual field surveying).*

---

## Summary of State Transitions

1. **CREATED** (Client creates job and uploads docs. Stays here during document rejections/re-uploads).
2. **DOCUMENT_VERIFIED** (TO approves all documents).
3. **APPROVED** (GM gives the green light).
4. **FINALIZED** (TM prepares the job for surveyor assignment).
