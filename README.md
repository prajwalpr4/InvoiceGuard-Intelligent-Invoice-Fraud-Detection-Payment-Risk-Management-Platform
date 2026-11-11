# InvoiceGuard — Intelligent Invoice Fraud Detection & Payment Risk Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-149eca.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Vitest-18%20passed-brightgreen.svg)](https://vitest.dev/)

**InvoiceGuard** is a full-stack accounts payable (AP) fraud detection, invoice OCR extraction, and payment risk governance platform built with **Next.js App Router**, **TypeScript**, and **Supabase**. It automates invoice digitization across PDFs, images, and text files, evaluates every submission through an **8-module fraud detection engine**, enforces maker-checker segregation of duties, and records an immutable compliance audit trail.

---

## Key Capabilities

### 1. Multi-Tier Hybrid OCR Extraction Pipeline
InvoiceGuard extracts structured invoice metadata (`vendor_name`, `gstin`, `pan`, `invoice_number`, `invoice_date`, `due_date`, `po_number`, `subtotal`, `tax_amount`, `cgst`, `sgst`, `igst`, `total_amount`, `bank_account_number`, `ifsc_code`, `bank_name`) along with raw transcribed text, per-field confidence scores, and a full fallback audit trace (`_meta.attempts`).

```text
Uploaded Invoice (.pdf / .png / .jpg / .webp / .txt / .csv)
   │
   ▼
Tier 1 — Primary: Gemini API (`gemini-2.5-flash` -> `gemini-2.5-flash-lite`)
   │  • Processes native multi-page PDFs, images, and text directly
   │
   ├─(rate limit / error / unconfigured)──► Tier 2a: Mistral OCR (`mistral-ocr-latest`)
   │                                           • Native PDF & image OCR with JSON schema annotation
   │                                           • Retries without schema on 400/422 and parses markdown
   │
   ├─(scanned PDF w/o text layer)──────────► Client PDF Page Renderer (`pdfjs-dist`, max 3 JPEG pages)
   │
   ├─► Tier 2b: OpenRouter Free (`qwen/qwen3.8-27b:free` -> `openrouter/free`)
   │     • Processes up to 3 rendered/uploaded images or extracted markdown/text
   │
   ├─► Tier 3: Groq API
   │     • Vision (max 3 images): `qwen/qwen3.8-27b` -> `meta-llama/llama-4-scout-17b-16e-instruct`
   │     • Text: `llama-3.3-70b-versatile`
   │
   └─► Tier 4: Guaranteed Local Fallback
         • Digital PDF text / plain text -> deterministic regex parser (`OCRExtractionPipeline`)
         • Scanned image / PDF -> browser `tesseract.js` + regex parser
   │
   ▼
Form Auto-Fill -> Human Verification -> Persist to Supabase (`invoices`, `invoice_files`, `invoice_extractions`)
```

- **Graceful Key Skipping:** Any cloud OCR key omitted from `.env.local` is cleanly marked `skipped` in `_meta.attempts` without failing extraction.
- **Arithmetic & Tax Reconciliation:** Automatically reconciles missing `subtotal`, `tax_amount`, or `total_amount` components and validates CGST/SGST/IGST math.
- **UI Traceability:** Both [`/app/invoices/new`](src/app/(protected)/app/invoices/new/new-invoice-client.tsx) and the **OCR Extraction** tab on [`/app/invoices/[invoiceId]`](src/app/(protected)/app/invoices/[invoiceId]/invoice-detail-client.tsx) surface extraction confidence, active engine/model, raw OCR text, and attempt history.

---

### 2. 8 Independent Fraud Detection Modules
Implemented in [`FraudDetectionEngine`](src/lib/fraud/detector.ts) (`runAllChecks`) and scored by [`RiskScoringEngine`](src/lib/fraud/risk-scorer.ts):

