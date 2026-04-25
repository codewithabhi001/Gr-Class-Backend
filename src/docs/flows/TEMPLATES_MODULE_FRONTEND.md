# Frontend Integration Guide — Checklist & Certificate Template Modules

**Audience:** Frontend engineers building the Admin / GM / TM dashboards
**Scope:** Everything you need to wire up template management UI without reading server code
**Last verified:** 2026-04-25 (all 26 endpoints green via `scripts/test_template_apis.js`)

---

## 1. What these two modules are

| Module | What it stores | Who uses it |
|---|---|---|
| **Checklist Template** (`/api/v1/checklist-templates`) | A reusable list of yes/no questions a surveyor must answer onboard a vessel, plus optional reference DOCX/PDFs | Built by **ADMIN**, read by **GM / TM / SURVEYOR** |
| **Certificate Template** (`/api/v1/certificate-templates`) | The DOCX template (with `{{vessel_name}}` style placeholders) used to render the final certificate PDF | Built by **ADMIN**, read by **GM / TM** |

Both modules are administrative configuration — they live behind the *Settings → Templates* screens, not the day-to-day operational flow.

---

## 2. The single most important convention

> **You upload S3 keys. The server returns signed URLs.**

When you create or update a template you send the **raw S3 key** in fields like `template_files` (checklist) or `template_file_url` (certificate). The server stores those raw keys.

When you `GET` a template back, those same fields contain **fully resolved signed CloudFront URLs** that you can drop straight into an `<a download>` or `<img src>` — no extra resolution step needed.

```
You PUT  template_file_url = "certificate-templates/1777_cert.docx"
You GET  template_file_url = "https://gr-class.s3.../certificate-templates/1777_cert.docx?X-Amz-…"
```

Don't be confused by the asymmetry — it's intentional and consistent across the whole codebase.

---

## 3. The S3 upload handshake (used by both modules)

Both modules expose a `GET /get-upload-url` endpoint. The flow is identical for either:

```
┌─ FE ─────────────────┐         ┌─ BE ─────────────────┐         ┌─ S3 ────┐
│ 1. user picks file   │         │                      │         │         │
│ 2. GET get-upload-url├────────►│ returns {uploadUrl,  │         │         │
│                      │         │          fileKey}    │         │         │
│ 3. PUT file ─────────┼─────────┼──────────────────────┼────────►│ stored  │
│ 4. POST/PUT template │         │                      │         │         │
│    with fileKey ─────┼────────►│ persists fileKey     │         │         │
└──────────────────────┘         └──────────────────────┘         └─────────┘
```

### Step 1 — get the URL pair

**Checklist:** `GET /api/v1/checklist-templates/get-upload-url?fileName=master.docx&contentType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`
**Certificate:** `GET /api/v1/certificate-templates/get-upload-url?fileName=cert.docx&contentType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Both require `ADMIN`, both return:

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://gr-class.s3.ap-southeast-2.amazonaws.com/...?X-Amz-Signature=...",
    "fileKey":   "checklist-templates/1777124360801_master.docx"
  }
}
```

The `uploadUrl` is good for ~1 hour. The `fileKey` is what you'll send back to the server in the next request.

### Step 2 — upload the file directly to S3

```js
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': contentType },   // must match what you asked for
  body: file,                                  // the File / Blob
});
```

- **Do not** send the auth `Authorization` header on this PUT — it's a pre-signed URL.
- The `Content-Type` header **must match** the `contentType` query parameter from step 1, or S3 will return 403.

### Step 3 — store the key on the template

Send the `fileKey` (not the upload URL!) when you create or update the template. See section 4 / 5.

---

## 4. Checklist Template module

Base path: `/api/v1/checklist-templates`

### 4.1 Roles

| Action | Roles |
|---|---|
| Create / update / activate / clone / delete / get upload URL | **ADMIN** only |
| Read (list, by id) | ADMIN, GM, TM, SURVEYOR |
| Read for a specific job | SURVEYOR, ADMIN, GM, TM, TO |
| Download auto-filled DOCX for a job | SURVEYOR, ADMIN, GM, TM, TO |

### 4.2 Lifecycle

