# Feedback Module API (Actual)

Source YAML: `src/docs/paths/feedback.yaml`

## Routes

### 1. GET /api/v1/customer-feedback
- Summary: Get all feedback
- Operation ID: `getAllFeedback`
- Access Roles: ADMIN, GM
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
- `200`: List of feedback (application/json => object)
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/feedback/feedback.routes.js:13`
- Controller: `src/modules/feedback/feedback.controller.js:17`
- Service: `src/modules/feedback/feedback.service.js` (`feedbackService.getAllFeedback`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. POST /api/v1/customer-feedback
- Summary: Submit feedback
- Operation ID: `submitFeedback`
- Access Roles: CLIENT
- Change Access: CLIENT

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[id, client_id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Feedback submitted
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: feedback }
```

Implementation Trace
- Route file: `src/modules/feedback/feedback.routes.js:10`
- Controller: `src/modules/feedback/feedback.controller.js:3`
- Service: `src/modules/feedback/feedback.service.js:7` (`feedbackService.submitFeedback`)
- Models touched: JobRequest.findByPk, CustomerFeedback.findOne, CustomerFeedback.create
- Service returns (detected): feedback

### 3. GET /api/v1/customer-feedback/job/{jobId}
- Summary: Get feedback for job
- Operation ID: `getFeedbackForJob`
- Access Roles: ADMIN, GM, CLIENT
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `jobId` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[jobId], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Job feedback
- `403`: Forbidden
- Controller response envelope(s):
```js
{ success: true, data: feedback }
```

Implementation Trace
- Route file: `src/modules/feedback/feedback.routes.js:14`
- Controller: `src/modules/feedback/feedback.controller.js:10`
- Service: `src/modules/feedback/feedback.service.js:41` (`feedbackService.getFeedbackForJob`)
- Models touched: CustomerFeedback.findOne
- Service returns (detected): await CustomerFeedback.findOne({
        where: { job_id: jobId },
        include: ['Client'] // Ensure association exists
    })