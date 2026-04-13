# Website Module API (Actual)

Source YAML: `src/docs/paths/website.yaml`

## Routes

### 1. GET /api/v1/public/website/videos
- Summary: Get all website videos (Public)
- Operation ID: `getPublicVideos`
- Access Roles: PUBLIC
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `section` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of videos (application/json => array)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. GET /api/v1/website/videos
- Summary: List all videos (Internal)
- Operation ID: `listVideosInternal`
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
- `200`: List of videos (application/json => array)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. POST /api/v1/website/videos
- Summary: Upload a new video or image (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Video uploaded successfully (application/json => #/components/schemas/WebsiteVideo)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/website/videos/{id}
- Summary: Update video details
- Operation ID: `N/A`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Video updated successfully (application/json => #/components/schemas/WebsiteVideo)
- `404`: Video not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. DELETE /api/v1/website/videos/{id}
- Summary: Delete a video
- Operation ID: `N/A`
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
- `204`: Video deleted successfully
- `404`: Video not found
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A