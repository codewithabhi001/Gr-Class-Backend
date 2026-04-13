# Site Static Module API (Actual)

Source YAML: `src/docs/paths/site_static.yaml`

## Routes

### 1. GET /api/v1/website/static-content
- Summary: List static content
- Operation ID: `listStaticContent`
- Access Roles: ADMIN, PUBLIC
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
- `200`: List of static content (application/json => array)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/website/static-content
- Summary: Create static content (Admin Only)
- Operation ID: `createStaticContent`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/SiteStaticContentInput
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Content created (application/json => #/components/schemas/SiteStaticContent)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/website/static-content/{slug}
- Summary: Get specific static content
- Operation ID: `getStaticContentBySlug`
- Access Roles: ADMIN, PUBLIC
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `slug` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Content details (application/json => #/components/schemas/SiteStaticContent)
- `404`: Not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/website/static-content/{slug}
- Summary: Update static content (Admin Only)
- Operation ID: `updateStaticContent`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `slug` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/SiteStaticContentInput
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Content updated (application/json => #/components/schemas/SiteStaticContent)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. DELETE /api/v1/website/static-content/{slug}
- Summary: Delete static content (Admin Only)
- Operation ID: `deleteStaticContent`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `slug` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Deleted successfully
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 6. POST /api/v1/website/newsletter/subscribe
- Summary: Subscribe to newsletter
- Operation ID: `N/A`
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
- `200`: Subscribed successfully
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 7. GET /api/v1/website/newsletter/subscribers
- Summary: List Newsletter Subscribers (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
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
- `200`: Subscriber list
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A