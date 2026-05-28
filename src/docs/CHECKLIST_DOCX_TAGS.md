# Comprehensive Maritime Job-to-Certificate Workflow

This document provides a complete, step-by-step breakdown of the job lifecycle from the initial client request to the final issuance of a generated certificate. It includes all standard flows, edge cases, and automated system validations to ensure maritime compliance.

> [!NOTE]
> **System Hierarchy:** 
> One **Job Request** can contain multiple **Job Certificates** (e.g., Hull Survey, Machinery Survey). 
> Each **Job Certificate** spawns one **Survey** execution and results in one generated **Official Certificate**.

---

## Phase 1: Job Request & Creation
**Goal:** The client initiates a request for maritime survey and certification.

* **Standard Flow:**
  1. The client selects a vessel and chooses one or multiple required certificates.
  2. The system checks the `CertificateType` configuration and enforces the upload of mandatory supporting documents.
  3. The Job is created with a `CREATED` status.
  4. The individual Job Certificates are created with a `PENDING` status.
* **Possible Cases & Edge Cases:**
  * **Missing Mandatory Documents:** The system will block the creation of the job until the client uploads the required documents specified by the Certificate Type.
  * **Client Cancellation:** At this stage, the client can still cancel the job (`CANCELLED` terminal state).

## Phase 2: Document Verification
**Goal:** A Technical Officer (TO) reviews the client's uploaded documents for validity.

* **Standard Flow:**
  1. The TO reviews the documents for each requested certificate.
  2. If valid, the TO verifies the documents. The Job Certificate status moves to `DOCUMENT_VERIFIED`.
  3. **Auto-Sync:** Once *all* certificates under the job are verified, the parent Job automatically transitions to `DOCUMENT_VERIFIED`.
* **Possible Cases & Edge Cases:**
  * **Document Rejection:** The TO finds a document is blurry or incorrect. They reject that specific document. The client receives an alert to re-upload. The certificate remains `PENDING` until the new document is verified.
  * **Bulk Verification:** Management can use a bulk-verify action to approve all documents at once to speed up the process.

## Phase 3: Management Approval
**Goal:** Final administrative approval before deploying resources.

* **Standard Flow:**
  1. The General Manager (GM) or Admin reviews the verified job and approves it.
  2. The Job status transitions to `APPROVED`.
* **Possible Cases & Edge Cases:**
  * **Job Rejection:** The GM can reject the job entirely (`REJECTED` terminal state) if the operation is unviable.
  * **Rescheduling:** Management can update the `target_date` and `target_port` if there are scheduling conflicts, logging an audit trail.

## Phase 4: Surveyor Assignment
**Goal:** Assigning qualified maritime surveyors to execute the physical inspection.

* **Standard Flow:**
  1. Management assigns a surveyor to the job.
  2. The Job status transitions to `ASSIGNED`.
  3. The system automatically provisions empty `Survey` records for the assigned certificates with a `NOT_STARTED` status.
* **Possible Cases & Edge Cases:**
  * **Split Assignment:** Different surveyors can be assigned to different certificates on the same job (e.g., a Hull expert and an Engine expert).
  * **Eligibility Guard:** The system filters surveyors based on their qualifications and availability, preventing unauthorized assignments.
  * **Reassignment:** A surveyor can be swapped out due to illness or delays. This logs a reason for auditing and notifies the new surveyor, without changing the job's overall status.

## Phase 5: Survey Authorization
**Goal:** Giving the green light to the surveyor to travel to the vessel.

* **Standard Flow:**
  1. The Technical Manager (TM) formally authorizes the surveys.
  2. The Job Certificate moves to `SURVEY_AUTHORIZED`.
  3. The surveyor receives a push notification to begin field work.
