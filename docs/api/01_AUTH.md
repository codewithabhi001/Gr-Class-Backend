# 01 — Authentication APIs

**Base URL:** `/api/v1/auth`

---

## 1. POST `/api/v1/auth/login`

> **Access:** Public (rate limited: 10 requests per 15 minutes)

### Request Body
```json
{
  "email": "admin@girik.com",
  "password": "Admin@123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Must be valid email |
| `password` | string | ✅ | — |

### Response `200 OK`
```json
{
  "user": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "name": "Admin User",
    "email": "admin@girik.com",
    "role": "ADMIN",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": null,
    "force_password_reset": false,
    "last_login_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response `400 Bad Request` (validation error)
```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid input data. Please check the fields.",
  "errors": {
    "email": "email must be a valid email",
    "password": "password is required"
  }
}
```

### Response `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Response `429 Too Many Requests`
```json
{
  "success": false,
  "message": "Too many attempts, please try again later."
}
```

---

## 2. POST `/api/v1/auth/logout`

> **Access:** Authenticated (any role)  
> **Headers:** `Authorization: Bearer <accessToken>`

### Request Body
None

### Response `200 OK`
```json
{
  "message": "Logged out successfully",
  "accessToken": null,
  "refreshToken": null
}
```

---

## 3. POST `/api/v1/auth/refresh-token`

> **Access:** Public (requires valid refresh token)

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
OR
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `refreshToken` | string | ✅ (one of) | The refresh token |
| `token` | string | ✅ (one of) | Alternative field name for refresh token |

### Response `200 OK`
```json
{
  "user": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "name": "Admin User",
    "email": "admin@girik.com",
    "role": "ADMIN",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": null,
    "last_login_at": "2026-03-05T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...(new-access-token)",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...(new-refresh-token)"
}
```

---

## 4. POST `/api/v1/auth/forgot-password`

> **Access:** Public (rate limited: 10 requests per 15 minutes)

### Request Body
```json
{
  "email": "user@girik.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Must be valid email |

### Response `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

## 5. POST `/api/v1/auth/reset-password`

> **Access:** Public (rate limited: 10 requests per 15 minutes)

### Request Body
```json
{
  "token": "reset-token-received-via-email",
  "newPassword": "NewSecure@123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | ✅ | Token from password reset email |
| `newPassword` | string | ✅ | Min 8 chars, must contain uppercase + lowercase + digit |

### Response `200 OK`
```json
{
  "message": "Password reset successfully"
}
```
