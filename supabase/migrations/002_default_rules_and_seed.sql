-- Default Fraud Rules & Baseline Setup

-- Default Fraud Detection Rules
-- These rules are seeded for organizations upon creation

CREATE OR REPLACE FUNCTION seed_default_fraud_rules(org_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO fraud_rules (organization_id, rule_code, name, description, category, is_enabled, is_hard_stop, score_weight, parameters)
    VALUES
    (
        org_id,
        'RULE_DUPLICATE_EXACT',
        'Exact Duplicate Invoice Detection',
        'Detects identical SHA-256 file hashes or identical vendor, invoice number, and billing amount combinations.',
        'duplicate',
        TRUE,
        TRUE,
        40,
        '{"check_file_hash": true, "check_invoice_num": true, "check_amount_date": true}'::jsonb
    ),
    (
        org_id,
        'RULE_BANK_MISMATCH',
        'Vendor Bank Account Mismatch',
        'Flags invoices where the extracted bank account number or IFSC code differs from the trusted vendor master record.',
        'bank_account',
        TRUE,
        TRUE,
        35,
        '{"auto_hold": true, "require_maker_checker": true}'::jsonb
    ),
    (
        org_id,
        'RULE_INVOICE_SPLITTING',
        'Invoice Splitting / Threshold Manipulation',
        'Detects multiple invoices from the same vendor within a rolling window clustered just below approval authority ceilings.',
        'splitting',
        TRUE,
        FALSE,
        20,
        '{"rolling_days": 7, "threshold_band_percent": 10, "approval_ceiling": 100000}'::jsonb
    ),
    (
        org_id,
        'RULE_SUSPICIOUS_VENDOR',
        'Suspicious & Unverified Vendor Activity',
        'Identifies new vendors (<30 days), inactive vendors with sudden reactivation spikes, or duplicate tax credentials.',
        'vendor',
        TRUE,
        FALSE,
        15,
        '{"new_vendor_days": 30, "dormant_days": 180}'::jsonb
    ),
    (
        org_id,
        'RULE_PO_MISMATCH',
        'Purchase Order Discrepancy',
        'Verifies invoice total, line items, and quantities against the approved purchase order ceiling.',
        'purchase_order',
        TRUE,
        FALSE,
        15,
        '{"max_variance_percent": 5, "require_po_over": 25000}'::jsonb
    ),
    (
        org_id,
        'RULE_THREE_WAY_MATCH',
        'Three-Way Matching Exception (PO - Invoice - GRN)',
        'Cross-references billed quantities against physical goods receipt notes (GRN) from the warehouse/receiving team.',
        'three_way_match',
        TRUE,
        TRUE,
        20,
        '{"allow_partial_receipt": true}'::jsonb
    ),
    (
        org_id,
        'RULE_AMOUNT_ANOMALY',
        'Statistical Amount Anomaly Detection',
        'Evaluates historical transaction distribution for the vendor to identify statistical outliers (> 3 standard deviations).',
        'unusual_amount',
        TRUE,
        FALSE,
        15,
        '{"min_history_samples": 3, "z_score_threshold": 2.5}'::jsonb
    ),
    (
        org_id,
        'RULE_TAX_VALIDATION',
        'Tax & Arithmetic Consistency Checks',
        'Validates GSTIN/PAN formatting checksums and confirms that Subtotal + CGST + SGST/IGST equals Total Amount.',
        'tax_validation',
        TRUE,
        FALSE,
        10,
        '{"validate_gstin_checksum": true, "max_rounding_error": 1.00}'::jsonb
    )
    ON CONFLICT (organization_id, rule_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Default Multi-Tier Approval Policies
CREATE OR REPLACE FUNCTION seed_default_approval_policies(org_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO approval_policies (organization_id, name, min_amount, max_amount, required_roles, step_order, is_active)
    VALUES
    (
        org_id,
        'Tier 1: Standard Invoices (<= ₹25,000)',
        0.00,
        25000.00,
        ARRAY['finance']::TEXT[],
        1,
        TRUE
    ),
    (
        org_id,
        'Tier 2: Mid-Value Invoices (₹25,001 - ₹1,00,000)',
        25000.01,
        100000.00,
        ARRAY['approver']::TEXT[],
        1,
        TRUE
    ),
    (
        org_id,
        'Tier 3: High-Value Invoices (> ₹1,00,000)',
        100000.01,
        999999999.99,
        ARRAY['approver', 'admin']::TEXT[],
        1,
        TRUE
    );
END;
$$ LANGUAGE plpgsql;

