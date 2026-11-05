# InvoiceGuard — RESTful API Specification

The InvoiceGuard API provides secure, role-governed endpoints for managing invoices, executing fraud checks, conducting Maker-Checker bank operations, orchestrating approval workflows, and retrieving audit logs.

All endpoints adhere to REST conventions, accept and return JSON, and enforce tenant organization isolation and role-based permissions.

---

## 1. Authentication & Headers

Protected API routes authenticate the requesting user through Supabase session cookies or bearer tokens.

```http
Authorization: Bearer <session_token>
Content-Type: application/json
```

### Response Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid session token.
- `403 Forbidden`: Insufficient role permissions or Segregation of Duties violation.
- `404 Not Found`: Target entity not found in authenticated organization.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Invoices API

### `GET /api/invoices`
Returns a paginated list of invoices with optional filtering.

**Query Parameters:**
- `status` *(optional)*: Filter by status (`DRAFT`, `PENDING_SCAN`, `NEEDS_REVIEW`, `APPROVED`, `REJECTED`, `PAID`, `ON_HOLD`).
- `risk` *(optional)*: Filter by risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `vendorId` *(optional)*: Filter by vendor UUID.
- `search` *(optional)*: Search term matching invoice number or vendor name.

**Response `200 OK`:**
```json
{
  "invoices": [
    {
      "id": "inv_001",
      "invoice_number": "INV-2026-0891",
      "vendor_id": "v_001",
      "vendor_name": "Apex Global Technologies Pvt Ltd",
      "total_amount": 14500.00,
      "currency": "USD",
      "invoice_date": "2026-11-01",
      "due_date": "2026-11-30",
      "status": "APPROVED",
      "risk_score": 12,
      "risk_level": "LOW",
      "created_at": "2026-11-01T10:14:00Z"
    }
  ],
  "total": 1
}
```

---

### `POST /api/invoices`
Submits an invoice for automated OCR extraction, 8-module fraud detection, and risk scoring.

**Request Body:**
```json
{
  "vendor_id": "v_001",
  "invoice_number": "INV-2026-0944",
  "invoice_date": "2026-11-04",
  "due_date": "2026-12-04",
  "currency": "USD",
  "subtotal": 24500.00,
  "tax_amount": 4410.00,
  "total_amount": 28910.00,
  "purchase_order_id": "po_001",
  "remittance_bank_account": "9876543210123",
  "remittance_routing_code": "HDFC0001234",
  "line_items": [
    {
      "description": "Enterprise Cloud Hosting - Q4",
      "quantity": 1,
      "unit_price": 24500.00,
      "total_price": 24500.00
    }
  ]
}
```

**Response `201 Created`:**
```json
{
  "invoice": {
    "id": "inv_new_99",
    "invoice_number": "INV-2026-0944",
    "status": "NEEDS_REVIEW",
    "risk_score": 75,
    "risk_level": "HIGH",
    "findings_count": 2
  },
  "findings": [
    {
      "rule_type": "PO_VARIANCE",
      "severity": "HIGH",
      "title": "Purchase Order Unit Price Variance",
      "description": "Invoice unit price $24,500.00 exceeds PO authorized unit price $22,000.00 by 11.36%."
    }
  ]
}
```

---

### `GET /api/invoices/[invoiceId]`
Retrieves full invoice details, line items, 8-module findings, explainable risk score breakdown, and linked PO/GRN documents.

---

### `POST /api/invoices/[invoiceId]/actions`
Executes an approval workflow transition (`APPROVE`, `REJECT`, `HOLD`, `ESCALATE`).

**Request Body:**
```json
{
  "action": "APPROVE",
  "notes": "Verified against PO-8812 and warehouse GRN-401. Approved for disbursement."
}
```

**Segregation of Duties Enforcement:**
If the logged-in user is the original submitter:
```json
{
  "error": "Segregation of Duties violation: Submitter cannot approve their own invoice."
}
```
*HTTP Status 403 Forbidden.*

---

## 3. Vendors API

### `GET /api/vendors`
Retrieves verified vendors, risk tiers, and primary bank details.

### `POST /api/vendors`
Onboards a new vendor with validated tax IDs (GSTIN/PAN) and master bank details.

### `POST /api/vendors/[vendorId]/bank-change`
Initiates a Maker-Checker bank account change request. Automatically places related invoices on hold pending secondary verification.

---

## 4. Procurement & Matching API

### `GET /api/purchase-orders`
Returns active purchase orders, commitments, billed totals, and remaining unbilled amounts.

### `GET /api/goods-receipts`
Returns warehouse Goods Receipt Notes (GRNs) for 3-way matching validation.

---

## 5. Payments API

### `GET /api/payments`
Lists payment records, methods, transaction references, and settlement timestamps.

### `POST /api/payments`
Records a payment disbursement. Validates that invoice is in `APPROVED` status and prevents duplicate disbursement.

---

## 6. Audit & Analytics API

### `GET /api/audit-logs`
Returns the append-only compliance log. Supports date range filtering and CSV export.

### `GET /api/dashboard/summary`
Returns aggregated metrics:
- Total invoice volume and gross spend.
- High-risk and flagged invoice counts.
- Pending review counts and potential fraud prevented.

### `GET /api/dashboard/analytics`
Returns time-series volume trends, fraud category distribution, and departmental discrepancy telemetry for Recharts visualizations.

