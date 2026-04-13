# Auth Module API (Actual)

Source YAML: `src/docs/paths/auth.yaml`

## Routes

### 1. POST /api/v1/auth/login
- Summary: Login
- Operation ID: `login`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/LoginRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `login`
- Joi schema source: `src/middlewares/validate.middleware.js:37`
```js
Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Login successful (application/json => #/components/schemas/LoginResponse)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- `401`: Invalid credentials (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ user, accessToken, refreshToken }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:24`
- Controller: `src/modules/auth/auth.controller.js:19`
- Service: `src/modules/auth/auth.service.js` (`authService.login`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/auth/logout
- Summary: Logout
- Operation ID: `logout`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
- Change Access: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Logged out successfully (application/json => #/components/schemas/LogoutResponse)
- `401`: Not authenticated (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ message: 'Logged out successfully', accessToken: null, refreshToken: null }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:30`
- Controller: `src/modules/auth/auth.controller.js:46`
- Service: `src/modules/auth/auth.service.js:158` (`authService.logout`)
- Models touched: AuditLog.create
- Service returns (detected): true

### 3. POST /api/v1/auth/refresh-token
- Summary: Refresh token
- Operation ID: `refreshToken`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/RefreshTokenRequest
- Req usage in controller: params=[], query=[], body=[refreshToken, token], user=[], files=[]
- Validation schema key: `refreshToken`
- Joi schema source: `src/middlewares/validate.middleware.js:41`
```js
Joi.object({
        refreshToken: Joi.string(),
        token: Joi.string(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Tokens refreshed (application/json => #/components/schemas/RefreshTokenResponse)
- `401`: Invalid or expired refresh token (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:34`
- Controller: `src/modules/auth/auth.controller.js:58`
- Service: `src/modules/auth/auth.service.js:175` (`authService.refreshToken`)
- Models touched: User.findByPk
- Service returns (detected): {
            user: userObj,
            accessToken: generateAccessToken(user),
            refreshToken: generateRefreshToken(user),
        }

### 4. POST /api/v1/auth/forgot-password
- Summary: Forgot password
- Operation ID: `forgotPassword`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ForgotPasswordRequest
- Req usage in controller: params=[], query=[], body=[email], user=[], files=[]
- Validation schema key: `forgotPassword`
- Joi schema source: `src/middlewares/validate.middleware.js:45`
```js
Joi.object({
        email: Joi.string().email().required(),
    })
```

Response (Actual)
- YAML response map:
- `200`: Password reset email sent (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ message: 'Password reset email sent' }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:38`
- Controller: `src/modules/auth/auth.controller.js:75`
- Service: `src/modules/auth/auth.service.js:213` (`authService.forgotPassword`)
- Models touched: User.findOne
- Service returns (detected): same message to avoid revealing whether email exists
        return

### 5. POST /api/v1/auth/reset-password
- Summary: Reset password
- Operation ID: `resetPassword`
- Access Roles: PUBLIC
- Change Access: PUBLIC

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ResetPasswordRequest
- Req usage in controller: params=[], query=[], body=[token, newPassword], user=[], files=[]
- Validation schema key: `resetPassword`
- Joi schema source: `src/middlewares/validate.middleware.js:48`
```js
Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and digit' }),
    })
```

Response (Actual)
- YAML response map:
- `200`: Password reset successfully (application/json => object)
- `400`: Invalid or expired token (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ message: 'Password reset successfully' }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:42`
- Controller: `src/modules/auth/auth.controller.js:84`
- Service: `src/modules/auth/auth.service.js:228` (`authService.resetPassword`)
- Models touched: User.findByPk
- Service returns (detected): N/A

### 6. POST /api/v1/auth/change-password
- Summary: Change password
- Operation ID: `changePassword`
- Access Roles: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN
- Change Access: ADMIN, GM, TM, TO, TA, SURVEYOR, CLIENT, FLAG_ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/ChangePasswordRequest
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `changePassword`
- Joi schema source: `src/middlewares/validate.middleware.js:52`
```js
Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and digit' }),
    })
```

Response (Actual)
- YAML response map:
- `200`: Password changed successfully
- `400`: Validation error
- `401`: Unauthorized
- Controller response envelope(s):
```js
{ success: true, message: 'Password changed successfully' }
```

Implementation Trace
- Route file: `src/modules/auth/auth.routes.js:46`
- Controller: `src/modules/auth/auth.controller.js:93`
- Service: `src/modules/auth/auth.service.js:247` (`authService.changePassword`)
- Models touched: User.findByPk
- Service returns (detected): N/A