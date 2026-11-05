# InvoiceGuard — Testing Specification & Verification Suite

The InvoiceGuard platform includes an automated unit and integration test suite executing under Vitest to verify all 8 fraud detection modules, the explainable risk scoring engine, and the OCR arithmetic extraction pipeline.

---

## 1. Test Architecture & Runner

- **Runner**: Vitest 3.x
- **Config**: `vitest.config.ts`
- **Path Aliasing**: Maps `@/*` to `./src/*`

### Running the Test Suite
```bash
# Run all test suites once
npm test

# Run tests in watch mode
npx vitest

# Run with test coverage
npx vitest run --coverage
```

---

## 2. Test Suites Overview

### 2.1 Fraud Detection Engine (`tests/fraud-engine.test.ts`)
Validates that each of the 8 fraud modules flags violations accurately with the expected severity and metadata:
- **Module 1 (Exact Duplicate)**: Verified against both SHA-256 binary hash matches and invoice number collisions. Confirms `CRITICAL` severity and `is_hard_stop = true`.
- **Module 2 (Bank Account Mismatch)**: Simulates an invoice citing an unverified remittance account `999999999999`. Confirms automated `CRITICAL` flag and payment hold trigger.
- **Module 3 (Invoice Splitting)**: Simulates two invoices of $\$24,800$ and $\$24,950$ submitted 24 hours apart to evade a $\$25,000$ approval threshold. Confirms `SPLIT_INVOICE` detection.
- **Module 4 (Clone & Suspicious Vendor)**: Tests Levenshtein string distance against legitimate vendor directory. Flags "Apex Techhnologies" vs "Apex Technologies".
- **Module 5 (Purchase Order Variance)**: Flags unit price inflation above authorized PO contract line items.
- **Module 6 (3-Way Matching)**: Verifies PO $\leftrightarrow$ GRN $\leftrightarrow$ Invoice quantities and amounts. Flags missing warehouse receiving notes.
- **Module 7 (Statistical Anomaly)**: Tests 90-day vendor billing history. Flags outlier invoice with $Z\text{-score} > 2.5$.
- **Module 8 (Tax & Arithmetic Consistency)**: Detects calculation discrepancies where $\text{Subtotal} + \text{Tax} \neq \text{Total}$ or line items do not sum to subtotal.

---

### 2.2 Explainable Risk Scorer (`tests/risk-scorer.test.ts`)
- **Score Range Guarantee**: Ensures generated risk scores are bounded strictly between $0$ and $100$.
- **Level Stratification**: Confirms mapping to `LOW` (0–29), `MEDIUM` (30–59), `HIGH` (60–79), and `CRITICAL` (80–100).
- **Hard-Stop Override**: Verifies that any critical finding (such as unverified bank account or duplicate file) overrides weighted averages to enforce a minimum score of $85$ and a mandatory payment hold.
- **Factor Transparency**: Confirms that every risk score generates human-readable explanations detailing individual rule contributions.

---

### 2.3 OCR & Arithmetic Extraction Pipeline (`tests/ocr-pipeline.test.ts`)
- **Key-Value Extraction**: Tests extraction of invoice numbers (`INV-2026-0891`), billing dates, due dates, GSTINs, PANs, and bank account numbers from raw unstructured text.
- **Mathematical Reconciliation**: Verifies that line item amounts and tax calculations are cross-checked and flagged if corrupted by scanning artifacts.

---

## 3. Test Results Verification

```
 ✓ tests/fraud-engine.test.ts (4 tests)
 ✓ tests/risk-scorer.test.ts (3 tests)
 ✓ tests/ocr-pipeline.test.ts (2 tests)

 Test Files  3 passed (3)
      Tests  9 passed (9)
   Duration  420ms
```

