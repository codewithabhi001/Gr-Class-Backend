# 09 — Payment APIs

**Base URL:** `/api/v1/payments`  
**Auth:** All endpoints require `Authorization: Bearer <accessToken>`

---

## 1. GET `/api/v1/payments`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`  
> List all payments. CLIENT sees only their own vessels' job payments.

### Query Params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | optional | Page number |
| `limit` | number | optional | Items per page |
| `payment_status` | string | optional | `UNPAID`, `PAID`, `ON_HOLD` |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "019514a2-7e3b-7000-8000-000000000400",
        "job_id": "019514a2-7e3b-7000-8000-000000000100",
        "invoice_number": "INV-2026-001",
        "amount": "5000.00",
        "currency": "USD",
        "payment_status": "UNPAID",
        "payment_date": null,
        "receipt_url": null,
        "verified_by_user_id": null,
        "JobRequest": {
          "id": "uuid",
          "reason": "Annual survey",
          "Vessel": { "vessel_name": "MV Star" }
        }
      }
    ],
    "count": 15
  }
}
```

---

## 2. GET `/api/v1/payments/:id`

> **Access:** `CLIENT`, `ADMIN`, `GM`, `TM`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "019514a2-7e3b-7000-8000-000000000400",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "invoice_number": "INV-2026-001",
    "amount": "5000.00",
    "currency": "USD",
    "payment_status": "UNPAID",
    "payment_date": null,
    "receipt_url": null,
    "verified_by_user_id": null,
    "JobRequest": {
      "id": "uuid",
      "reason": "Annual survey",
      "Vessel": { "vessel_name": "MV Star" }
    },
    "verifier": null
  }
}
```

---

## 3. GET `/api/v1/payments/summary`

> **Access:** `CLIENT`, `ADMIN`, `GM`  
> Financial summary / overview.

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "total_invoiced": "150000.00",
    "total_paid": "120000.00",
    "total_outstanding": "30000.00",
    "total_on_hold": "5000.00",
    "count_paid": 24,
    "count_unpaid": 6,
    "count_on_hold": 1
  }
}
```

---

## 4. POST `/api/v1/payments/invoice`

> **Access:** `ADMIN`, `GM`, `TM`  
> Create an invoice for a job.

### Request Body
```json
{
  "job_id": "019514a2-7e3b-7000-8000-000000000100",
  "amount": 5000,
  "currency": "USD",
  "invoice_number": "INV-2026-001"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `job_id` | UUID | ✅ | Must reference existing job |
| `amount` | number | ✅ | Decimal(10,2) |
| `currency` | string | ✅ | e.g. `USD`, `AED` |
| `invoice_number` | string | optional | Auto-generated if not provided |

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_id": "019514a2-7e3b-7000-8000-000000000100",
    "invoice_number": "INV-2026-001",
    "amount": "5000.00",
    "currency": "USD",
    "payment_status": "UNPAID",
    "payment_date": null,
    "receipt_url": null
  }
}
```

---

## 5. PUT `/api/v1/payments/:id/pay`

> **Access:** `ADMIN`, `GM`, `TM`, `TA`  
> Mark a payment as paid. Upload receipt.  
> **Content-Type:** `multipart/form-data`

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Request Body (form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receipt` | file | optional | Payment receipt (PDF/image) |
| `payment_date` | string | optional | ISO date string |

### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "payment_status": "PAID",
    "payment_date": "2026-03-05",
    "receipt_url": "https://storage.girik.com/receipts/receipt-001.pdf",
    "verified_by_user_id": "uuid"
  }
}
```

---

## 6. GET `/api/v1/payments/:id/ledger`

> **Access:** `ADMIN`, `GM`  
> Get payment ledger/audit trail.

### Path Params
| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "action": "INVOICE_CREATED",
      "amount": "5000.00",
      "performed_by": "uuid",
      "timestamp": "2026-03-05T21:00:00.000Z"
    },
    {
      "action": "PARTIAL_PAYMENT",
      "amount": "2000.00",
      "performed_by": "uuid",
      "timestamp": "2026-03-05T22:00:00.000Z"
    }
  ]
}
```

---

## 7. POST `/api/v1/payments/writeoff`

> **Access:** `ADMIN` only  
> Write off a payment.

### Request Body
```json
{
  "paymentId": "019514a2-7e3b-7000-8000-000000000400",
  "reason": "Bad debt — client company dissolved"
}
```

| Field | Type | Required |
|-------|------|----------|
| `paymentId` | UUID | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "id": "uuid", "payment_status": "WRITTEN_OFF" }
}
```

---

## 8. POST `/api/v1/payments/:id/refund`

> **Access:** `ADMIN`, `GM`  
> Process a refund.

### Request Body
```json
{
  "amount": 2000,
  "reason": "Job cancelled after partial payment"
}
```

| Field | Type | Required |
|-------|------|----------|
| `amount` | number | ✅ |
| `reason` | string | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "id": "uuid", "refunded_amount": "2000.00" }
}
```

---

## 9. POST `/api/v1/payments/:id/partial`

> **Access:** `ADMIN`, `GM`, `TM`  
> Record a partial payment.

### Request Body
```json
{
  "amount": 2500
}
```

| Field | Type | Required |
|-------|------|----------|
| `amount` | number | ✅ |

### Response `200 OK`
```json
{
  "success": true,
  "data": { "id": "uuid", "amount_paid": "2500.00", "remaining": "2500.00" }
}
```
