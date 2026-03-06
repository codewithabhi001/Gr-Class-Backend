# 03 — User Management APIs

**Base URL:** `/api/v1/users`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/users/me`

> **Access:** Any authenticated user (all roles)  
> Get own profile.

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "name": "Admin User",
    "email": "admin@girik.com",
    "role": "ADMIN",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "profile_pic_url": "https://storage.girik.com/profiles/admin.jpg",
    "force_password_reset": false,
    "last_login_at": "2026-03-05T18:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-03-05T18:00:00.000Z"
  }
}
```

---

## 2. PUT `/api/v1/users/profile-pic`

> **Access:** Any authenticated user  
> **Content-Type:** `multipart/form-data`

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profile_pic` | file (image) | ✅ | JPEG, PNG, WebP |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "profile_pic_url": "https://storage.girik.com/profiles/new-pic.jpg"
  }
}
```

---

## 3. PUT `/api/v1/users/fcm-token`

> **Access:** Any authenticated user  
> Update Firebase Cloud Messaging token for push notifications.

### Request Body
```json
{
  "fcmToken": "firebase-cloud-messaging-device-token-string..."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fcmToken` | string | ✅ | FCM device token |

### Response `200 OK`
```json
{
  "success": true,
  "message": "FCM token updated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000001",
    "fcm_token": "firebase-cloud-messaging-device-token-string..."
  }
}
```

---

## 4. GET `/api/v1/users`

> **Access:** `ADMIN` only  
> List all users in the system.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number (default 1) |
| `limit` | number | optional | Items per page (default 20) |
| `role` | string | optional | Filter by role: `ADMIN`, `GM`, `TM`, `TO`, `TA`, `SURVEYOR`, `CLIENT`, `FLAG_ADMIN` |
| `status` | string | optional | Filter by status: `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `search` | string | optional | Search by name or email |

### Response `200 OK`
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000001",
        "name": "Admin User",
        "email": "admin@girik.com",
        "role": "ADMIN",
        "phone": "+971501234567",
        "status": "ACTIVE",
        "client_id": null,
        "profile_pic_url": null,
        "last_login_at": "2026-03-05T18:00:00.000Z",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-03-05T18:00:00.000Z"
      },
      {
        "id": "019514a2-7e3b-7000-8000-000000000002",
        "name": "John Surveyor",
        "email": "john@girik.com",
        "role": "SURVEYOR",
        "phone": "+971502345678",
        "status": "ACTIVE",
        "client_id": null,
        "profile_pic_url": null,
        "last_login_at": "2026-03-04T12:00:00.000Z",
        "created_at": "2026-01-05T00:00:00.000Z",
        "updated_at": "2026-03-04T12:00:00.000Z"
      }
    ],
    "count": 25
  }
}
```

---

## 5. POST `/api/v1/users`

> **Access:** `ADMIN` only  
> Create a new user.

### Request Body
```json
{
  "name": "New User",
  "email": "newuser@girik.com",
  "password": "Secure@123",
  "role": "TO",
  "phone": "+971501234567",
  "client_id": null
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ | — |
| `email` | string | ✅ | Must be valid email, unique |
| `password` | string | ✅ | Min 8 chars, must have uppercase + lowercase + digit |
| `role` | string | ✅ | One of: `ADMIN`, `GM`, `TM`, `TO`, `TA`, `SURVEYOR`, `CLIENT`, `FLAG_ADMIN` |
| `phone` | string | optional | — |
| `client_id` | UUID | optional | Required for CLIENT role users |

### Response `201 Created`
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000050",
    "name": "New User",
    "email": "newuser@girik.com",
    "role": "TO",
    "phone": "+971501234567",
    "status": "ACTIVE",
    "client_id": null,
    "created_at": "2026-03-05T18:30:00.000Z"
  }
}
```

---

## 6. PUT `/api/v1/users/:id`

> **Access:** `ADMIN` only  
> Update user details.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "name": "Updated Name",
  "email": "updated@girik.com",
  "role": "TM",
  "phone": "+971509876543",
  "status": "ACTIVE",
  "client_id": null
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | optional | — |
| `email` | string | optional | Must be valid email |
| `role` | string | optional | One of: `ADMIN`, `GM`, `TM`, `TO`, `TA`, `SURVEYOR`, `CLIENT`, `FLAG_ADMIN` |
| `phone` | string | optional | — |
| `status` | string | optional | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `client_id` | UUID | optional | Nullable |

### Response `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000050",
    "name": "Updated Name",
    "email": "updated@girik.com",
    "role": "TM",
    "phone": "+971509876543",
    "status": "ACTIVE",
    "client_id": null,
    "updated_at": "2026-03-05T19:00:00.000Z"
  }
}
```

---

## 7. PUT `/api/v1/users/:id/status`

> **Access:** `ADMIN` only  
> Update user status (activate/suspend/deactivate).

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
```json
{
  "status": "SUSPENDED"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | ✅ | One of: `ACTIVE`, `SUSPENDED`, `INACTIVE` |

### Response `200 OK`
```json
{
  "success": true,
  "message": "User status updated to SUSPENDED successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000050",
    "name": "Updated Name",
    "status": "SUSPENDED",
    "updated_at": "2026-03-05T19:05:00.000Z"
  }
}
```

---

## 8. DELETE `/api/v1/users/:id`

> **Access:** `ADMIN` only  
> Delete a user (soft-delete).

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body
None

### Response `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000050"
  }
}
```
