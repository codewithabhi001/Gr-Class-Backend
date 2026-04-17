# Notifications Module API (Actual)

Source YAML: `src/docs/paths/notifications.yaml`

## Routes

### 1. GET /api/v1/notifications
- Summary: Get notifications
- Operation ID: `getNotifications`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of notifications retrieved successfully (application/json => array)
- Controller response envelope(s):
```js
{ success: true, data: notifications }
```

Implementation Trace
- Route file: `src/modules/notifications/notification.routes.js:8`
- Controller: `src/modules/notifications/notification.controller.js:3`
- Service: `src/modules/notifications/notification.service.js:86` (`notificationService.getNotifications`)
- Models touched: Notification.findAll
- Service returns (detected): await Notification.findAll({
        where: { user_id: userId },
        attributes: ['id', 'title', 'message', 'type', 'is_read', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 50
    })

### 2. PUT /api/v1/notifications/{id}/read
- Summary: Mark as read
- Operation ID: `markNotificationRead`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: ADMIN, GM, TM, TO, SURVEYOR, CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Marked as read
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 3. PUT /api/v1/notifications/read-all
- Summary: Mark all as read
- Operation ID: `markAllNotificationsRead`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: ADMIN, GM, TM, TO, SURVEYOR, CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: All marked as read
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A