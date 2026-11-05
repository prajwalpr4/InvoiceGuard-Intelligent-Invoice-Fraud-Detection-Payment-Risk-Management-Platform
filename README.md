# InvoiceGuard — Intelligent Invoice Fraud Detection & Payment Risk Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Vitest-9%20passed-brightgreen.svg)](https://vitest.dev/)

**InvoiceGuard** is an enterprise-grade intelligent invoice fraud detection and payment risk management SaaS platform. It helps organizations detect fraudulent vendor invoices, enforce multi-tier approval governance, perform automated purchase order matching (2-way and 3-way with Goods Receipts), track master bank account changes with maker-checker security, and maintain an immutable financial audit trail.

---

## 🌟 Key Capabilities

1. **8 Independent Fraud Detection Modules**:
   - **Exact Duplicate Detection**: SHA-256 binary hash matching, normalized invoice number deduplication, and amount/vendor/date collisions.
   - **Bank Account Mismatch (Hard-Stop)**: Validates invoice remittance details against verified Master Vendor Records. Automatically triggers an immediate payment hold when unknown bank coordinates are detected.
   - **Invoice Splitting & Threshold Circumvention**: Flags clusters of sub-threshold invoices submitted within 48–72 hours designed to bypass manager approval ceilings.
   - **Suspicious & Clone Vendor Identification**: Detects Levenshtein fuzzy string similarity, newly created vendor records (< 30 days), inactive reactivation spikes, and high-risk domain anomalies.
   - **Purchase Order Variance**: Computes unit price discrepancies, quantity variances, and unbilled balance overruns against authorized purchase orders.
   - **3-Way Matching**: Cross-reconciles Purchase Order commitments, Goods Receipt Notes (GRN warehouse receipts), and Vendor Invoices with tolerance thresholds.
   - **Statistical Outlier & Anomaly Detection**: Calculates Z-scores across 90-day vendor billing histories to catch unusual volume or billing deviations.
   - **Tax & Arithmetic Consistency**: Reconciles subtotal + tax = total, validates GSTIN/PAN checksums, and flags mathematical rounding discrepancies.

2. **Explainable Risk Scoring Engine**:
   - Scores every invoice from `0` to `100` (`LOW`: 0–29, `MEDIUM`: 30–59, `HIGH`: 60–79, `CRITICAL`: 80–100).
   - Generates transparent, factor-by-factor risk breakdowns with financial exposure impact.
   - Enforces automatic hard-stop overrides whenever critical fraud flags (e.g. unverified bank accounts or confirmed duplicate hashes) are raised.

3. **Enterprise Governance & Segregation of Duties**:
   - Multi-tier approval thresholds (Tier 1: $\le \$25,000$, Tier 2: $\le \$100,000$, Tier 3: $> \$100,000$).
   - Strict segregation of duties: Invoice submitters cannot approve their own invoices; maker-checker controls for vendor bank account updates.
   - Multi-role authorization: **Admin**, **Finance Staff**, **Approver / Finance Manager**, and **Auditor**.

4. **OCR Extraction Pipeline**:
   - Client-assisted and server-side OCR text extraction using Tesseract.js.
   - Regex-driven key-value extraction for Invoice #, Date, Due Date, Amounts, GSTIN, PAN, Bank Account, and IFSC/SWIFT.
   - Line item table extraction with arithmetic reconciliation and confidence scoring.

5. **Disbursement & Payment Tracking**:
   - Payment status tracking (`UNPAID`, `SCHEDULED`, `PROCESSING`, `PAID`, `FAILED`, `CANCELLED`).
   - Duplicate disbursement prevention preventing re-issuance of paid or processing invoices.
   - Exportable payment batches and reconciliation summaries.

6. **Full Financial Audit History**:
   - Tamper-evident, append-only audit trail capturing user IP, user agent, actor details, entity changes, and timestamps.
   - CSV export capability for compliance and internal control reviews.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.4.5 (App Router, Server Components & Server Actions) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling & Design System** | Tailwind CSS v4, Google Poppins Typography, `@base-ui/react` / shadcn/ui |
| **Icons & Charts** | Lucide React, Recharts |
| **Forms & Validation** | React Hook Form, Zod |
| **OCR Pipeline** | Tesseract.js |
| **Database & Auth** | Supabase (PostgreSQL 15+, Row Level Security, SSR Session Engine) |
| **Testing** | Vitest (Unit & Integration tests) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `20.x` or later (tested on Node.js `24.x`)
- npm `10.x` or later

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/invoiceguard.git
cd invoiceguard
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials (or leave defaults for local demo session mode):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup (Supabase)
Run the migration scripts in your Supabase SQL editor:
1. `supabase/migrations/001_initial_schema.sql` (Creates 28 relational tables, enums, triggers, RLS policies, and indexes).
2. `supabase/migrations/002_default_rules_and_seed.sql` (Inserts default fraud detection rules and approval policies).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Production Build
```bash
npm run build
npm start
```

