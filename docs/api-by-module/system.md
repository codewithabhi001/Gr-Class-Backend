# System Module API (Actual)

Source YAML: `src/docs/paths/system.yaml`

## Routes

### 1. GET /api/v1/system/metrics
- Summary: Get system metrics
- Operation ID: `getSystemMetrics`
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
- `200`: System metrics
- `403`: Forbidden
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 2. GET /api/v1/system/health
- Summary: Get system health
- Operation ID: `getSystemHealth`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: Health status
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. GET /api/v1/system/readiness
- Summary: Get system readiness
- Operation ID: `getSystemReadiness`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: Readiness status
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. GET /api/v1/system/version
- Summary: Get system version
- Operation ID: `getSystemVersion`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
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
- `200`: Version info
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 5. GET /api/v1/system/audit-logs
- Summary: Get audit logs
- Operation ID: `getAuditLogs`
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
- `200`: Audit logs
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:17`
- Controller: `src/modules/system/system.controller.js:10`
- Service: `src/modules/system/system.service.js:57` (`systemService.getAuditLogs`)
- Models touched: AuditLog.findAndCountAll
- Service returns (detected): {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        logs: rows
    }

### 6. POST /api/v1/system/users/{id}/logout
- Summary: Force user logout
- Operation ID: `forceLogout`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: User logged out
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:18`
- Controller: `src/modules/system/system.controller.js:17`
- Service: `src/modules/system/system.service.js:86` (`systemService.forceLogout`)
- Models touched: N/A
- Service returns (detected): { success: true, message: `User session invalidation command sent for ${userId}` }

### 7. GET /api/v1/system/migrations
- Summary: Get migrations
- Operation ID: `getMigrations`
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
- `200`: Migration status
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:19`
- Controller: `src/modules/system/system.controller.js:63`
- Service: `src/modules/system/system.service.js:166` (`systemService.getMigrations`)
- Models touched: N/A
- Service returns (detected): {
            applied,
            pending,
            total_applied: applied.length,
            total_pending: pending.length
        } | { applied: [], pending: [], error: 'Could not fetch migration metadata' }

### 8. GET /api/v1/system/jobs/failed
- Summary: Get failed jobs
- Operation ID: `getFailedJobs`
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
- `200`: Failed jobs
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:20`
- Controller: `src/modules/system/system.controller.js:24`
- Service: `src/modules/system/system.service.js:90` (`systemService.getFailedJobs`)
- Models touched: JobRequest.findAll
- Service returns (detected): rejected.map(r => ({
        id: r.id,
        vessel: r.Vessel?.vessel_name,
        status: r.job_status,
        updated_at: r.updatedAt,
        reason: r.remarks || 'Rejected via workflow'
    }))

### 9. POST /api/v1/system/jobs/{id}/retry
- Summary: Retry failed job
- Operation ID: `retryJob`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job retried
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:21`
- Controller: `src/modules/system/system.controller.js:31`
- Service: `src/modules/system/system.service.js:109` (`systemService.retryJob`)
- Models touched: JobRequest.findByPk, JobStatusHistory.create
- Service returns (detected): { 
        success: true, 
        message: 'Job status reset to CREATED successfully', 
        job_id: id 
    }

### 10. POST /api/v1/system/maintenance/{action}
- Summary: Maintenance action
- Operation ID: `maintenanceAction`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `action` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[action], query=[], body=[], user=[id, email], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Action executed
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:22`
- Controller: `src/modules/system/system.controller.js:38`
- Service: `src/modules/system/system.service.js:140` (`systemService.performMaintenance`)
- Models touched: N/A
- Service returns (detected): { message: `Cleared ${keys.length} keys from cache`, action } | { message: 'No distributed cache (Redis) configured to clear', action } | { message: 'Metadata re-indexing requested successfully', action }

### 11. GET /api/v1/system/feature-flags
- Summary: Get feature flags
- Operation ID: `getFeatureFlags`
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
- `200`: Feature flags
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: { flags: { 'NEW_UI': true, 'BETA_REPORTS': false } } }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:23`
- Controller: `src/modules/system/system.controller.js:59`
- Services: N/A

### 12. GET /api/v1/system/locales
- Summary: Get locales
- Operation ID: `getLocales`
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
- `200`: Locales
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/system/system.routes.js:24`
- Controller: `src/modules/system/system.controller.js:70`
- Service: `src/modules/system/system.service.js:192` (`systemService.getLocales`)
- Models touched: FlagAdministration.findAll
- Service returns (detected): { 
        available: flags.map(f => ({ code: f.country, name: f.flag_state_name })),
        default: 'INT'
    }