| # | Module (`FraudDetectionEngine`) | Category Key | Base Weight | Detection Scope |
|---|---|---|---|---|
| 1 | `checkDuplicates` | `duplicate` | `40` | Same vendor + invoice #, SHA-256 duplicate files, settled invoice resubmissions, and same-vendor/date/amount collisions |
| 2 | `checkBankMismatch` | `bank_account` | `35` | Hard-stop comparison against verified Master Vendor bank accounts & IFSC codes |
| 3 | `checkInvoiceSplitting` | `splitting` | `20` | Clusters of sub-threshold invoices submitted within short windows to bypass approval ceilings |
| 4 | `checkSuspiciousVendor` | `vendor` | `15` | Fuzzy name clones (Levenshtein distance), new vendor anomalies, and email/domain checks |
| 5 | `checkPurchaseOrder` | `purchase_order` | `15` | PO authorization balance checks, missing POs, and unit/commitment overruns |
| 6 | `checkThreeWayMatch` | `three_way_match` | `20` | Reconciles Purchase Orders, Warehouse Goods Receipt Notes (GRNs), and invoiced totals |
| 7 | `checkAmountAnomaly` | `unusual_amount` | `15` | Historical vendor baseline & statistical outlier checks |
| 8 | `checkTaxValidation` | `tax_validation` | `10` | Arithmetic reconciliation (`subtotal + tax = total`), GSTIN/PAN validation |

---

### 3. Explainable Risk Scoring Engine
- Produces a `0–100` normalized score in [`RiskScoringEngine.calculateRisk`](src/lib/fraud/risk-scorer.ts):
  - **`low`**: `0–29`
  - **`medium`**: `30–59`
  - **`high`**: `60–100` **or** any finding flagged with `is_hard_stop: true`
- Applies diminishing-return category grouping (maximum severity within a category sets the category score) to prevent artificial score inflation, while preserving a complete per-finding breakdown.

---

### 4. Enterprise Governance, Disbursement Safety & Audit Logging
- **Maker-Checker Controls & Separation of Duties:** Invoice submitters cannot approve their own invoices; vendor bank account modifications require dual verification and put disbursements on hold until confirmed.
- **Role-Based Access:** Supports `admin`, `finance`, `approver`, `auditor`, and `vendor` roles across UI routes and API handlers.
- **Disbursement Tracking:** Prevents duplicate payouts across `pending`, `processing`, `completed`, and `failed` payment states in [`/api/payments`](src/app/api/payments/route.ts).
- **Immutable Audit Trail:** Logs state transitions, approvals, rejections, rule adjustments, and disbursements in `audit_logs` with actor details and CSV/UI inspection at `/app/audit-logs`.

---

## Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js `16.4.5` (App Router, Server Components, Route Handlers) |
| **UI & React** | React `19.3.0`, Tailwind CSS `v4`, `@base-ui/react`, shadcn/ui, Framer Motion |
| **Charts & Icons** | Recharts `^3.10.1`, Lucide React `^1.68.0` |
| **Forms & Validation** | React Hook Form `^7.91.0`, Zod `^4.6.7`, `@hookform/resolvers` |
| **OCR & PDF Processing** | Gemini REST API, Mistral OCR API (`/v1/ocr`), OpenRouter Free Vision, Groq Vision/LLM, `pdfjs-dist` (`^6.5.438`), `tesseract.js` (`^7.0.0`) |
| **Database & Auth** | Supabase (`@supabase/supabase-js` `^2.119.0`, `@supabase/ssr` `^0.12.7`, PostgreSQL with 28 tables & RLS) |
| **Testing & Tooling** | Vitest `^5.1.0`, TypeScript `5.x`, ESLint `9` (`eslint-config-next`) |

---

## API Endpoints

