# Clients Module API

Source: `src/docs/paths/clients.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, TM, TO
- Roles with change access: ADMIN, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/clients` -> ADMIN, GM, TM
2. `PUT /api/v1/clients/{id}` -> ADMIN, GM, TM
3. `DELETE /api/v1/clients/{id}` -> ADMIN

## Routes

### 1. GET /api/v1/clients
- Summary: List clients
- Operation ID: `getClients`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: List of clients (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)

### 2. POST /api/v1/clients
- Summary: Create client
- Operation ID: `createClient`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ClientCreateRequest
- Responses:
- `201`: Client created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 3. GET /api/v1/clients/profile/documents
- Summary: Get client profile documents
- Operation ID: `getClientProfileDocuments`
- Access Roles: CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of documents (application/json => object)

### 4. GET /api/v1/clients/{id}/documents
- Summary: Get client documents by ID
- Operation ID: `getClientDocumentsById`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: List of documents (application/json => object)

### 5. GET /api/v1/clients/{id}
- Summary: Get client by ID
- Operation ID: `getClientById`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Client details (application/json => object)
- `404`: Client not found (application/json => #/components/schemas/ErrorResponse)

### 6. PUT /api/v1/clients/{id}
- Summary: Update client
- Operation ID: `updateClient`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Client updated (application/json => object)

### 7. DELETE /api/v1/clients/{id}
- Summary: Delete client
- Operation ID: `deleteClient`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Client deleted (application/json => object)
- `403`: Forbidden (application/json => #/components/schemas/ErrorResponse)