```
       ┌─────────┐  PUT /:id/activate  ┌────────┐  DELETE /:id  ┌──────────┐
       │  DRAFT  │ ──────────────────► │ ACTIVE │ ────────────► │ INACTIVE │
       └─────────┘                     └────────┘               └──────────┘
            ▲                              │
            │ POST /:id/clone              │ activating another template
            │                              │ for the same certificate_type
            │                              ▼ auto-deactivates this one
       ┌─────────┐                     ┌──────────┐
       │  DRAFT  │ ◄──── clones ────── │ INACTIVE │
       └─────────┘                     └──────────┘
```

**Activation guards** — `PUT /:id/activate` returns **400** if the template:
- has no `certificate_type_id` linked, **or**
- has zero items across all sections.

**Editability rules** (enforced by the backend):

| Field | DRAFT | ACTIVE / INACTIVE |
|---|---|---|
| `name`, `code`, `description`, `metadata`, `certificate_type_id`, `sections` | editable | **blocked (400)** |
| `template_files` / `add_template_files` / `remove_template_files` | editable | **editable** ✅ |
| `status` (via `/activate`) | DRAFT → ACTIVE | — |

In other words: once a template is finalized, the *questions* are frozen but the *attached reference documents* can still be swapped at any time.

### 4.3 Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/get-upload-url?fileName=&contentType=` | Pre-signed S3 PUT URL for a reference DOCX/PDF |
| `POST`   | `/`                                       | Create a template (DRAFT by default) |
| `GET`    | `/`                                       | List templates (filters: `?status=&certificate_type_id=`) |
| `GET`    | `/:id`                                    | Get one template |
| `PUT`    | `/:id`                                    | Update (rules above) |
| `PUT`    | `/:id/activate`                           | DRAFT → ACTIVE (with guards) |
| `POST`   | `/:id/clone`                              | Clone any template into a new DRAFT |
| `DELETE` | `/:id`                                    | Soft delete → INACTIVE |
| `GET`    | `/job/:jobId`                             | Get the active template for the job's certificate type, plus existing answers |
| `GET`    | `/job/:jobId/download?force=true`         | Download an auto-filled DOCX for the job (cached) |

### 4.4 Create payload

```http
POST /api/v1/checklist-templates
Content-Type: application/json
Authorization: Bearer <admin-jwt>

{
  "name": "Safety Equipment Annual Inspection",
  "code": "SEC_ANNUAL_V1",                       // unique
  "description": "For Safety Equipment Cert renewals",
  "certificate_type_id": "<uuid>",               // optional but REQUIRED to activate
  "sections": [
    {
      "title": "Lifesaving Equipment",
      "items": [
        { "code": "LS-01", "text": "Lifeboats present and seaworthy?", "type": "YES_NO_NA" },
        { "code": "LS-02", "text": "Number of working lifejackets",   "type": "NUMBER"    }
      ]
    }
  ],
  "template_files": ["checklist-templates/1777_master.docx"],   // optional, S3 keys
  "status": "DRAFT",                              // optional, default DRAFT
  "metadata": { "version": "1.0" }                // optional, free-form JSON
}
```

**Allowed item `type`s:** `YES_NO_NA` (default), `YES_NO`, `PASS_FAIL`, `PASS_FAIL_NA`, `TEXT`, `NUMBER`.

### 4.5 The three update modes for `template_files`

This is the part that trips people up. There are **three independent ways** to mutate the attached-files array, and you must pick one per request:

| Field in PUT body | Effect |
|---|---|
| `template_files: [...]` | **Full replace** — array becomes exactly what you sent |
| `add_template_files: [...]` | **Append** these keys to the existing array |
| `remove_template_files: [...]` | **Subtract** these keys from the existing array |

