# Support Module API

Source: `src/docs/paths/support.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/support` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
2. `PUT /api/v1/support/{id}` -> ADMIN, GM
3. `PUT /api/v1/support/{id}/status` -> ADMIN, GM

## Routes

### 1. GET /api/v1/support
- Summary: Get support tickets
- Operation ID: `getSupportTickets`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `status` (query, optional, string)
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: List of tickets (application/json => object)

### 2. POST /api/v1/support
- Summary: Create support ticket
- Operation ID: `createSupportTicket`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Ticket created

### 3. GET /api/v1/support/{id}
- Summary: Get ticket by ID
- Operation ID: `getSupportTicketById`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Ticket detail (application/json => object)
- `404`: Ticket not found

### 4. PUT /api/v1/support/{id}
- Summary: Update ticket status (or use /support/{id}/status)
- Operation ID: `updateSupportTicketStatus`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Status updated
- `403`: Forbidden

### 5. PUT /api/v1/support/{id}/status
- Summary: Update ticket status
- Operation ID: `updateSupportTicketStatusPath`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Status updated
- `403`: Forbidden
