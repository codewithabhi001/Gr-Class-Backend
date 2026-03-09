### Frontend Task: Clean Payload for Update Checklist API (PUT)

**Context:**
Currently, when making a `PUT` request to update a Checklist Template (`/api/v1/checklist-templates/:id`), the frontend is sending the entire object as received from the `GET` API. This includes server-generated relational fields and timestamps (e.g., `Creator`, `CertificateType`, `createdAt`, `updatedAt`, `created_by`, `updated_by`). 

Sending these extra fields causes strict Backend Joi validation errors (`"field X is not allowed"`).

**Requirement:**
Before sending the `PUT` request payload, please sanitize the data so that it **only includes the fields that actually need to be updated** (and are permitted by the schema). 

*Note: For the `sections` array (which contains the checklist items), you must send the entire array as it completely replaces the existing sections.*

**Implementation Example:**

When the admin hits "Save/Update", map over your form state to extract only the necessary keys:

```javascript
// DO NOT send the raw state object directly if it contains extra data from the initial fetch.
// Example: const payload = { ...rawTemplateData }; // ❌ BAD

// Strip out non-editable fields before sending:
const submitPayload = {
  name: formData.name,
  code: formData.code,
  description: formData.description,
  status: formData.status,
  certificate_type_id: formData.certificate_type_id,
  // You must send the entire 'sections' array as it replaces the old one
  sections: formData.sections.map(section => ({
    title: section.title,
    items: section.items.map(item => ({
      code: item.code,
      text: item.text,
      type: item.type // (e.g., 'YES_NO_NA', 'PASS_FAIL', 'YES_NO', etc.)
    }))
  })),
  metadata: formData.metadata
};

// Send `submitPayload` in the PUT request ✅
```

By ensuring that fields like `createdAt`, `updatedAt`, `Creator`, etc., are **excluded** from the payload, you respect the backend's strict validation rules, reduce payload size, and improve overall security.
