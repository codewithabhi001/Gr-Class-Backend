# Support Module API (Actual)

Source YAML: `src/docs/paths/support.yaml`

## Routes

### 1. GET /api/v1/support
- Summary: Get support tickets
- Operation ID: `getSupportTickets`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: List of tickets
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. POST /api/v1/support
- Summary: Create support ticket
- Operation ID: `createSupportTicket`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT, FLAG_ADMIN
- Change Access: ADMIN, GM, TM, TO, SURVEYOR, CLIENT, FLAG_ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Ticket created
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/support/{id}
- Summary: Get ticket by ID
- Operation ID: `getSupportTicketById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: Ticket details
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/support/{id}
- Summary: Update ticket status (or use /support/{id}/status)
- Operation ID: `updateSupportTicketStatus`
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
- `200`: Status updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. PUT /api/v1/support/{id}/status
- Summary: Update ticket status
- Operation ID: `updateSupportTicketStatusPath`
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
- `200`: Status updated
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A