# Auth Module API

Source: `src/docs/paths/auth.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, PUBLIC, SURVEYOR, TM, TO
- Roles with read access: N/A
- Roles with change access: ADMIN, CLIENT, GM, PUBLIC, SURVEYOR, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/auth/login` -> PUBLIC
2. `POST /api/v1/auth/logout` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT
3. `POST /api/v1/auth/refresh-token` -> PUBLIC
4. `POST /api/v1/auth/forgot-password` -> PUBLIC
5. `POST /api/v1/auth/reset-password` -> PUBLIC
6. `POST /api/v1/auth/change-password` -> ADMIN, GM, TM, TO, SURVEYOR, CLIENT

## Routes

### 1. POST /api/v1/auth/login
- Summary: Login
- Operation ID: `login`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/LoginRequest
- Responses:
- `200`: Login successful (application/json => #/components/schemas/LoginResponse)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- `401`: Invalid credentials (application/json => #/components/schemas/ErrorResponse)

### 2. POST /api/v1/auth/logout
- Summary: Logout
- Operation ID: `logout`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Logged out successfully (application/json => #/components/schemas/LogoutResponse)
- `401`: Not authenticated (application/json => #/components/schemas/ErrorResponse)

### 3. POST /api/v1/auth/refresh-token
- Summary: Refresh token
- Operation ID: `refreshToken`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/RefreshTokenRequest
- Responses:
- `200`: Tokens refreshed (application/json => #/components/schemas/RefreshTokenResponse)
- `401`: Invalid or expired refresh token (application/json => #/components/schemas/ErrorResponse)

### 4. POST /api/v1/auth/forgot-password
- Summary: Forgot password
- Operation ID: `forgotPassword`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ForgotPasswordRequest
- Responses:
- `200`: Password reset email sent (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 5. POST /api/v1/auth/reset-password
- Summary: Reset password
- Operation ID: `resetPassword`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ResetPasswordRequest
- Responses:
- `200`: Password reset successfully (application/json => object)
- `400`: Invalid or expired token (application/json => #/components/schemas/ErrorResponse)

### 6. POST /api/v1/auth/change-password
- Summary: Change password
- Operation ID: `changePassword`
- Access Roles: ADMIN, GM, TM, TO, SURVEYOR, CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/ChangePasswordRequest
- Responses:
- `200`: Password changed successfully
- `400`: Validation error
- `401`: Unauthorized
