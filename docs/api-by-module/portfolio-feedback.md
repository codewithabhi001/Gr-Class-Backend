# Portfolio Feedback Module API (Actual)

Source YAML: `src/docs/paths/portfolio-feedback.yaml`

## Routes

### 1. GET /api/v1/portfolio-feedback
- Summary: Get all portfolio feedback (Admin view)
- Operation ID: `N/A`
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
- `200`: List of feedbacks (application/json => array)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/portfolio-feedback
- Summary: Submit/Update portfolio feedback (Client view)
- Operation ID: `N/A`
- Access Roles: CLIENT
- Change Access: CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/PortfolioFeedbackInput
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Feedback submitted (application/json => #/components/schemas/PortfolioFeedbackPublic)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/portfolio-feedback/my-feedback
- Summary: Get own portfolio feedback (Client view)
- Operation ID: `N/A`
- Access Roles: CLIENT
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
- `200`: Client feedback (application/json => #/components/schemas/PortfolioFeedbackPublic)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/portfolio-feedback/public
- Summary: Get visible portfolio feedback (Public view)
- Operation ID: `N/A`
- Access Roles: PUBLIC
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
- `200`: List of visible feedbacks (application/json => array)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. PATCH /api/v1/portfolio-feedback/{id}/visibility
- Summary: Toggle feedback visibility (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/PortfolioFeedbackVisibilityInput
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Visibility updated (application/json => #/components/schemas/PortfolioFeedback)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A