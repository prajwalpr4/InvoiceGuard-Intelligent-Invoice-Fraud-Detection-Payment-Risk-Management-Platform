# InvoiceGuard — System Architecture & Design Specification

## 1. High-Level System Architecture

InvoiceGuard is structured as an enterprise-grade financial risk platform built with the Next.js App Router (React Server Components + Client Boundary architecture) and Supabase (PostgreSQL with Row Level Security).

```
                      +------------------------------------------+
                      |         Enterprise Web Clients           |
                      |  (Desktop, Tablet, Mobile Responsive UI)  |
                      +--------------------+---------------------+
                                           |
                                     HTTPS / TLS
                                           |
                                           v
                      +------------------------------------------+
                      |           Next.js 16 Edge / Node         |
                      |  - App Router (SSR & Client Components)  |
                      |  - Session Context & RBAC Middleware     |
                      |  - 11 RESTful API Endpoints (/api/*)     |
                      +--------------------+---------------------+
                                           |
                        +------------------+------------------+
                        |                                     |
                        v                                     v
          +---------------------------+         +---------------------------+
          | Fraud & Risk Engine       |         | OCR Extraction Pipeline   |
          | - 8 Detection Modules     |         | - Tesseract.js OCR        |
          | - Explainable Risk Scorer |         | - Regex Parser & Key-Val  |
          | - Hard-Stop Overrides     |         | - Arithmetic Reconciliation|
          +-------------+-------------+         +-------------+-------------+
                        |                                     |
                        +------------------+------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |            Data Access Layer             |
                      |  - Repository Pattern (Data Service)     |
                      |  - Supabase SSR Client & Server SDK      |
                      |  - Local In-Memory Fallback Repository   |
                      +--------------------+---------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |       Supabase PostgreSQL Database       |
                      |  - 28 Relational Entities & Enums        |
                      |  - Strict Row Level Security (RLS)       |
                      |  - Triggers & Audit Trail Logging        |
                      +------------------------------------------+
```

---

## 2. Fraud Detection Engine (8 Modules)

The fraud engine (`src/lib/fraud/detector.ts`) evaluates every invoice submission through 8 independent detection modules:

### Module 1: Exact Duplicate Detection (`EXACT_DUPLICATE`)
- **Mechanism**:
  - Computes SHA-256 binary checksums of uploaded invoice documents and queries existing records.
  - Matches normalized invoice numbers against the same `vendor_id`.
  - Flags collisions where `vendor_id`, `total_amount`, and `invoice_date` match an existing approved or paid record.
- **Risk Severity**: `CRITICAL` (Hard Stop: Immediate Payment Hold).

### Module 2: Bank Account Mismatch (`BANK_MISMATCH`)
- **Mechanism**:
  - Compares extracted remittance bank account number and routing code (IFSC/SWIFT) against verified `vendor_bank_accounts` in the master record.
  - Detects if an account change request was approved without secondary verification or if a recent change occurred within 14 days.
- **Risk Severity**: `CRITICAL` (Hard Stop: Automatic Hold pending Maker-Checker review).

### Module 3: Invoice Splitting & Circumvention (`SPLIT_INVOICE`)
- **Mechanism**:
  - Evaluates recent submissions for the same vendor within a 72-hour window.
  - Detects if multiple sub-threshold amounts (e.g. $\$24,800$, $\$24,950$ where threshold is $\$25,000$) aggregate to exceed approval boundaries.
- **Risk Severity**: `HIGH`.

### Module 4: Suspicious & Clone Vendor Identification (`SUSPICIOUS_VENDOR`)
- **Mechanism**:
  - Levenshtein distance matching against verified vendor directory (identifies typosquatting like "Apex Techhnologies").
  - Identifies newly onboarded vendors ($< 30$ days old) with sudden high-value submissions.
  - Flags vendor reactivation spikes following $> 180$ days of inactivity.
  - Inspects email domains against free/disposable provider blacklists.
- **Risk Severity**: `HIGH` or `CRITICAL`.

