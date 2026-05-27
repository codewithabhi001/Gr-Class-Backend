# Payments Module API

Source: `src/docs/paths/payments.yaml`

## Access Summary
- Roles with any access: ADMIN, CLIENT, GM, TM, TO
- Roles with read access: ADMIN, CLIENT, GM, TM, TO
- Roles with change access: ADMIN, GM, TM, TO

## Role Action Matrix (Change Endpoints)
1. `POST /api/v1/payments/invoice` -> ADMIN, GM, TM, TO
2. `PUT /api/v1/payments/{id}/pay` -> ADMIN, GM, TM, TO
3. `POST /api/v1/payments/{id}/refund` -> ADMIN, GM
4. `POST /api/v1/payments/{id}/partial` -> ADMIN, GM, TM, TO
5. `POST /api/v1/payments/writeoff` -> ADMIN

## Routes

### 1. GET /api/v1/payments
- Summary: List payments
- Operation ID: `getPayments`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `page` (query, optional, integer)
- `limit` (query, optional, integer)
- Request Body:
- None
- Responses:
- `200`: List of payments (application/json => object)
- `401`: Unauthorized (application/json => #/components/schemas/ErrorResponse)

### 2. GET /api/v1/payments/summary
- Summary: Financial summary
- Operation ID: `getFinancialSummary`
- Access Roles: CLIENT, ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- None
- Request Body:
- None
- Responses:
- `200`: Financial summary (application/json => object)

### 3. POST /api/v1/payments/invoice
- Summary: Create invoice
- Operation ID: `createInvoice`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: #/components/schemas/CreateInvoiceRequest
- Responses:
- `201`: Invoice created (application/json => object)
- `400`: Validation error (application/json => #/components/schemas/ErrorResponse)

### 4. GET /api/v1/payments/job/{jobId}
- Summary: Get payment by job ID
- Operation ID: `getPaymentByJobId`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `jobId` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Payment details (application/json => object)
- `404`: Payment not found for this job (application/json => #/components/schemas/ErrorResponse)

### 5. GET /api/v1/payments/{id}
- Summary: Get payment by ID
- Operation ID: `getPaymentById`
- Access Roles: CLIENT, ADMIN, GM, TM, TO
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Payment details (application/json => object)
- `404`: Payment not found (application/json => #/components/schemas/ErrorResponse)

### 6. PUT /api/v1/payments/{id}/pay
- Summary: Mark invoice as paid
- Operation ID: `markPaymentPaid`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `multipart/form-data`: object
- `application/json`: object
- Responses:
- `200`: Payment marked as paid (application/json => object)

### 7. POST /api/v1/payments/{id}/refund
- Summary: Process refund
- Operation ID: `refundPayment`
- Access Roles: ADMIN, GM
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: object
- Responses:
- `200`: Refund processed (application/json => object)

### 8. POST /api/v1/payments/{id}/partial
- Summary: Record payment (advance / partial)
- Operation ID: `recordPartialPayment`
- Access Roles: ADMIN, GM, TM, TO
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- `application/json`: #/components/schemas/PartialPaymentRequest
- Responses:
- `200`: Partial payment recorded (application/json => object)

### 9. GET /api/v1/payments/{id}/ledger
- Summary: Get payment ledger
- Operation ID: `getPaymentLedger`
- Access Roles: ADMIN, GM
- Action Type: READ (view only)
- Path/Query/Header Params:
- `id` (path, required, string)
- Request Body:
- None
- Responses:
- `200`: Ledger entries (application/json => object)

### 10. POST /api/v1/payments/writeoff
- Summary: Write off payment
- Operation ID: `writeOffPayment`
- Access Roles: ADMIN
- Action Type: CHANGE (can modify state)
- Path/Query/Header Params:
- None
- Request Body:
- `application/json`: object
- Responses:
- `200`: Payment written off