All API route handlers live under `src/app/api/`:

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/ocr/extract` | `GET`, `POST` | Check active OCR providers (`GET`); run multi-tier OCR extraction on uploaded PDFs, images, text, or rendered PDF pages (`POST`) |
| `/api/invoices` | `GET`, `POST` | List invoices and create new invoices with `invoice_files`, `invoice_extractions`, fraud analysis, and risk scoring |
| `/api/invoices/[invoiceId]` | `GET`, `PATCH`, `DELETE` | Fetch full invoice detail (including persisted extraction & fraud findings), update, or archive |
| `/api/invoices/[invoiceId]/actions` | `POST` | Execute workflow transitions (`approve`, `reject`, `hold`, `escalate`, `request_verification`) with segregation-of-duties checks |
| `/api/vendors` | `GET`, `POST` | List and onboard master suppliers |
| `/api/vendors/[vendorId]` | `GET`, `PATCH` | Inspect vendor profile, bank accounts, and maker-checker bank change requests |
| `/api/purchase-orders` | `GET`, `POST` | Manage approved Purchase Orders and commitment balances |
| `/api/goods-receipts` | `GET`, `POST` | Record and query warehouse Goods Receipt Notes (GRNs) for 3-way matching |
| `/api/payments` | `GET`, `POST` | List and record invoice disbursements with duplicate payout protection |
| `/api/dashboard/summary` | `GET` | Aggregated KPI metrics and executive risk counts |
| `/api/dashboard/analytics` | `GET` | Time-series fraud, volume, and vendor exposure metrics |
| `/api/notifications` | `GET`, `PATCH` | In-app risk & approval alerts |
| `/api/audit-logs` | `GET` | Read-only immutable financial audit log stream |

---

## Quick Start & Installation

### Prerequisites
- **Node.js** `20.x` or later (verified on Node.js `24.x`)
- **npm** `10.x` or later
- A **Supabase** project (optional for UI demo mode, required for live database persistence & auth)

### 1. Clone & Install
```bash
git clone https://github.com/prajwalpr4/InvoiceGuard-Intelligent-Invoice-Fraud-Detection-Payment-Risk-Management-Platform.git
cd InvoiceGuard-Intelligent-Invoice-Fraud-Detection-Payment-Risk-Management-Platform
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application URL (used for auth callbacks and OpenRouter HTTP-Referer header)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OCR Extraction Providers (Server-side only — never expose with NEXT_PUBLIC_)
# All cloud OCR keys are optional; any blank key is skipped cleanly in the fallback chain.
GEMINI_API_KEY=your-gemini-api-key
MISTRAL_API_KEY=your-mistral-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
GROQ_API_KEY=your-groq-api-key
```

> **Note:** Keep `.env.local` out of version control (it is listed in `.gitignore`). You can verify which OCR keys are active by visiting `http://localhost:3000/api/ocr/extract` once the server is running.

### 3. Initialize Supabase Database
Execute the SQL migrations in order inside your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` — creates the **28** relational PostgreSQL tables (`organizations`, `profiles`, `organization_members`, `vendors`, `vendor_bank_accounts`, `vendor_bank_change_requests`, `invoices`, `invoice_files`, `invoice_extractions`, `invoice_line_items`, `purchase_orders`, `po_line_items`, `goods_receipts`, `goods_receipt_items`, `fraud_rules`, `fraud_findings`, `risk_assessments`, `review_assignments`, `approval_policies`, `approval_requests`, `approval_steps`, `approval_actions`, `payment_records`, `notifications`, `audit_logs`, `invoice_comments`, `system_settings`, `processing_jobs`), triggers, indexes, and RLS policies.
2. `supabase/migrations/002_default_rules_and_seed.sql` — seeds default fraud rules and approval policies.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Build, Lint & Test
```bash
# Run unit tests (Vitest)
npm test

# Type-check with TypeScript
npx tsc --noEmit

# Run ESLint
npm run lint

