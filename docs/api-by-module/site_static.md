# Site Static Module API

Source: `src/docs/paths/site_static.yaml`

## Access Summary
- Roles with any access: ADMIN, PUBLIC
- Roles with read access: ADMIN, PUBLIC
- Roles with change access: ADMIN, PUBLIC

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/website/static-content/admin` -> ADMIN
2. `PUT /api/v1/website/static-content/admin/{key}` -> ADMIN
3. `POST /api/v1/website/newsletter/subscribe` -> PUBLIC
4. `POST /api/v1/website/newsletter/unsubscribe` -> PUBLIC
5. `POST /api/v1/website/newsletter/unsubscribe-one-click` -> PUBLIC
6. `POST /api/v1/website/newsletter/send` -> ADMIN

## Routes

### 1. GET /api/v1/website/static-content/faq
- Summary: Get FAQ content
- Operation ID: `getFaqContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: FAQ content details (application/json => object)

### 2. GET /api/v1/website/static-content/news
- Summary: Get news articles
- Operation ID: `getNewsContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of news articles (application/json => object)

### 3. GET /api/v1/website/static-content/privacy
- Summary: Get privacy policy content
- Operation ID: `getPrivacyContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Privacy policy content details (application/json => object)

### 4. GET /api/v1/website/static-content/terms-compliance
- Summary: Get terms & compliance content
- Operation ID: `getTermsContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Terms & compliance content details (application/json => object)

### 5. GET /api/v1/website/static-content/terms-and-conditions
- Summary: Get terms & conditions content (alias)
- Operation ID: `getTermsAliasContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Terms & conditions content details (application/json => object)

### 6. GET /api/v1/website/static-content/about-us
- Summary: Get about-us content
- Operation ID: `getAboutUsContent`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: About-us content details (application/json => object)

### 7. POST /api/v1/website/static-content/admin
- Summary: Create static content (Admin Only)
- Operation ID: `createStaticContentRow`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Created successfully

### 8. PUT /api/v1/website/static-content/admin/{key}
- Summary: Update static content (Admin Only)
- Operation ID: `updateStaticContentRow`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `key` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Updated successfully

### 9. POST /api/v1/website/newsletter/subscribe
- Summary: Subscribe to newsletter
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Subscribed successfully

### 10. GET /api/v1/website/newsletter/subscribers
- Summary: List Newsletter Subscribers (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Subscriber list

### 11. POST /api/v1/website/newsletter/unsubscribe
- Summary: Unsubscribe from newsletter
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Unsubscribed successfully

### 12. GET /api/v1/website/newsletter/unsubscribe-one-click
- Summary: RFC 8058 GET one-click unsubscribe
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- `token` (query, required, string)
- Request Body:
- None
- Responses:
- `200`: HTML response indicating success or failure of unsubscribe (text/html => string)

### 13. POST /api/v1/website/newsletter/unsubscribe-one-click
- Summary: RFC 8058 POST one-click unsubscribe (Gmail)
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `token` (query, optional, string)
- Request Body:
- `application/json`: object
- Responses:
- `204`: Unsubscribed successfully (No content)
- `400`: Invalid token

### 14. POST /api/v1/website/newsletter/send
- Summary: Broadcast newsletter to subscribers (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Broadcast sent successfully
