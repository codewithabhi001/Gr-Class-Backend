# Incidents Module API

Source: `src/docs/paths/incidents.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, TM

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/incidents` -> CLIENT, ADMIN, GM, TM
2. `PUT /api/v1/incidents/{id}/status` -> ADMIN, GM, TM

## Routes

### 1. GET /api/v1/incidents
- Summary: Get incidents
- Operation ID: `getIncidents`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of incidents (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/incidents
- Summary: Report incident
- Operation ID: `reportIncident`
- Access Roles: CLIENT, ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Incident reported
- `403`: Forbidden

### 3. GET /api/v1/incidents/{id}
- Summary: Get incident by ID
- Operation ID: `getIncidentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Incident detail (application/json => object)
- `403`: Forbidden

### 4. PUT /api/v1/incidents/{id}/status
- Summary: Update incident status
- Operation ID: `updateIncidentStatus`
- Access Roles: ADMIN, GM, TM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Status updated
- `403`: Forbidden