You may combine `add_template_files` + `remove_template_files` in one request. You **cannot** combine `template_files` (full replace) with either of the others — the server returns:

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid input data. Please check the fields.",
  "errors": {
    "": "Use either `template_files` (full replace) OR `add_template_files` / `remove_template_files`, not both."
  }
}
```

> **Frontend tip:** when displaying validation errors, surface both `body.message` *and* the values of `body.errors`. Joi puts the helpful per-field message inside `errors`.

#### Examples

**Full replace** (e.g. user re-uploaded everything from scratch):
```json
PUT /api/v1/checklist-templates/<id>
{ "template_files": ["checklist-templates/v2-master.docx", "checklist-templates/v2-supp.pdf"] }
```

**Append one new file** (e.g. user added a supplement):
```json
PUT /api/v1/checklist-templates/<id>
{ "add_template_files": ["checklist-templates/new-supplement.pdf"] }
```

**Remove one file** (e.g. user deleted the supplement):
```json
PUT /api/v1/checklist-templates/<id>
{ "remove_template_files": ["checklist-templates/old-supplement.pdf"] }
```

**Add and remove in one shot** (e.g. user replaced the supplement):
```json
PUT /api/v1/checklist-templates/<id>
{
  "add_template_files":    ["checklist-templates/new-supp.pdf"],
  "remove_template_files": ["checklist-templates/old-supp.pdf"]
}
```

> ⚠ When you remove a file, send the **raw key**, not the signed URL you got back from the server. Strip the query string and host first, or — better — keep the raw key in your form state from the moment of upload.

### 4.6 Clone

```http
POST /api/v1/checklist-templates/<id>/clone
```

Creates a new `DRAFT` copy with:
- `code` suffixed with `_v2`, `_v3`, … (auto-incrementing)
- All `sections` copied verbatim
- All `template_files` copied verbatim
- `status` reset to `DRAFT`

Use this for "duplicate and edit" UX.

---

## 5. Certificate Template module

Base path: `/api/v1/certificate-templates`

### 5.1 Roles

| Action | Roles |
|---|---|
| Create / update / delete / get upload URL | **ADMIN** only |
| Read (list, by id) | ADMIN, GM, TM |

### 5.2 Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/get-upload-url?fileName=&contentType=` | Pre-signed S3 PUT URL for the DOCX |
| `POST`   | `/`                                       | Create a template |
| `GET`    | `/`                                       | List (filters: `?certificate_type_id=&is_active=`) |
| `GET`    | `/:id`                                    | Get one |
| `PUT`    | `/:id`                                    | Update any field |
| `DELETE` | `/:id`                                    | **Hard** delete (subsequent GET returns 404) |

> Note the difference from checklist templates: certificate templates are **hard-deleted**, not soft-deleted. Confirm-before-delete in the UI.

### 5.3 Create payload

```http
POST /api/v1/certificate-templates
Content-Type: application/json
Authorization: Bearer <admin-jwt>

{
  "template_name": "Safety Equipment Cert — FULL_TERM v3",
  "certificate_type_id": "<uuid>",                                    // required
  "certificate_term": "FULL_TERM",                                    // optional, FULL_TERM | SHORT_TERM | null
  "template_file_url": "certificate-templates/1777_cert.docx",        // required, raw S3 key
  "variables": ["vessel_name", "imo_number", "issue_date"],           // optional, list of {{placeholders}} in the DOCX
  "is_active": true                                                    // optional, default true
}
```

The `variables` array is informational metadata — it's used by the admin UI to show "what placeholders does this template support?" The actual rendering pulls placeholders from the DOCX itself.

### 5.4 Update

All fields above are optional on `PUT`. To swap the file, repeat the upload handshake to get a new key, then:

```json
PUT /api/v1/certificate-templates/<id>
{ "template_file_url": "certificate-templates/<new-key>.docx" }
```

The response will contain the new resolved signed URL.

---

## 6. Reference flows (TypeScript-ish)

### 6.1 Create a checklist template with one reference DOCX

