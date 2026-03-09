Create a fully functional and optimized "Assign/Reassign Surveyor" UI Component in React using the new API endpoint `GET /api/v1/jobs/:jobId/eligible-surveyors`.

### 1. API Context
The `/api/v1/jobs/:jobId/eligible-surveyors` endpoint accepts an optional `search` query parameter (which filters by name or license number) and returns two distinct arrays: `eligible` and `not_eligible`.

Example Response (`GET /api/v1/jobs/123/eligible-surveyors?search=alex`):
```json
{
  "success": true,
  "data": {
    "eligible": [
      {
        "id": "surveyor_id_1",
        "name": "Alex",
        "email": "alex@surveyor.com",
        "is_available": true,
        "license_number": "LIC-SRV-2024-0001",
        "years_of_experience": 5,
        "missing_reasons": []
      }
    ],
    "not_eligible": [
      {
        "id": "surveyor_id_2",
        "name": "John Doe",
        "email": "john@surveyor.com",
        "is_available": true,
        "missing_reasons": [
          "Missing Vessel Authority (Oil Tanker)",
          "Missing Certificate Authority (Load Line)"
        ]
      }
    ]
  }
}
```

### 2. UI / UX Requirements
1. **Modal/Drawer Logic:** 
   Create a modal/drawer that displays a form to assign/reassign a surveyor to a job. The API `PUT /api/v1/jobs/:jobId/assign` expects `{ surveyorId: "xyz..." }` in the body.
   
2. **Dynamic Autocomplete/Select Component:**
   Use a virtualized Autocomplete or Async Select component (e.g., MUI Autocomplete, React-Select, or Radix UI combined with a virtualizer like `react-window` if the list is long). 
   
3. **Async Search API Integration:**
   - The dropdown should initially fetch without a search query (returning the first batch).
   - As the user types into the dropdown, implement a debounce (e.g., 300ms) and trigger the API by appending `?search=${searchText}`.
   
4. **Grouped Dropdown Options:**
   Flatten and categorize the API data into the React component carefully:
   - **Group 1:** "Eligible Surveyors" (Items from the `eligible` array). Selectable.
   - **Group 2:** "Non-Eligible Surveyors" (Items from the `not_eligible` array). 

5. **Visual distinction for Non-Eligible items:**
   - Options coming from the `not_eligible` array MUST NOT be selectable. Make them `disabled`.
   - The item design should look faded/greyed out with reduced opacity.
   - Render a small icon/badge next to these items to show they are blocked.
   - Include a multi-line or comma-separated subtext below the name indicating why they are blocked using the `missing_reasons` array. Example: `Not authorized for: Missing Vessel Authority (Oil Tanker)`.
   - Add a subtle Custom Tooltip on hover over disabled items showing the exact reasons.

6. **Item Details:** 
   Display the surveyor's Name, Email, and License Number inline within the dropdown options so the admin can confidently verify the correct person. (e.g. `Alex (LIC-SRV-2024-0001) - alex@surveyor.com`)

### Expected Deliverables:
1. The API fetch logic with debounce handling.
2. The Grouped Select/Autocomplete UI Component reflecting the Disabled and Tooltip logic.
3. Form Submission handler calling the actual PUT API.
