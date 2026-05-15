# Granular Survey Rejection - Frontend Integration Guide

This document outlines the technical changes required to implement the new targeted rework flow. It replaces the old "all-or-nothing" rejection system with a granular model where specific checklist items and documents can be rejected individually.

---

## 1. Workflow Overview

1.  **Surveyor** submits checklist items and signed documents.
2.  **TM / Admin** reviews the submission. Instead of rejecting the whole survey, they mark specific items or files as `REJECTED` with a reason.
3.  **Surveyor App** displays which specific items/files were rejected.
4.  **Surveyor** fixes and re-submits ONLY the rejected items/files.
5.  **Submission Guard**: The final survey report cannot be submitted if any items remain in a `REJECTED` state.

---

## 2. API Reference (Admin/TM Review)

Use these endpoints to review individual components of a survey.

### A. Review a Checklist Item
**Endpoint:** `PUT /api/v1/jobs/:jobId/items/:itemId/review`

**Request Payload:**
```json
{
  "status": "REJECTED", 
  "rejection_reason": "Evidence photo does not match the equipment." 
}
```
*Valid values for `status`: `APPROVED`, `REJECTED`, `PENDING`.*

---

### B. Review a Signed Checklist File
**Endpoint:** `PUT /api/v1/jobs/:jobId/signed-files/:fileIndex/review`

**Note:** `:fileIndex` is the array index (0, 1, 2...) of the file in the `signed_checklist_files` array.

**Request Payload:**
```json
{
  "status": "REJECTED",
  "rejection_reason": "Page 2 is missing the surveyor signature."
}
```

---

## 3. API Reference (Surveyor Fixes)

Surveyors continue to use the existing checklist submission endpoint, but the backend now handles partial updates.

### A. Fetching Status
**Endpoint:** `GET /api/v1/jobs/:jobId/checklist`

**Key Response Fields:**
```json
{
  "items": [
    {
      "id": "uuid",
      "question_code": "LC_01",
      "status": "REJECTED", 
      "rejection_reason": "Please provide a clearer photo."
    },
    {
      "id": "uuid",
      "status": "APPROVED",
      "rejection_reason": null
    }
  ],
  "signed_checklist_files": [
    {
      "url": "https://...",
      "status": "REJECTED",
      "rejection_reason": "Signature missing."
    }
  ]
}
```

### B. Re-submitting Fixes
**Endpoint:** `PUT /api/v1/jobs/:jobId/checklist`

**Logic:** Send only the items that were updated. The backend will perform a targeted update on these items and reset their status to `PENDING` for re-review.

---

## 4. UI/UX Requirements

### Admin Dashboard (Reviewer)
- Add a "Reject" button/icon next to every checklist item in the review screen.
- Add a "Reject" button next to every uploaded signed checklist file.
- When "Reject" is clicked, open a small modal to capture the `rejection_reason`.

### Surveyor App (Mobile/Web)
- **Status Indicators:** Use color-coded badges for items:
  - `APPROVED`: Green
  - `REJECTED`: Red (show reason below the item)
  - `PENDING`: Yellow/Blue
- **Conditional Editing:** Ensure surveyors can easily identify and edit only the `REJECTED` items.
- **Validation Guard:** Disable the "Submit Final Report" button if any item has `status: 'REJECTED'`. Display a warning: *"Please address all rejected items before final submission."*

---

## 5. Error Codes & Messages

| Scenario | Status Code | Message |
| :--- | :--- | :--- |
| Rejection reason missing | 400 | `"rejection_reason is required when status is REJECTED"` |
| Attempting to submit report with rejected items | 400 | `"Cannot submit report: X checklist items are still marked as REJECTED. Please correct them first."` |
| Attempting to submit report with rejected files | 400 | `"Cannot submit report: X signed documents are still marked as REJECTED. Please re-upload them first."` |
