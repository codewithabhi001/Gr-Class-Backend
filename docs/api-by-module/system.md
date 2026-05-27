# System Module API

Source: `src/docs/paths/system.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/system/users/{id}/logout` -> ADMIN
2. `POST /api/v1/system/jobs/{id}/retry` -> ADMIN
3. `POST /api/v1/system/maintenance/{action}` -> ADMIN

## Routes

### 1. GET /api/v1/system/metrics
- Summary: Get system metrics
- Operation ID: `getSystemMetrics`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: System metrics
- `403`: Forbidden

### 2. GET /api/v1/system/health
- Summary: Get system health
- Operation ID: `getSystemHealth`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Health status

### 3. GET /api/v1/system/readiness
- Summary: Get system readiness
- Operation ID: `getSystemReadiness`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Readiness status

### 4. GET /api/v1/system/version
- Summary: Get system version
- Operation ID: `getSystemVersion`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Version info

### 5. GET /api/v1/system/audit-logs
- Summary: Get audit logs
- Operation ID: `getAuditLogs`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Audit logs
- `403`: Forbidden

### 6. POST /api/v1/system/users/{id}/logout
- Summary: Force user logout
- Operation ID: `forceLogout`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: User logged out
- `403`: Forbidden

### 7. GET /api/v1/system/migrations
- Summary: Get migrations
- Operation ID: `getMigrations`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Migration status
- `403`: Forbidden

### 8. GET /api/v1/system/jobs/failed
- Summary: Get failed jobs
- Operation ID: `getFailedJobs`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Failed jobs
- `403`: Forbidden

### 9. POST /api/v1/system/jobs/{id}/retry
- Summary: Retry failed job
- Operation ID: `retryJob`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Job retried
- `403`: Forbidden

### 10. POST /api/v1/system/maintenance/{action}
- Summary: Maintenance action
- Operation ID: `maintenanceAction`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `action` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Action executed
- `403`: Forbidden

### 11. GET /api/v1/system/feature-flags
- Summary: Get feature flags
- Operation ID: `getFeatureFlags`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Feature flags
- `403`: Forbidden

### 12. GET /api/v1/system/locales
- Summary: Get locales
- Operation ID: `getLocales`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Locales
- `403`: Forbidden