### Module 5: Purchase Order Variance (`PO_VARIANCE`)
- **Mechanism**:
  - Matches invoice against linked Purchase Order line-by-line.
  - Flags unit price inflation above negotiated contract price ($> 2\%$).
  - Detects quantity over-billing ($> 5\%$).
  - Prevents cumulative billing from exceeding authorized PO unbilled commitments.
- **Risk Severity**: `MEDIUM` to `HIGH`.

### Module 6: 3-Way Matching (`THREE_WAY_MATCH`)
- **Mechanism**:
  - Reconciles 3 procurement artifacts: **Purchase Order** $\leftrightarrow$ **Goods Receipt Note (GRN)** $\leftrightarrow$ **Vendor Invoice**.
  - Confirms physical receipt in warehouse prior to invoice approval.
  - Flags invoices billed without corresponding GRN inspection approvals.
- **Risk Severity**: `HIGH`.

### Module 7: Statistical Outlier & Anomaly Detection (`STATISTICAL_ANOMALY`)
- **Mechanism**:
  - Pulls 90-day invoice amount history for the specific vendor.
  - Calculates mean $\mu$ and standard deviation $\sigma$.
  - Flags invoices where Z-Score $Z = \frac{x - \mu}{\sigma} > 2.5$.
- **Risk Severity**: `MEDIUM` to `HIGH`.

### Module 8: Tax & Arithmetic Consistency (`TAX_CALCULATION`)
- **Mechanism**:
  - Validates line items: $\sum (\text{Qty} \times \text{Unit Price}) = \text{Subtotal}$.
  - Validates tax arithmetic: $\text{Subtotal} + \text{Tax} = \text{Total}$.
  - Verifies GSTIN format (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`) and PAN checksums.
- **Risk Severity**: `MEDIUM`.

---

## 3. Explainable Risk Scoring Engine

Implemented in `src/lib/fraud/risk-scorer.ts`, the scoring algorithm calculates an aggregate score between `0` and `100`:

$$\text{Final Score} = \min(100, \sum_{i=1}^{8} W_i \times S_i)$$

Where:
- $W_i$: Category rule weight configured in organizational policies (normalized to sum to 1.0).
- $S_i$: Rule severity contribution ($0, 25, 60, 85, 100$).
- **Hard-Stop Override**: If any finding carries `is_hard_stop = true` (such as unverified bank account or confirmed duplicate binary hash), `Final Score = \max(\text{Calculated}, 85)` and status automatically enters `NEEDS_REVIEW` with payment held.

### Score Classifications
- `LOW` (0–29): Eligible for automated straight-through processing if matched against PO/GRN.
- `MEDIUM` (30–59): Standard management review queue.
- `HIGH` (60–79): Senior Manager / Controller mandatory approval.
- `CRITICAL` (80–100): Immediate payment hold, Chief Audit Executive / CFO notification.

---

## 4. Multi-Tier Approval Governance Matrix

Configured in `src/app/(protected)/app/approvals` and enforced on the server:

| Tier | Spend Ceiling | Authorized Roles | Required Conditions |
|---|---|---|---|
| **Tier 1** | $\le \$25,000$ | Finance Staff / Approver | Risk Score $< 60$, Segregation of Duties satisfied |
| **Tier 2** | $\le \$100,000$ | Senior Approver / Manager | Risk Score $< 80$, 3-Way Match verified |
| **Tier 3** | $> \$100,000$ | Executive / Admin / Director | Executive dual-signoff, no active fraud flags |

### Segregation of Duties Rule
Any user who uploaded or created an invoice record is strictly barred from approving that invoice (`submitter_id !== approver_id`). If an approver attempts to authorize an invoice they submitted, the system rejects the transaction with a `403 Forbidden` error.

---

## 5. Maker-Checker Master Vendor Banking

To eliminate Business Email Compromise (BEC) and unauthorized vendor account manipulation:
1. **Maker Phase**: Finance Staff submits a bank account update request (`vendor_bank_change_requests`).
2. **Quarantine**: The change request is placed in `PENDING` status. Any active invoice for that vendor is marked with a payment hold.
3. **Checker Phase**: A separate Approver or Admin conducts out-of-band callback verification and confirms the change.
4. **Activation**: The new bank account is marked `is_primary = true`, and previous accounts are archived.

