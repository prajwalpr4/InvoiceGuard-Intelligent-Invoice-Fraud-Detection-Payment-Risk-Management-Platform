import { describe, it, expect } from 'vitest';
import { FraudDetectionEngine, FraudAnalysisContext } from '../src/lib/fraud/detector';
import { Invoice, Vendor, VendorBankAccount, PurchaseOrder, GoodsReceipt } from '../src/types/database';

describe('FraudDetectionEngine', () => {
  const baseVendor: Vendor = {
    id: 'vnd_test_01',
    organization_id: 'org_test',
    vendor_code: 'VND-999',
    name: 'Test Industrial Supplies',
    tax_id: '27AAACP1234A1Z5',
    email: 'billing@testindustrial.com',
    status: 'active',
    verification_status: 'verified',
    risk_tier: 'low',
    country: 'India',
    total_invoices_count: 5,
    total_amount_paid: 200000,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const masterBankAccount: VendorBankAccount = {
    id: 'vba_test_01',
    organization_id: 'org_test',
    vendor_id: 'vnd_test_01',
    bank_name: 'HDFC Bank',
    account_number: '50200012345678',
    ifsc_code: 'HDFC0000123',
    account_type: 'current',
    is_verified: true,
    is_primary: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const baseInvoice: Invoice = {
    id: 'inv_test_01',
    organization_id: 'org_test',
    vendor_id: 'vnd_test_01',
    invoice_number: 'INV-2026-001',
    invoice_date: '2026-02-15',
    currency: 'INR',
    subtotal: 50000,
    tax_amount: 9000,
    discount_amount: 0,
    total_amount: 59000,
    paid_amount: 0,
    balance_due: 59000,
    processing_status: 'extracted',
    workflow_status: 'pending_review',
    risk_score: 0,
    risk_level: 'low',
    has_hard_stop: false,
    submitted_by_id: 'usr_01',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
  };

  it('detects duplicate invoice numbers for the same vendor as a critical hard-stop', () => {
    const historicalInvoice: Invoice = {
      ...baseInvoice,
      id: 'inv_existing_paid',
      workflow_status: 'paid',
      paid_amount: 59000,
    };

    const findings = FraudDetectionEngine.checkDuplicates({
      invoice: baseInvoice,
      vendor: baseVendor,
      bankAccounts: [masterBankAccount],
      historicalInvoices: [historicalInvoice],
      allVendors: [baseVendor],
      allBankAccounts: [masterBankAccount],
    });

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].rule_code).toBe('RULE_DUPLICATE_EXACT');
    expect(findings[0].is_hard_stop).toBe(true);
    expect(findings[0].severity).toBe('critical');
  });

  it('intercepts bank account mismatch as a critical hard-stop hold', () => {
    const findings = FraudDetectionEngine.checkBankMismatch({
      invoice: baseInvoice,
      vendor: baseVendor,
      bankAccounts: [masterBankAccount],
      historicalInvoices: [],
      allVendors: [baseVendor],
      allBankAccounts: [masterBankAccount],
      extractedBankDetails: {
        account_number: '998877665544', // Differing unverified account!
        ifsc_code: 'UTIB0000999',
        bank_name: 'Axis Bank',
      },
    });

    expect(findings.length).toBe(1);
    expect(findings[0].rule_code).toBe('RULE_BANK_MISMATCH');
    expect(findings[0].is_hard_stop).toBe(true);
  });

  it('detects invoice splitting and threshold manipulation just below ₹1,00,000', () => {
    const splittingInvoice: Invoice = {
      ...baseInvoice,
      id: 'inv_split_02',
      subtotal: 96000, // Just below 100k ceiling
      total_amount: 113280,
    };

    const previousWithin7Days: Invoice = {
      ...baseInvoice,
      id: 'inv_split_01',
      invoice_date: '2026-02-12', // 3 days earlier
      subtotal: 97500, // Also just below ceiling
      total_amount: 115050,
    };

    const findings = FraudDetectionEngine.checkInvoiceSplitting({
      invoice: splittingInvoice,
      vendor: baseVendor,
      historicalInvoices: [previousWithin7Days],
      allVendors: [baseVendor],
      allBankAccounts: [masterBankAccount],
    });

    expect(findings.length).toBe(1);
    expect(findings[0].rule_code).toBe('RULE_INVOICE_SPLITTING');
  });

  it('detects shared GSTIN across two distinct vendor records', () => {
    const cloneVendor: Vendor = {
      ...baseVendor,
      id: 'vnd_clone_02',
      vendor_code: 'VND-CLONE',
      name: 'Clone Vendor Entity',
      tax_id: baseVendor.tax_id, // Shared GSTIN
    };

    const findings = FraudDetectionEngine.checkSuspiciousVendor({
      invoice: baseInvoice,
      vendor: cloneVendor,
      historicalInvoices: [],
      allVendors: [baseVendor, cloneVendor],
      allBankAccounts: [masterBankAccount],
    });

    expect(findings.some((f) => f.rule_code === 'RULE_SUSPICIOUS_VENDOR')).toBe(true);
    expect(findings.some((f) => f.is_hard_stop === true)).toBe(true);
  });

  it('flags mathematical inconsistencies when subtotal + tax != total', () => {
    const brokenMathInvoice: Invoice = {
      ...baseInvoice,
      subtotal: 50000,
      tax_amount: 9000,
      discount_amount: 0,
      total_amount: 65000, // Discrepancy of 6,000!
    };

    const findings = FraudDetectionEngine.checkTaxValidation({
      invoice: brokenMathInvoice,
      vendor: baseVendor,
      historicalInvoices: [],
      allVendors: [baseVendor],
      allBankAccounts: [masterBankAccount],
    });

    expect(findings.some((f) => f.rule_code === 'RULE_TAX_VALIDATION')).toBe(true);
  });
});

