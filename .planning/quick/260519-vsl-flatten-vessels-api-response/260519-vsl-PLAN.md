# Plan: Flatten Vessels List API Response and Optimize Metadata

This quick task addresses the formatting of the vessels list API response (`GET /api/v1/vessels`). We will flatten each vessel object inside the rows arrays, remove unnecessary nested structures (like `Client` and `FlagAdministration`), and streamline the status counts to return a structured active/inactive count object.

## Goals
- Flatten each vessel object inside the array returned by `vesselService.getVessels` in `src/modules/vessels/vessel.service.js`.
- Remove all nested objects (`Client`, `FlagAdministration`) and return only direct flat properties.
- Format `status_counts` as a clean object containing `active` and `inactive` counts: `{ active: X, inactive: Y }`.
- Ensure compatibility with the React/Next.js frontend pages.

## Tasks

### Task 1: Flat Vessel Mapping in `vessel.service.js`
- **File**: [vessel.service.js](file:///Users/abhinavvishwakarma/Desktop/GIRIK_Workshop/GIRIK_BACKEND/src/modules/vessels/vessel.service.js)
- **Action**: Modify `getVessels` to map each raw vessel row into a flat object containing:
  - `id`, `vessel_name`, `imo_number`, `ship_type`, `class_status`, `created_at`
  - `flag_state` (derived from `FlagAdministration.flag_state_name`)
  - `company_name` (derived from `Client.company_name`)
  - `company_code` (derived from `Client.company_code`)
- **Action**: Map `status_counts` to `{ active: parseInt(activeCount), inactive: parseInt(inactiveCount) }` and use `total` for the total vessels.

### Task 2: Validate Integration and Backend Health
- **File**: Command Line
- **Action**: Run the existing APIs tests to verify that the backend is functional.
- **Verify**: Output of `npm run test`.