# Build production bundle
npm run build
npm start
```

---

## Authentication & Workspace Roles

InvoiceGuard supports **Supabase Auth** (`/login`, `/signup`, `/pending-access`, `/forgot-password`, `/reset-password`, `/auth/callback`) as primary authentication, plus a local session fallback (`src/lib/auth/session.ts` & `src/lib/data/demo-data.ts`) when evaluating without Supabase credentials:

| Role | Fallback Account | Scope |
|---|---|---|
| **Admin** (`admin`) | `admin@invoiceguard.local` | System administration, user role management, fraud rule configuration, full governance |
| **Finance** (`finance`) | `finance@invoiceguard.local` | Invoice upload/OCR verification, vendor onboarding, PO/GRN entry, payment recording (cannot self-approve) |
| **Approver** (`approver`) | `approver@invoiceguard.local` | Risk investigation, approval/rejection/hold decisions, maker-checker bank account verification |
| **Auditor** (`auditor`) | `auditor@invoiceguard.local` | Read-only compliance inspection across invoices, fraud findings, payments, and audit logs |

---

## Repository Structure

```text
invoiceguard/
├── public/
│   └── pdf.worker.min.mjs              # PDF.js worker served locally for client PDF parsing & rendering
├── src/
│   ├── app/
│   │   ├── (protected)/app/            # Protected enterprise workspace routes
│   │   │   ├── dashboard/              # KPI overview & exposure charts
│   │   │   ├── invoices/               # Invoice list, upload + OCR (/new), deep-dive detail (/[invoiceId])
│   │   │   ├── vendors/                # Supplier master & bank maker-checker
│   │   │   ├── purchase-orders/        # PO tracking
│   │   │   ├── goods-receipts/         # GRN tracking
│   │   │   ├── fraud-detection/        # Active fraud findings radar
│   │   │   ├── review-queue/           # Investigator review queue
│   │   │   ├── approvals/              # Multi-tier approval queue
│   │   │   ├── payments/               # Disbursement ledger
│   │   │   ├── analytics/              # Risk & discrepancy analytics
│   │   │   ├── notifications/          # Alerts feed
│   │   │   ├── audit-logs/             # Immutable compliance audit stream
│   │   │   ├── users/                  # Role & team administration
│   │   │   ├── fraud-rules/            # Rule weight & activation controls
│   │   │   └── settings/               # Organization preferences
│   │   ├── api/                        # 13 REST API route handlers
│   │   ├── auth/callback/              # Supabase Auth OAuth/email callback
│   │   ├── login/, signup/, ...        # Auth, pending-access, contact, privacy, terms pages
│   │   └── page.tsx                    # Public landing page
│   ├── components/                     # Marketing, UI (shadcn/Base UI), and domain components
│   ├── lib/
│   │   ├── auth/session.ts             # Supabase + demo fallback session resolver
│   │   ├── data/                       # Supabase repository & demo dataset
│   │   ├── fraud/                      # FraudDetectionEngine (8 checks) & RiskScoringEngine
│   │   ├── ocr/                        # provider-chain.ts, extractor.ts, pdf-client.ts
│   │   └── supabase/                   # Client, server, middleware, and admin Supabase helpers
│   ├── types/database.ts               # Database, workflow, fraud, and OCR TypeScript interfaces
│   └── middleware.ts                   # Session refresh & protected route guard
├── supabase/migrations/                # PostgreSQL schema & seed migrations
├── tests/
│   ├── fraud-engine.test.ts            # 5 unit tests for FraudDetectionEngine
│   ├── risk-scorer.test.ts             # 3 unit tests for RiskScoringEngine
│   └── ocr-pipeline.test.ts            # 10 unit tests for OCR parser & 4-tier fallback chain
├── API_DOCUMENTATION.md
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── SECURITY.md
└── TESTING.md
```

---

## Automated Tests

`npm test` runs **Vitest** across **3 test files (18 tests)**:
- `tests/fraud-engine.test.ts` (5 tests): duplicate detection, bank account hard-stop mismatch, invoice splitting, tax validation, and 3-way match checks.
- `tests/risk-scorer.test.ts` (3 tests): score normalization, diminishing category weights, and hard-stop risk escalation.
- `tests/ocr-pipeline.test.ts` (10 tests): regex/tax/bank field parsing, Supabase `invoice_extractions` formatting, Gemini primary extraction, Mistral OCR native PDF + `422` schema retry, OpenRouter Free (`qwen/qwen3.8-27b:free` -> `openrouter/free`), Groq Qwen 3.8 Vision (3-image limit + Llama 4 Scout fallback), scanned PDF render gating, and `tesseract.js` fallback signaling.

---

## Additional Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System & security architecture
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — PostgreSQL entity relationships & RLS model
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Endpoint contracts & payloads
- [SECURITY.md](SECURITY.md) — Governance, auth boundaries, and secret hygiene
- [TESTING.md](TESTING.md) — Test strategy and verification commands

---

## License

Licensed under the Enterprise Commercial License. © 2026 InvoiceGuard. All rights reserved.
