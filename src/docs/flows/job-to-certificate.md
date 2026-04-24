# Flow: Creating a Job → Generating a Certificate

This document describes the end-to-end flow in the GR-CLASS_BACKEND codebase from creating a job request to generating a certificate. It includes actor roles, important status transitions, API endpoints, validations, services called, and references to key implementation points.

## Actors / Roles
- CLIENT: Requests jobs for their vessels.
- ADMIN / GM / TM: Manage and approve jobs, assign surveyors, generate certificates.
- SURVEYOR: Performs field work (start survey, stream location, submit checklist & survey report).

## Key Models Involved
- JobRequest (jobs)
- Certificate (certificates)
- CertificateType, CertificateTemplate
- SurveyReport, GpsTracking, ActivityPlanning (checklists)
- JobStatusHistory, CertificateHistory

## High-level status flow
1. CREATED (job created)
2. ASSIGNED (GM assigns a surveyor)
3. IN_PROGRESS (surveyor starts survey)
4. SURVEY_DONE (surveyor submits survey report)
5. TM_FINAL (technical manager finalizes survey)
6. CERTIFIED (certificate generated and job status updated)

## Preconditions / Validations (important)
- When creating a job, provided `certificate_type_id` and `vessel_id` are validated against the DB.
- A survey report can only be submitted when job is `IN_PROGRESS` and at least one checklist entry exists.
- Only the assigned surveyor may start/stream/submit for the job.
- Certificate generation requires a valid job (and uses the job's `certificate_type_id` and `vessel_id`).

## API Endpoints (important)
- Create job

  POST /api/v1/jobs

  - Roles: CLIENT, ADMIN, GM
  - Validates `vessel_id`, `certificate_type_id`

  Sample payload:
  ```json
  {
    "vessel_id": 123,
    "certificate_type_id": 5,
    "reason": "Annual inspection",
    "target_port": "Mumbai",
    "target_date": "2026-03-01"
  }
  ```

- Assign surveyor

  PUT /api/v1/jobs/:id/assign

  - Roles: ADMIN, GM
  - Sets `assigned_surveyor_id` and job_status => `ASSIGNED`

- Start survey (surveyor check-in)

  POST /api/v1/surveys/start

  - Roles: SURVEYOR
  - Body: `{ "job_id": <id>, "latitude": <lat>, "longitude": <lon> }`
  - Transitions job_status => `IN_PROGRESS` and records `start_latitude/longitude`.

- Submit checklist

  (Checklist endpoints exist in the checklists module; at least one checklist row must exist before submitting survey report.)

- Submit survey report (with attendance photo & signature)

  POST /api/v1/surveys

  - Roles: SURVEYOR
  - Requires: job.status === `IN_PROGRESS` and checklists submitted
  - Uploads photo to S3, updates Survey record with `submit_latitude/longitude` and `signature_url`, generates `declaration_hash`, and sets job_status => `SURVEY_DONE`

- Finalize survey

  PUT /api/v1/surveys/:id/finalize

  - Roles: SURVEYOR
  - Requires job_status === `SURVEY_DONE`
  - Sets job_status => `TM_FINAL`

- Generate certificate

  POST /api/v1/certificates

  - Roles: ADMIN, GM, TM
  - Body: `{ "job_id": <id>, "validity_years": 1 }`
  - Creates Certificate row, generates certificate number, computes issue/expiry dates, sets job_status => `CERTIFIED`

## Implementation notes & where to look in code

- Job creation logic (validations, DB create, and initial JobStatusHistory):

```10:29:/Users/abhinavvishwakarma/work/Project/GR-CLASS_BACKEND/src/modules/jobs/job.service.js
export const createJob = async (data, userId) => {
    if (data.certificate_type_id) {
        const certType = await CertificateType.findByPk(data.certificate_type_id);
        if (!certType) {
            throw { statusCode: 400, message: 'Invalid or unknown certificate_type_id. Please use a valid certificate type from /api/v1/certificates/types.' };
        }
    }
    ...
    const job = await JobRequest.create({
        ...safeData,
        requested_by_user_id: userId,
        job_status: 'CREATED'
    });
    await JobStatusHistory.create({ ... new_status: 'CREATED' });
    return job;
};
```

- Start survey (check-in) — sets `IN_PROGRESS` and logs initial GPS:

```62:89:/Users/abhinavvishwakarma/work/Project/GR-CLASS_BACKEND/src/modules/surveys/survey.service.js
export const startSurvey = async (data, userId) => {
    const { job_id, latitude, longitude } = data;
    const job = await JobRequest.findByPk(job_id);
    ...
    await job.update({ job_status: 'IN_PROGRESS' });
    await JobStatusHistory.create({... new_status: 'IN_PROGRESS' });
    await GpsTracking.create({...});
    return { message: 'Survey Started', job_id, started_at: new Date() };
};
```

- Submit survey report — upload photo to S3, create SurveyReport, update job status to `SURVEY_DONE`, log gps:

```11:60:/Users/abhinavvishwakarma/work/Project/GR-CLASS_BACKEND/src/modules/surveys/survey.service.js
export const submitSurveyReport = async (data, files, userId) => {
    const { job_id, submit_latitude, submit_longitude, survey_statement } = data;
    const job = await JobRequest.findByPk(job_id);
    ...
    const survey = await requireSurvey(job_id);
    await survey.update({
        submit_latitude,
        submit_longitude,
        attendance_photo_url: photoUrl,
        survey_statement
    });
    ...
    return survey;
};
```

- Generate certificate — creates Certificate record, fills dynamic tags, processes DOCX template via S3, and updates job_status => `CERTIFIED`:

```42:66:/Users/abhinavvishwakarma/work/Project/GR-CLASS_BACKEND/src/modules/certificates/certificate.service.js
export const generateCertificate = async (data, userId) => {
    const { job_id, validity_years } = data;
    const job = await JobRequest.findByPk(job_id, { include: [Vessel, CertificateType] });
    ...
    // New flow uses tagBuilder to collect survey answers and fillDocxContentControls to process master .docx
    const dynamicTags = await buildTagValuesForJob(job_id);
    const cert = await Certificate.create({ ... });
    // result is a filled .docx uploaded to S3
    await job.update({ job_status: 'CERTIFIED' });
    return await Certificate.findByPk(cert.id);
};
```

- DOCX generation flow (uses jszip + xmldom):

```/Users/abhinavvishwakarma/work/Project/GR-CLASS_BACKEND/src/utils/docxFill.util.js
export const fillDocxContentControls = async (buffer, data) => {
    const zip = await JSZip.loadAsync(buffer);
    const content = await zip.file("word/document.xml").async("text");
    // XML parsing and placeholder replacement...
    return await zip.generateAsync({ type: 'nodebuffer' });
};
```

The resulting file is uploaded via `s3Service.uploadFile` and the URL is stored in `pdf_file_url`.

## Typical sequence (concise)
1. CLIENT (or ADMIN/GM) calls POST /jobs -> job created with `CREATED`.
2. ADMIN/GM assigns a surveyor -> PUT /jobs/:id/assign -> job becomes `ASSIGNED`.
3. SURVEYOR calls POST /surveys/start -> job becomes `IN_PROGRESS`.
4. SURVEYOR submits checklist entries (checklist module).
5. SURVEYOR POST /surveys (with photo) -> SurveyReport created, job -> `SURVEY_DONE`.
6. SURVEYOR (or TM) finalizes -> PUT /surveys/:id/finalize -> job -> `TM_FINAL`.
7. ADMIN/GM/TM POST /certificates -> Certificate created, DOCX generated from master template and uploaded to S3, job -> `CERTIFIED`.

## Edge cases and failure handling
- PDF generation may fail (Puppeteer missing, Chromium issue). The certificate row is persisted even if PDF generation fails — the code logs a warning and the cert stays without `pdf_file_url`.
- Attempts to change status in invalid order are rejected with 400 and clear messages (see survey.service and job.service validations).
- Access control: many endpoints check role and scope — unauthorized access returns 403.

## Where to extend / customization points
- Template content: CertificateTemplate entries (DB) — update `template_file_url` to point to a new master `.docx` file in S3.
- PDF settings: The system currently stores the filled `.docx`. For future PDF conversion, a dedicated service or lambda can be integrated into the issue/generate flow.
- Hook email/notification after certificate generation (notificationService is used elsewhere).

---
File created: `src/docs/flows/job-to-certificate.md` — keep this document up-to-date when job lifecycle or certificate logic changes.

