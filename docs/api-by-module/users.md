# Users Module API (Actual)

Source YAML: `src/docs/paths/users.yaml`

## Routes

### 1. GET /api/v1/users
- Summary: Get all users
- Operation ID: `getUsers`
- Access Roles: ADMIN
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
- `200`: List of users
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Users fetched successfully',
            data: users
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:22`
- Controller: `src/modules/users/user.controller.js:10`
- Service: `src/modules/users/user.service.js:8` (`userService.getUsers`)
- Models touched: User.findAll
- Service returns (detected): await fileAccessService.resolveEntity(users)

### 2. POST /api/v1/users
- Summary: Create user
- Operation ID: `createUser`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/UserCreateRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `createUser`
- Joi schema source: `src/middlewares/validate.middleware.js:194`
```js
Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and digit' }),
        role: Joi.string().valid('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT').required(),
        phone: Joi.string().optional().allow('', null),
        client_id: Joi.string().guid().optional().allow(null, ''),
        license_number: Joi.string().optional().allow(''),
        authorized_ship_types: Joi.array().items(Joi.string()).optional(),
        authorized_certificates: Joi.array().items(Joi.string()).optional(),
        valid_from: Joi.date().iso().optional(),
    })
```

Response (Actual)
- YAML response map:
- `201`: User created
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'User created successfully',
            data: user
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:25`
- Controller: `src/modules/users/user.controller.js:21`
- Service: `src/modules/users/user.service.js:44` (`userService.createUser`)
- Models touched: N/A
- Service returns (detected): await authService.register(data)

### 3. GET /api/v1/users/me
- Summary: Get current user profile
- Operation ID: `getMyProfile`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
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
- `200`: Current user profile
- `401`: Unauthorized
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 4. PUT /api/v1/users/{id}
- Summary: Update user
- Operation ID: `updateUser`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UserUpdateRequest
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `updateUser`
- Joi schema source: `src/middlewares/validate.middleware.js:427`
```js
Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid('ADMIN', 'GM', 'TM', 'TO', 'SURVEYOR', 'CLIENT').optional(),
        phone: Joi.string().optional().allow(''),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
        client_id: Joi.string().guid().optional().allow(null),
    })
```

Response (Actual)
- YAML response map:
- `200`: User updated
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'User updated successfully',
            data: user
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:28`
- Controller: `src/modules/users/user.controller.js:32`
- Service: `src/modules/users/user.service.js:48` (`userService.updateUser`)
- Models touched: User.findByPk, User.findOne
- Service returns (detected): user

### 5. DELETE /api/v1/users/{id}
- Summary: Delete user
- Operation ID: `deleteUser`
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
- `200`: User deleted
- `403`: Forbidden
- Controller response envelope(s):
```js
{
            success: true,
            message: 'User deleted successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:34`
- Controller: `src/modules/users/user.controller.js:54`
- Service: `src/modules/users/user.service.js:70` (`userService.deleteUser`)
- Models touched: User.findByPk
- Service returns (detected): { message: 'User deleted' }

### 6. PUT /api/v1/users/{id}/status
- Summary: Update user status
- Operation ID: `updateUserStatus`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/UserStatusUpdateRequest
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

### 7. PUT /api/v1/users/fcm-token
- Summary: Update FCM device token for push notifications
- Operation ID: `updateFcmToken`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: ADMIN, GM, TM, TO, SURVEYOR, CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/UpdateFcmTokenRequest
- Req usage in controller: params=[], query=[], body=[fcmToken], user=[id], files=[]
- Validation schema key: `updateFcmToken`
- Joi schema source: `src/middlewares/validate.middleware.js:479`
```js
Joi.object({
        fcmToken: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: FCM token updated successfully (application/json => object)
- `400`: Invalid token provided
- `401`: Unauthorized
- Controller response envelope(s):
```js
{
            success: true,
            message: 'FCM token updated successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:19`
- Controller: `src/modules/users/user.controller.js:65`
- Service: `src/modules/users/user.service.js:77` (`userService.updateFcmToken`)
- Models touched: User.findByPk
- Service returns (detected): { success: true }

### 8. PUT /api/v1/users/profile-pic
- Summary: Update profile picture
- Operation ID: `updateProfilePic`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Change Access: ADMIN, GM, TM, TO, SURVEYOR, CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[file]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Profile picture updated (application/json => object)
- `401`: Unauthorized
- Controller response envelope(s):
```js
{
            success: true,
            message: 'Profile picture updated successfully',
            data: result
        }
```

Implementation Trace
- Route file: `src/modules/users/user.routes.js:16`
- Controller: `src/modules/users/user.controller.js:76`
- Service: `src/modules/users/user.service.js:84` (`userService.updateProfilePic`)
- Models touched: N/A
- Service returns (detected): N/A