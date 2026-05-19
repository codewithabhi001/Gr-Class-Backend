# Plan: 100% Flat Job List API Response

This quick task addresses the issue where the job list API (`GET /api/v1/jobs`) returns a highly nested object structure ("object inside object"), causing heavy payload sizes and frontend complexity. We will completely flatten the response to return only flat fields at the top level, with absolutely zero nested objects.

## Goals
- Flatten the output of `jobService.getJobs` in `src/modules/jobs/job.service.js`.
- Reduce payload size and database load by stripping heavy lookup fields and joins (such as surveyor, requester, approver, surveys, and payments) from the database query completely.
- Keep the list query extremely fast, returning only flat fields: job id, request number, target date, port, status, vessel details, priority, certificate details, and issuing authority.
- Remove all unnecessary IDs like `vessel_id`, `certificate_type_id`, `Vessel.id`, and `CertificateType.id`.
- Completely remove nested objects (`Vessel` and `CertificateType` sub-objects) from the backend list response.
- Update the React/Next.js frontend `JobsPage.jsx` component to access these flat properties directly, ensuring 100% seamless integration.
- Verify the change against standard backend tests.

## Tasks

### Task 1: 100% Flat Job List Response in `job.service.js`
- **File**: [job.service.js](file:///Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/src/modules/jobs/job.service.js)
- **Action**: Optimize database lookup attributes and includes, and map each job instance into a 100% flat structure with only:
  - Flat fields: `id`, `job_request_number`, `job_status`, `priority`, `target_port`, `target_date`, `createdAt`, `updatedAt`, `vessel_name`, `imo_number`, `certificate_name`, `issuing_authority`.
  - Nested objects completely removed.
- **Verify**: Check that the response has absolutely no nested objects.

### Task 2: Update Frontend to Access Flat Properties
- **File**: [JobsPage.jsx](file:///Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/Gr-Class-Frontend/components/client/JobsPage.jsx)
- **Action**: Update the table rendering and search filtering in the React component to directly render `job.vessel_name`, `job.imo_number`, and `job.certificate_name` instead of trying to read them from nested objects.
- **Verify**: Check that the page loads and renders vessel name, IMO number, and certificate name perfectly.

### Task 3: Validate Integration and Backend Health
- **File**: Command Line
- **Action**: Run the existing APIs tests to verify that the backend is functional and tests continue to pass.
- **Verify**: Output of `npm run test` or `npm run test:apis`.
