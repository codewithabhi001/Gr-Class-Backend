# Contact Module API

Source: `src/docs/paths/contact.yaml`

## Access Summary
- Roles with any access: ADMIN, GM, PUBLIC
- Roles with read access: ADMIN, GM
- Roles with change access: ADMIN, GM, PUBLIC

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/contact` -> PUBLIC
2. `DELETE /api/v1/contact/{id}` -> ADMIN
3. `PATCH /api/v1/contact/{id}/status` -> ADMIN, GM

## Routes

### 1. GET /api/v1/contact
- Summary: List all enquiries (Admin/GM)
- Operation ID: `getAllContactEnquiries`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `status` (query, optional, string)
- `source_page` (query, optional, string)
- `q` (query, optional, string)
- `from_date` (query, optional, string)
- `to_date` (query, optional, string)
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: Paginated list of enquiries (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/contact
- Summary: Submit a contact enquiry (public)
- Operation ID: `submitContactEnquiry`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Enquiry submitted successfully (application/json => object)
- `400`: Validation error

### 3. GET /api/v1/contact/stats
- Summary: Enquiry stats by status (Admin/GM)
- Operation ID: `getContactEnquiryStats`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Enquiry counts by status (application/json => object)
- `403`: Forbidden

### 4. GET /api/v1/contact/{id}
- Summary: Get a single enquiry (Admin/GM)
- Operation ID: `getContactEnquiryById`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Enquiry details (application/json => object)
- `404`: Not found

### 5. DELETE /api/v1/contact/{id}
- Summary: Delete an enquiry (Admin only)
- Operation ID: `deleteContactEnquiry`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `204`: Deleted successfully
- `404`: Not found

### 6. PATCH /api/v1/contact/{id}/status
- Summary: Update enquiry status / internal note (Admin/GM)
- Operation ID: `updateContactEnquiryStatus`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Enquiry updated (application/json => object)
- `403`: Forbidden
- `404`: Not found
