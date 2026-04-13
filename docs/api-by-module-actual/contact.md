# Contact Module API (Actual)

Source YAML: `src/docs/paths/contact.yaml`

## Routes

### 1. GET /api/v1/contact
- Summary: List all enquiries (Admin/GM)
- Operation ID: `getAllContactEnquiries`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `status` (query, optional, string)
- `source_page` (query, optional, string)
- `q` (query, optional, string)
- `from_date` (query, optional, string)
- `to_date` (query, optional, string)
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Paginated list of enquiries (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/contact
- Summary: Submit a contact enquiry (public)
- Operation ID: `submitContactEnquiry`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Enquiry submitted successfully (application/json => object)
- `400`: Validation error
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/contact/stats
- Summary: Enquiry stats by status (Admin/GM)
- Operation ID: `getContactEnquiryStats`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Enquiry counts by status (application/json => object)
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/contact/{id}
- Summary: Get a single enquiry (Admin/GM)
- Operation ID: `getContactEnquiryById`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Enquiry details (application/json => object)
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. DELETE /api/v1/contact/{id}
- Summary: Delete an enquiry (Admin only)
- Operation ID: `deleteContactEnquiry`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `204`: Deleted successfully
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 6. PATCH /api/v1/contact/{id}/status
- Summary: Update enquiry status / internal note (Admin/GM)
- Operation ID: `updateContactEnquiryStatus`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Enquiry updated (application/json => object)
- `403`: Forbidden
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A