```ts
async function createChecklistTemplate(file: File, payload: NewTemplateBody) {
  // 1. ask the server for an S3 upload URL
  const u = await api(
    `/api/v1/checklist-templates/get-upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
  );

  // 2. push the bytes straight to S3
  await fetch(u.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  // 3. create the template, referencing the key
  return api(`/api/v1/checklist-templates`, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      template_files: [u.data.fileKey],
    }),
  });
}
```

### 6.2 Add a new reference doc to an existing template

```ts
async function attachExtraDoc(templateId: string, file: File) {
  const u = await api(
    `/api/v1/checklist-templates/get-upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
  );
  await fetch(u.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  return api(`/api/v1/checklist-templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify({ add_template_files: [u.data.fileKey] }),
  });
}
```

### 6.3 Activate a template (with proper error handling)

```ts
async function activate(templateId: string) {
  const res = await fetch(`/api/v1/checklist-templates/${templateId}/activate`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    // Common 400s:
    //   "Cannot activate a template that is not linked to a certificate type …"
    //   "Cannot activate a template with no checklist items …"
    throw new Error(json.message || 'Activation failed');
  }
  return json.data;
}
```

### 6.4 Detect "raw key" vs "signed URL" in form state

When the user opens an existing template for editing, the response gives you signed URLs. If they delete a file, you need to send the *raw key* in `remove_template_files`. So: keep both shapes side-by-side in form state.

```ts
type AttachedDoc = {
  key: string;        // raw S3 key — used for remove_template_files
  url: string;        // resolved signed URL — used for <a href>
  fileName?: string;  // for display
};
```

A simple way to extract the key from a signed URL is to take the path segment of the URL after the bucket host, before the `?`. But the **cleanest** approach is: when you upload, store the `fileKey` your server returned next to the URL, so you never have to parse anything.

---

## 7. Common pitfalls — please read

1. **Don't put `Authorization` on the S3 PUT.** It's a pre-signed URL — adding the bearer token will make S3 reject it.
2. **Content-Type on PUT must match the query param.** If you ask for `application/pdf` and PUT with `application/octet-stream`, S3 returns 403.
3. **Send raw S3 keys in `remove_template_files`, not signed URLs.** The server compares strings — a signed URL won't match anything in the stored array.
4. **`template_files` (full replace) cannot be combined with `add_template_files` / `remove_template_files`.** Pick one mode per PUT.
5. **Activation requires `certificate_type_id` AND ≥1 item.** Disable the *Activate* button in the UI if either is missing — your users will appreciate not seeing a 400.
6. **Once `ACTIVE`, structural fields are frozen.** Show the `name` / `code` / `sections` editors as read-only when `status !== 'DRAFT'`. The file-management widget should remain enabled.
7. **Activating a new template auto-deactivates any other ACTIVE template for the same `certificate_type_id`.** Reflect this in the UI ("Activating this will deactivate `<old template>`").
8. **Cloning produces a DRAFT.** No need to call `/activate` automatically — let the user review first.
9. **The error envelope.** Joi validation errors come back as `{ message: "Invalid input data...", errors: { fieldName: "..." } }`. Always render `errors` too — that's where the actual reason is.
10. **Certificate template DELETE is hard delete.** Add a confirmation dialog. Checklist template DELETE is soft delete (sets `INACTIVE`); same UX, different consequence.

---

## 8. Quick endpoint cheatsheet

```
# Checklist templates
GET    /api/v1/checklist-templates/get-upload-url?fileName=&contentType=
POST   /api/v1/checklist-templates
GET    /api/v1/checklist-templates                     ?status=&certificate_type_id=
GET    /api/v1/checklist-templates/:id
PUT    /api/v1/checklist-templates/:id
PUT    /api/v1/checklist-templates/:id/activate
POST   /api/v1/checklist-templates/:id/clone
DELETE /api/v1/checklist-templates/:id
GET    /api/v1/checklist-templates/job/:jobId
GET    /api/v1/checklist-templates/job/:jobId/download?force=true

# Certificate templates
GET    /api/v1/certificate-templates/get-upload-url?fileName=&contentType=
POST   /api/v1/certificate-templates
GET    /api/v1/certificate-templates                  ?certificate_type_id=&is_active=
GET    /api/v1/certificate-templates/:id
PUT    /api/v1/certificate-templates/:id
DELETE /api/v1/certificate-templates/:id
```

---

## 9. Where to look for more detail

- **OpenAPI spec (live):** `http://localhost:5000/api-docs` (filter by tag *Checklist Templates* / *Certificate Templates*)
- **YAML sources:** `src/docs/paths/checklist_templates.yaml`, `src/docs/paths/templates.yaml`, `src/docs/schemas/checklists.yaml`, `src/docs/schemas/certificate.yaml`
- **Server-side validation rules:** `src/middlewares/validate.middleware.js` → `createChecklistTemplate`, `updateChecklistTemplate`, `createTemplate`, `updateTemplate`
- **End-to-end happy-path examples:** `scripts/test_template_apis.js` — every assertion in this file is a valid request/response shape you can copy

If anything in this doc disagrees with the OpenAPI spec, the OpenAPI spec wins — and please ping backend so we fix this doc.
