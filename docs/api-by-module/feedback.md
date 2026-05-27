# Feedback Module API

Source: `src/docs/paths/feedback.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM
- Roles with read access: ADMIN, CLIENT, GM
- Roles with change access: CLIENT

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/customer-feedback` -> CLIENT

## Routes

### 1. GET /api/v1/customer-feedback
- Summary: Get all feedback
- Operation ID: `getAllFeedback`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: List of feedback (application/json => object)
- `403`: Forbidden

### 2. POST /api/v1/customer-feedback
- Summary: Submit feedback
- Operation ID: `submitFeedback`
- Access Roles: CLIENT
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `201`: Feedback submitted
- `403`: Forbidden

### 3. GET /api/v1/customer-feedback/{id}
- Summary: Get feedback detail
- Operation ID: `getFeedbackById`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Feedback detail (application/json => #/components/schemas/CustomerFeedbackResponse)
- `404`: Not found

### 4. GET /api/v1/customer-feedback/job/{jobId}
- Summary: Get feedback for job
- Operation ID: `getFeedbackForJob`
- Access Roles: ADMIN, GM, CLIENT
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Job feedback
- `403`: Forbidden
