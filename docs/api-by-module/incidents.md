# Incidents Module API (Actual)

Source YAML: `src/docs/paths/incidents.yaml`

## Routes

### 1. GET /api/v1/incidents
- Summary: Get incidents
- Operation ID: `getIncidents`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- `status` (query, optional, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of incidents (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/incidents/incident.routes.js:10`
- Controller: `src/modules/incidents/incident.controller.js:19`
- Service: `src/modules/incidents/incident.service.js:24` (`incidentService.getIncidents`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/incidents
- Summary: Report incident
- Operation ID: `reportIncident`
- Access Roles: CLIENT, ADMIN, GM, TM
- Change Access: CLIENT, ADMIN, GM, TM

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[role, client_id, id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Incident reported
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/incidents/incident.routes.js:9`
- Controller: `src/modules/incidents/incident.controller.js:11`
- Service: `src/modules/incidents/incident.service.js:9` (`incidentService.reportIncident`)
- Models touched: Vessel.findOne, Incident.create
- Service returns (detected): await Incident.create({
        ...data,
        reported_by: userId,
        status: 'OPEN'
    })

### 3. GET /api/v1/incidents/{id}
- Summary: Get incident by ID
- Operation ID: `getIncidentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Incident detail (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/incidents/incident.routes.js:11`
- Controller: `src/modules/incidents/incident.controller.js:27`
- Service: `src/modules/incidents/incident.service.js:63` (`incidentService.getIncidentById`)
- Models touched: N/A
- Service returns (detected): N/A

### 4. PUT /api/v1/incidents/{id}/status
- Summary: Update incident status
- Operation ID: `updateIncidentStatus`
- Access Roles: ADMIN, GM, TM
- Change Access: ADMIN, GM, TM

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