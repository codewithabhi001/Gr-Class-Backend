# Notifications Module API

Source: `src/docs/paths/notifications.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `PUT /api/v1/notifications/{id}/read` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
2. `PUT /api/v1/notifications/read-all` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT

## Routes

### 1. GET /api/v1/notifications
- Summary: Get notifications
- Operation ID: `getNotifications`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of notifications retrieved successfully (application/json => array)

### 2. PUT /api/v1/notifications/{id}/read
- Summary: Mark as read
- Operation ID: `markNotificationRead`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Marked as read

### 3. PUT /api/v1/notifications/read-all
- Summary: Mark all as read
- Operation ID: `markAllNotificationsRead`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: All marked as read
