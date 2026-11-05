# InvoiceGuard — Security Architecture & Compliance Governance

InvoiceGuard handles sensitive corporate financial transactions, vendor bank account records, and disbursement authorizations. The platform incorporates multi-layered defensive security controls to safeguard financial assets against fraud, unauthorized modification, and Business Email Compromise (BEC).

---

## 1. Authentication & Session Security

- **Supabase Authentication**: Standard email/password and enterprise magic links secured with salted bcrypt hashing and JWT tokens.
- **SSR Session Isolation**: Session resolution via `@supabase/ssr` cookies with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes in production.
- **Zero Client Secrets**: The Supabase service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is strictly confined to server-side route handlers and repositories. It is never bundled into client packages or exposed to the browser.
- **Quarantine on Self-Signup**: Public registrations via `/signup` default to `status = 'PENDING'` (`/pending-access`). Users cannot self-assign executive, manager, or finance roles; role provisioning requires tenant administrator approval.

---

## 2. Segregation of Duties (SoD)

In accordance with enterprise accounting standards (e.g. Sarbanes-Oxley 404):
- **Submitter Cannot Approve**: Any user who created or uploaded an invoice is barred from approving it. Enforced at both the UI layer (disabling the action) and the server API layer (`POST /api/invoices/[invoiceId]/actions` returns HTTP `403 Forbidden`).
- **Tier Ceilings**: Approver authority is gated by strict financial limits. Invoices exceeding $\$25,000$ require Tier 2 approval; invoices exceeding $\$100,000$ require executive Tier 3 signoff.
- **Audit Immutability**: All approval and rejection events log the actor's identity, timestamp, IP address, and justification.

---

## 3. Maker-Checker Controls for Vendor Bank Changes

The single highest-risk attack vector in invoice fraud is unauthorized vendor bank account modification (Vendor Impersonation / BEC).
1. **Separation of Execution & Authorization**:
   - A Finance Staff member (Maker) can initiate a change request (`vendor_bank_change_requests`).
   - A separate Approver or Admin (Checker) must independently verify the change through an out-of-band callback to the vendor's verified contact number.
2. **Automated Payment Hold**:
   - Initiating a bank change request immediately flags all pending and future invoices for that vendor with a `BANK_MISMATCH` or `ON_HOLD` status.
   - Disbursements are blocked until the Checker approves the change.
3. **Data Masking**:
   - Master bank account numbers are masked on the frontend (e.g. `•••• •••• •••• 9012`). Unmasking requires deliberate user action.

---

## 4. Multi-Tenant Row Level Security (RLS)

Every database table in `supabase/migrations/001_initial_schema.sql` is protected by Row Level Security:

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view invoices within their organization"
ON invoices FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);
```

Cross-tenant data leakage is cryptographically prevented at the database kernel level.

---

## 5. Tamper-Evident Audit Logging

The `audit_logs` table provides an immutable record of all system events:
- Ingestion of invoices (including SHA-256 binary hash).
- OCR parsing outcomes and manual user corrections.
- Fraud engine findings and risk assessments.
- Status transitions (`APPROVED`, `REJECTED`, `HOLD`).
- Payment disbursements.
- User permission and role changes.

Logs are append-only. No `UPDATE` or `DELETE` operations are permitted on `audit_logs`.

