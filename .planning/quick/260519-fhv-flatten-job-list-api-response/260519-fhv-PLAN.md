# Plan: Flatten and Optimize Job List API Response

This quick task addresses the issue where the job list API (`GET /api/v1/jobs`) returns a highly nested object structure ("object inside object"), causing heavy payload sizes and frontend complexity. We will flatten the response to only return the essential flat fields at the top level, while preserving key lightweight nested objects for absolute backward compatibility with the React/Next.js frontend.

## Goals
- Flatten the output of `jobService.getJobs` in `src/modules/jobs/job.service.js`.
- Reduce payload size and database load by stripping heavy lookup fields and joins (such as surveyor, requester, approver, surveys, and payments) from the database query completely.
- Keep the list query extremely fast, returning only: job id, request number, target date, port, status, vessel details, priority, certificate details, and issuing authority.
- Maintain backward-compatible lightweight `Vessel` and `CertificateType` objects so the existing Next.js frontend pages continue to render without issues.
- Verify the change against standard backend tests.

## Tasks

### Task 1: Flatten Job List Response in `job.service.js`
- **File**: [job.service.js](file:///Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/src/modules/jobs/job.service.js)
- **Action**: Optimize database lookup attributes and includes, and map each job instance into a flattened structure with only:
  - Flat fields: `id`, `job_request_number`, `job_status`, `priority`, `target_port`, `target_date`, `createdAt`, `updatedAt`, `vessel_id`, `vessel_name`, `imo_number`, `certificate_type_id`, `certificate_name`, `issuing_authority`.
  - Lightweight compatible sub-objects:
    - `Vessel`: `{ id, vessel_name, imo_number }`
    - `CertificateType`: `{ id, name, issuing_authority }`
- **Verify**: Check that the response is flat, minimal, and doesn't load surveyor/survey/payment tables unnecessarily.

### Task 2: Validate Integration and Backend Health
- **File**: Command Line
- **Action**: Run the existing APIs tests to verify that the backend is functional and tests continue to pass.
- **Verify**: Output of `npm run test` or `npm run test:apis`.
