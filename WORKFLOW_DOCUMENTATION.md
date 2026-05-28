# GIRIK System: Multi-Certificate Concurrent Workflow

This document explains the exact behavior of the system when **a single Job Request contains multiple, independent Certificate Types**. It outlines how different certificates can be in completely different states at the exact same time without blocking each other.

To illustrate, we will use a **Single Job Request (`Job #100`)** that has **three certificates**:
1. **Certificate A (Annual Inspection)**
2. **Certificate B (Intermediate Inspection)**
3. **Certificate C (Bottom Inspection)**

---

## The Core Rule of Independence
The parent `JobRequest` is just an umbrella folder. **The true state machine runs individually on each `JobCertificate`.** 
This means Certificate A can be fully completed (`ISSUED`) while Certificate C hasn't even received its documents yet (`PENDING`).

---

## Step 1: Job Creation (The Starting Point)
**Actor:** Client

* **What Happens:** The client creates Job #100 and selects Annual, Intermediate, and Bottom certificates.
* **Database State:**
  * `JobRequest #100` -> `CREATED`
  * **Certificate A (Annual):** `status` = `PENDING`
  * **Certificate B (Intermediate):** `status` = `PENDING`
  * **Certificate C (Bottom):** `status` = `PENDING`

---

## Step 2: Asynchronous Document Verification
**Actor:** Technical Officer (TO) / GM

* **What Happens:** The client only uploads documents for Certificate A. The TO reviews and verifies ONLY Certificate A's documents.
* **Database State:**
  * **Certificate A:** `DOCUMENT_VERIFIED` *(Ready for next step)*
  * **Certificate B:** `PENDING` *(Blocked, waiting for docs)*
  * **Certificate C:** `PENDING` *(Blocked, waiting for docs)*
  * `JobRequest #100` -> Automatically syncs to `IN_PROGRESS` because at least one certificate started moving.

---

## Step 3: Independent Surveyor Assignment
**Actor:** General Manager (GM)

* **What Happens:** The GM wants to assign a surveyor. They use the **Assign Surveyor to Certificate** feature (not bulk) to assign Surveyor John to Certificate A.
* **Backend Guard in Action:** If the GM tried to use "Bulk Assign" for the whole job, the backend would throw a `400 Error` because Certificates B & C are still `PENDING`.
* **Database State:**
  * **Certificate A:** Remains `DOCUMENT_VERIFIED`, but now `assigned_surveyor_id` = John.
    * *Eager Action:* A `Survey` record is instantly created for Certificate A (`NOT_STARTED`).
  * **Certificate B & C:** Remain `PENDING`. No survey records exist for them yet.

---

## Step 4: Staggered Survey Authorization
**Actor:** Technical Manager (TM)

* **What Happens:** TM reviews Certificate A and clicks "Authorize Survey". Meanwhile, the client finally uploads documents for Certificate B, and the TO verifies them.
* **Database State:**
  * **Certificate A:** `SURVEY_AUTHORIZED` *(John can now start his survey)*.
  * **Certificate B:** `DOCUMENT_VERIFIED` *(Ready for surveyor assignment)*.
  * **Certificate C:** `PENDING`.

---

## Step 5: Parallel Survey Execution
**Actor:** Surveyor(s)

* **What Happens:** Surveyor John opens his mobile app. He sees ONLY the survey for Certificate A, because it is the only one authorized. He clicks "Start Survey", uploads photos, and submits.
* **Database State:**
  * **Certificate A:** `SURVEY_AUTHORIZED` (Under the hood, its `Survey` record moves through `STARTED` → `PROOF_UPLOADED` → `SUBMITTED`).
  * **Certificate B:** Still `DOCUMENT_VERIFIED` (Waiting for GM to assign a surveyor).
  * **Certificate C:** Still `PENDING`.

---

## Step 6: Mixed Final Reviews & Reworks
**Actor:** Technical Manager (TM) / GM

* **What Happens:** TM reviews Surveyor John's report for Certificate A. It's perfect, so TM approves it. Meanwhile, GM assigns Surveyor Mike to Certificate B, and TM authorizes it.
* **Database State:**
  * **Certificate A:** `SURVEY_DONE` *(Survey is `FINALIZED`)*.
  * **Certificate B:** `SURVEY_AUTHORIZED` *(Survey is `NOT_STARTED`)*.
  * **Certificate C:** `PENDING`.

* **What if Mike messes up Certificate B?** 
  * TM clicks "Request Rework" on Certificate B. 
  * **Certificate B** goes backwards to `REWORK_REQUESTED`. 
  * *Crucial Point:* This does **NOT** affect Certificate A, which remains safely `SURVEY_DONE`. 
  * GM can now use the "Reassign" button specifically on Certificate B to fire Mike and hire Surveyor Sarah, without touching Certificate A.

---

## Step 7: Staggered Certificate Generation
**Actor:** Admin

* **What Happens:** Since Certificate A is `SURVEY_DONE`, the Admin clicks "Generate PDF Certificate" for Certificate A. They hand the PDF to the client.
* **Database State:**
  * **Certificate A:** `ISSUED` *(Completely finished terminal state)*.
  * **Certificate B:** Still undergoing rework (`REWORK_REQUESTED`).
  * **Certificate C:** Still waiting for documents (`PENDING`).
  * `JobRequest #100`: Remains `IN_PROGRESS`.

* **The Final Curtain:** Only when Certificate B and Certificate C eventually reach `ISSUED` (or `REJECTED`), will the `lifecycle.service` auto-sync the parent `JobRequest #100` to its final, global `CERTIFIED` status.
