# Portfolio Feedback Module API

Source: `src/docs/paths/portfolio-feedback.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, PUBLIC
- Roles with read access: ADMIN, CLIENT, GM, PUBLIC
- Roles with change access: ADMIN, CLIENT

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/portfolio-feedback` -> CLIENT
2. `PATCH /api/v1/portfolio-feedback/{id}/visibility` -> ADMIN

## Routes

### 1. GET /api/v1/portfolio-feedback
- Summary: Get all portfolio feedback (Admin view)
- Operation ID: `N/A`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of feedbacks (application/json => array<#/components/schemas/PortfolioFeedback>)

### 2. POST /api/v1/portfolio-feedback
- Summary: Submit/Update portfolio feedback (Client view)
- Operation ID: `N/A`
- Access Roles: CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/PortfolioFeedbackInput
- Responses:
- `200`: Feedback submitted (application/json => #/components/schemas/PortfolioFeedbackPublic)

### 3. GET /api/v1/portfolio-feedback/my-feedback
- Summary: Get own portfolio feedback (Client view)
- Operation ID: `N/A`
- Access Roles: CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Client feedback (application/json => #/components/schemas/PortfolioFeedbackPublic)

### 4. GET /api/v1/portfolio-feedback/public
- Summary: Get visible portfolio feedback (Public view)
- Operation ID: `N/A`
- Access Roles: PUBLIC
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of visible feedbacks (application/json => array<#/components/schemas/PortfolioFeedbackPublic>)

### 5. PATCH /api/v1/portfolio-feedback/{id}/visibility
- Summary: Toggle feedback visibility (Admin Only)
- Operation ID: `N/A`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/PortfolioFeedbackVisibilityInput
- Responses:
- `200`: Visibility updated (application/json => #/components/schemas/PortfolioFeedback)
