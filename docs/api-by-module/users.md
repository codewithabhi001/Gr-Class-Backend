# Users Module API

Source: `src/docs/paths/users.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO
- Roles with change access: ADMIN, CLIENT, GM, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/users` -> ADMIN
2. `PUT /api/v1/users/me` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
3. `PUT /api/v1/users/{id}` -> ADMIN
4. `DELETE /api/v1/users/{id}` -> ADMIN
5. `PUT /api/v1/users/{id}/status` -> ADMIN
6. `PUT /api/v1/users/fcm-token` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
7. `PUT /api/v1/users/profile-pic` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT

## Routes

### 1. GET /api/v1/users
- Summary: Get all users
- Operation ID: `getUsers`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- `role` (query, optional, string)
- Request Body:
- None
- Responses:
- `200`: List of users (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/users
- Summary: Create user
- Operation ID: `createUser`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/UserCreateRequest
- Responses:
- `201`: User created
- `403`: Forbidden

### 3. GET /api/v1/users/me
- Summary: Get current user profile
- Operation ID: `getMyProfile`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Current user profile
- `401`: Unauthorized

### 4. PUT /api/v1/users/me
- Summary: Update current user profile
- Operation ID: `updateMyProfile`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Profile updated (application/json => object)
- `401`: Unauthorized

### 5. GET /api/v1/users/{id}
- Summary: Get user details by ID
- Operation ID: `getUserById`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: User details retrieved successfully (application/json => object)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: User not found

### 6. PUT /api/v1/users/{id}
- Summary: Update user
- Operation ID: `updateUser`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UserUpdateRequest
- Responses:
- `200`: User updated
- `403`: Forbidden

### 7. DELETE /api/v1/users/{id}
- Summary: Delete user
- Operation ID: `deleteUser`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: User deleted
- `403`: Forbidden

### 8. PUT /api/v1/users/{id}/status
- Summary: Update user status
- Operation ID: `updateUserStatus`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/UserStatusUpdateRequest
- Responses:
- `200`: Status updated
- `403`: Forbidden

### 9. PUT /api/v1/users/fcm-token
- Summary: Update FCM device token for push notifications
- Operation ID: `updateFcmToken`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/UpdateFcmTokenRequest
- Responses:
- `200`: FCM token updated successfully (application/json => object)
- `400`: Invalid token provided
- `401`: Unauthorized

### 10. PUT /api/v1/users/profile-pic
- Summary: Update profile picture
- Operation ID: `updateProfilePic`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `200`: Profile picture updated (application/json => object)
- `401`: Unauthorized
