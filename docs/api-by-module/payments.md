# Payments Module API (Actual)

Source YAML: `src/docs/paths/payments.yaml`

## Routes

### 1. GET /api/v1/payments
- Summary: List payments
- Operation ID: `getPayments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: List of payments (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/payments/payment.routes.js:13`
- Controller: `src/modules/payments/payment.controller.js:17`
- Service: `src/modules/payments/payment.service.js:213` (`paymentService.getPayments`)
- Models touched: N/A
- Service returns (detected): N/A

### 2. GET /api/v1/payments/summary
- Summary: Financial summary
- Operation ID: `getFinancialSummary`
- Access Roles: CLIENT, ADMIN, GM
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
- `200`: Financial summary (application/json => object)
- Controller response envelope(s):
```js
{ success: true, data: result }
```

Implementation Trace
- Route file: `src/modules/payments/payment.routes.js:16`
- Controller: `src/modules/payments/payment.controller.js:41`
- Service: `src/modules/payments/payment.service.js:322` (`paymentService.getFinancialSummary`)
- Models touched: N/A
- Service returns (detected): N/A

### 3. POST /api/v1/payments/invoice
- Summary: Create invoice
- Operation ID: `createInvoice`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: ADMIN, GM, TM, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: #/components/schemas/CreateInvoiceRequest
- Req usage in controller: params=[], query=[], body=[], user=[id], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `201`: Invoice created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: invoice }
```

Implementation Trace
- Route file: `src/modules/payments/payment.routes.js:25`
- Controller: `src/modules/payments/payment.controller.js:49`
- Service: `src/modules/payments/payment.service.js:93` (`paymentService.createInvoice`)
- Models touched: JobRequest.findByPk, Payment.findOne, Payment.create, AuditLog.create
- Service returns (detected): payment

### 4. GET /api/v1/payments/job/{jobId}
- Summary: Get payment by job ID
- Operation ID: `getPaymentByJobId`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
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
- `200`: Payment details (application/json => object)
- `404`: Payment not found for this job (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: payment }
```

Implementation Trace
- Route file: `src/modules/payments/payment.routes.js:19`
- Controller: `src/modules/payments/payment.controller.js:33`
- Service: `src/modules/payments/payment.service.js:295` (`paymentService.getPaymentByJobId`)
- Models touched: N/A
- Service returns (detected): N/A

### 5. GET /api/v1/payments/{id}
- Summary: Get payment by ID
- Operation ID: `getPaymentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[id], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Payment details (application/json => object)
- `404`: Payment not found (application/json => #/components/schemas/ErrorResponse)
- Controller response envelope(s):
```js
{ success: true, data: payment }
```

Implementation Trace
- Route file: `src/modules/payments/payment.routes.js:22`
- Controller: `src/modules/payments/payment.controller.js:25`
- Service: `src/modules/payments/payment.service.js:270` (`paymentService.getPaymentById`)
- Models touched: N/A
- Service returns (detected): N/A

### 6. PUT /api/v1/payments/{id}/pay
- Summary: Mark invoice as paid
- Operation ID: `markPaymentPaid`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: ADMIN, GM, TM, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `multipart/form-data`: object
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Payment marked as paid (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 7. POST /api/v1/payments/{id}/refund
- Summary: Process refund
- Operation ID: `refundPayment`
- Access Roles: ADMIN, GM
- Change Access: ADMIN, GM

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Refund processed (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 8. POST /api/v1/payments/{id}/partial
- Summary: Record payment (advance / partial)
- Operation ID: `recordPartialPayment`
- Access Roles: ADMIN, GM, TM, TO
- Change Access: ADMIN, GM, TM, TO

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- `application/json`: #/components/schemas/PartialPaymentRequest
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Partial payment recorded (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 9. GET /api/v1/payments/{id}/ledger
- Summary: Get payment ledger
- Operation ID: `getPaymentLedger`
- Access Roles: ADMIN, GM
- Change Access: N/A (read endpoint)

Request (Code + Schema)
- Route Params/Query from YAML:
- `id` (path, required, string)
- Request Body from YAML:
- None
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Ledger entries (application/json => object)
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A

### 10. POST /api/v1/payments/writeoff
- Summary: Write off payment
- Operation ID: `writeOffPayment`
- Access Roles: ADMIN
- Change Access: ADMIN

Request (Code + Schema)
- Route Params/Query from YAML:
- None
- Request Body from YAML:
- `application/json`: object
- Req usage in controller: params=[], query=[], body=[], user=[], files=[]
- Validation schema key: `N/A`

Response (Actual)
- YAML response map:
- `200`: Payment written off
- Controller response envelope(s): N/A

Implementation Trace
- Route file: `N/A`
- Controller: `N/A`
- Services: N/A