* **Possible Cases & Edge Cases:**
  * **Smart Bulk Authorization:** The TM can bulk-authorize the entire job. The system smartly filters and authorizes *only* the certificates that have a surveyor assigned. Any unassigned certificates safely remain in `DOCUMENT_VERIFIED` without throwing an error.
  * **Missing Assignment Block:** An individual certificate cannot be authorized if no surveyor is assigned to it yet.

## Phase 6: Field Execution (Surveyor Mobile App)
**Goal:** The surveyor conducts the physical inspection on the vessel.

* **Standard Flow:**
  1. **Check-In:** The surveyor arrives on-site and taps "Start". GPS coordinates are logged.
     * Survey → `STARTED` | Job → `IN_PROGRESS`.
  2. **Checklist Execution:** Surveyor fills out the technical checklist, answers questions, and uploads granular photos. 
     * Survey → `CHECKLIST_SUBMITTED`.
  3. **Evidence & Signatures:** Surveyor uploads attendance photos and the Master's signature.
     * Survey → `PROOF_UPLOADED`.
  4. **Final Submission:** The surveyor submits the comprehensive report and final GPS coordinates are logged.
     * Survey → `SUBMITTED` | Job Certificate → `SURVEY_DONE`.
* **Possible Cases & Edge Cases:**
  * **Non-Conformities (NC):** The surveyor can flag issues as Non-Conformities.
  * **Offline Mode:** The app allows offline data collection, syncing automatically when the surveyor regains internet access.
  * **GPS Enforcement:** The system strictly requires start and end GPS coordinates to verify physical attendance.

## Phase 7: Technical Review & Rework
**Goal:** Quality assurance of the surveyor's findings by the Technical Management team.

* **Standard Flow:**
  1. The TM reviews the submitted survey data, photos, and checklists.
  2. If everything is correct, they proceed to Finalization (Phase 8).
* **Possible Cases & Edge Cases:**
  * **Rework Requested:** The TM spots missing data or an error in a specific certificate.
     * The TM requests rework for that certificate.
     * Job Certificate falls back to `REWORK_REQUESTED` | Survey falls back to `REWORK_REQUIRED`.
     * **Seamless Restart:** The surveyor is notified. They do *not* need re-authorization. They can simply open the app, start the survey again, correct the data, and re-submit.
  * **Open NC Block:** If the surveyor raised Non-Conformities, the TM *cannot* finalize the survey until those NCs are officially marked as `RESOLVED` or `CLOSED`.

## Phase 8: Survey Finalization
**Goal:** Locking the survey data to prevent further changes.

* **Standard Flow:**
  1. The TM finalizes the approved survey report.
  2. Survey status becomes `FINALIZED`. (The data is now immutable).
  3. **Auto-Sync:** Once all surveys under the job are `FINALIZED`, the parent Job automatically transitions to `FINALIZED`.
* **Possible Cases & Edge Cases:**
  * **Partial Finalization:** In a split-assignment job, one survey might be finalized while another is still in rework. The parent job stays `IN_PROGRESS` until the absolute last survey is finalized.

## Phase 9: Certificate Generation & Issuance
**Goal:** Generating the official PDF certificate for the client.

* **Standard Flow:**
  1. **Draft Generation:** The TM triggers the generation of the certificate (`DRAFT`).
     * The system pulls the finalized survey data and renders it into the authorized template.
  2. **Issuance:** The GM reviews the draft and issues it.
     * The certificate gets a QR Code, watermark removal, and status moves to `ISSUED`.
     * The Job Certificate moves to `ISSUED`.
  3. **Job Conclusion:** Once all certificates are `ISSUED`, the parent Job moves to its final terminal state: `CERTIFIED`.
* **Possible Cases & Edge Cases:**
  * **Custom Issue Dates:** Management can provide a custom `issue_date` during generation (e.g., backdating to the actual survey date). The system will automatically calculate the correct `expiry_date` based on the certificate's validity rules.
  * **Manual Text Override:** If the template requires manual textual inserts (e.g., specific limitations), the TM can pass `manual_text` during generation.