### 6. Run Test Suite
```bash
npm test
```

---

## 👥 Demo Role Switcher

For evaluation and demonstration purposes, InvoiceGuard includes a built-in session switcher in both the `/login` page and the top navigation bar:

| Role | Name | Email | Permissions |
|---|---|---|---|
| **Admin** | Sarah Jenkins | `admin@invoiceguard.com` | Full administrative control, user invitations, rule weights, system settings. |
| **Finance Staff** | Alex Rivera | `finance@invoiceguard.com` | Invoice upload, vendor onboarding, bank change requests, payment recording. Cannot approve own submissions. |
| **Approver** | Marcus Vance | `approver@invoiceguard.com` | Invoice review, fraud investigation, tier-based approvals, maker-checker bank verifications. |
| **Auditor** | Elena Rostova | `auditor@invoiceguard.com` | Read-only compliance access to all invoices, fraud findings, payment ledgers, and audit logs. |

---

## 📁 Repository Structure

```
invoiceguard/
├── src/
│   ├── app/
│   │   ├── (protected)/app/        # Authenticated enterprise application shell
│   │   │   ├── dashboard/          # Financial risk dashboard with Recharts KPIs
│   │   │   ├── invoices/           # Invoices directory, upload & deep-dive inspector
│   │   │   ├── vendors/            # Master vendor directory & bank maker-checker
│   │   │   ├── purchase-orders/    # PO commitment tracking & line items
│   │   │   ├── goods-receipts/     # Warehouse GRN receipt validation
│   │   │   ├── fraud-detection/    # Active fraud alert radar (8 modules)
│   │   │   ├── review-queue/       # Prioritized investigator queue & decision actions
│   │   │   ├── approvals/          # Multi-tier governance matrix & approval logs
│   │   │   ├── payments/           # Disbursement ledger & duplicate prevention
│   │   │   ├── analytics/          # Departmental risk & discrepancy analytics
│   │   │   ├── notifications/      # Real-time alert notifications
│   │   │   ├── audit-logs/         # Append-only immutable compliance log
│   │   │   ├── users/              # RBAC user directory & invitations
│   │   │   ├── fraud-rules/        # Dynamic rule weights & toggle configuration
│   │   │   └── settings/           # Organization profile & ERP integration setup
│   │   ├── api/                    # 11 REST API endpoints
│   │   ├── login/ & signup/        # Enterprise authentication pages
│   │   ├── pending-access/         # Self-signup security quarantine page
│   │   ├── privacy/ & terms/       # Public compliance pages
│   │   ├── contact/                # Enterprise support inquiry form
│   │   └── page.tsx                # Public marketing landing page
│   ├── components/                 # Reusable UI components & layouts
│   ├── lib/
│   │   ├── auth/                   # Session engine & RBAC middleware
│   │   ├── data/                   # Data repository & enterprise demo dataset
│   │   ├── fraud/                  # 8 fraud detection modules & risk scorer
│   │   ├── ocr/                    # OCR extraction & arithmetic pipeline
│   │   └── supabase/               # Supabase SSR client, server & admin bindings
│   └── types/                      # Comprehensive TypeScript database models
├── supabase/
│   └── migrations/                 # PostgreSQL schema & rule seed scripts
├── tests/                          # Vitest unit test suites
└── docs/                           # In-depth architectural & API specifications
```

---

## 🔒 Security & Compliance

- **Zero Client Secrets**: Supabase service keys and cryptographic secrets are strictly confined to server-side environments.
- **Segregation of Duties**: Enforced at both the API layer and the UI layer to prevent unauthorized self-approvals.
- **Maker-Checker Banking**: Changes to vendor disbursement accounts require dual authorization and trigger automated payment holds.
- **Audit Logging**: Every state transition, approval, rejection, and payment records an immutable audit trail with actor metadata.

---

## 📄 License

Licensed under the Enterprise Commercial License. © 2026 InvoiceGuard Inc. All rights reserved.
#   I n v o i c e G u a r d - I n t e l l i g e n t - I n v o i c e - F r a u d - D e t e c t i o n - P a y m e n t - R i s k - M a n a g e m e n t - P l a t f o r m  
 