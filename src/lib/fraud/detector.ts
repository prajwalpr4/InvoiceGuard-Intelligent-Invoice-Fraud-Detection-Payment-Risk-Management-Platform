import {
  Invoice,
  Vendor,
  VendorBankAccount,
  PurchaseOrder,
  GoodsReceipt,
  FraudFinding,
  InvoiceFile,
} from '@/types/database';

export interface FraudAnalysisContext {
  invoice: Invoice;
  vendor?: Vendor | null;
  bankAccounts?: VendorBankAccount[];
  purchaseOrder?: PurchaseOrder | null;
  goodsReceipts?: GoodsReceipt[];
  historicalInvoices: Invoice[];
  allVendors: Vendor[];
  allBankAccounts: VendorBankAccount[];
  invoiceFile?: InvoiceFile | null;
  extractedBankDetails?: {
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
  };
}

export class FraudDetectionEngine {
  /**
   * 1. Duplicate Invoice Detection
   */
  static checkDuplicates(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, historicalInvoices, invoiceFile } = context;

    for (const pastInv of historicalInvoices) {
      if (pastInv.id === invoice.id) continue;

      // 1a. Same Vendor and Same Invoice Number
      if (
        pastInv.vendor_id === invoice.vendor_id &&
        pastInv.invoice_number.trim().toLowerCase() === invoice.invoice_number.trim().toLowerCase()
      ) {
        const isPaid = pastInv.workflow_status === 'paid' || pastInv.paid_amount > 0;
        findings.push({
          id: `ff_${Date.now()}_dup_num`,
          organization_id: invoice.organization_id,
          invoice_id: invoice.id,
          rule_code: 'RULE_DUPLICATE_EXACT',
          rule_name: isPaid
            ? 'Resubmission of Previously Settled Invoice'
            : 'Duplicate Invoice Number for Same Vendor',
          category: 'duplicate',
          severity: 'critical',
          is_hard_stop: true,
          evidence: {
            message: isPaid
              ? `Invoice "${invoice.invoice_number}" was already paid on ${pastInv.updated_at?.split('T')[0]}. Re-submitting poses direct double-payment exposure.`
              : `Invoice number "${invoice.invoice_number}" already exists in the system (Invoice ID: ${pastInv.id}).`,
            fields: ['invoice_number', 'vendor_id'],
            matched_invoice_id: pastInv.id,
            matched_invoice_number: pastInv.invoice_number,
            matched_vendor_id: pastInv.vendor_id || undefined,
            details: {
              existing_status: pastInv.workflow_status,
              existing_amount: pastInv.total_amount,
              double_payment_risk: pastInv.total_amount,
            },
          },
          created_at: new Date().toISOString(),
        });
        break;
      }

      // 1b. Same Vendor, Same Date, Same Amount (Even if invoice number changed slightly)
      if (
        pastInv.vendor_id === invoice.vendor_id &&
        pastInv.invoice_date === invoice.invoice_date &&
        Math.abs(pastInv.total_amount - invoice.total_amount) < 1.0
      ) {
        findings.push({
          id: `ff_${Date.now()}_dup_amount_date`,
          organization_id: invoice.organization_id,
          invoice_id: invoice.id,
          rule_code: 'RULE_DUPLICATE_EXACT',
          rule_name: 'Identical Vendor, Date, and Amount Match',
          category: 'duplicate',
          severity: 'high',
          is_hard_stop: true,
          evidence: {
            message: `An invoice from this vendor with identical amount (₹${invoice.total_amount.toLocaleString()}) and date (${invoice.invoice_date}) exists (Invoice: ${pastInv.invoice_number}).`,
            fields: ['vendor_id', 'invoice_date', 'total_amount'],
            matched_invoice_id: pastInv.id,
            matched_invoice_number: pastInv.invoice_number,
            details: {
              existing_invoice_number: pastInv.invoice_number,
              existing_total: pastInv.total_amount,
            },
          },
          created_at: new Date().toISOString(),
        });
        break;
      }
    }

    return findings;
  }

  /**
   * 2. Bank Account Mismatch Detection
   */
  static checkBankMismatch(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, vendor, bankAccounts, extractedBankDetails } = context;

    if (!vendor || !extractedBankDetails?.account_number) {
      return findings;
    }

    const cleanExtracted = extractedBankDetails.account_number.replace(/[^a-zA-Z0-9]/g, '');
    const cleanExtractedIFSC = (extractedBankDetails.ifsc_code || '').toUpperCase().trim();

    const registeredAccounts = bankAccounts || [];
    const match = registeredAccounts.find(
      (ba) => ba.account_number.replace(/[^a-zA-Z0-9]/g, '') === cleanExtracted
    );

    if (!match && cleanExtracted.length > 5) {
      // Critical Bank Mismatch Hard-Stop
      findings.push({
        id: `ff_${Date.now()}_bank_mismatch`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_BANK_MISMATCH',
        rule_name: 'Unverified Vendor Bank Account',
        category: 'bank_account',
        severity: 'critical',
        is_hard_stop: true,
        evidence: {
          message: `The payment account on invoice (${extractedBankDetails.bank_name || 'Bank'}: ${extractedBankDetails.account_number}) is NOT in vendor's registered bank master records.`,
          fields: ['bank_account_number', 'ifsc_code'],
          expected: registeredAccounts.map((a) => `${a.bank_name}: ${a.account_number}`).join(', ') || 'No registered accounts',
          actual: `${extractedBankDetails.bank_name || 'Unknown'}: ${extractedBankDetails.account_number}`,
          details: {
            extracted_ifsc: cleanExtractedIFSC,
            registered_accounts_count: registeredAccounts.length,
            recommendation: 'Invoice held automatically. Require Maker-Checker verified Bank Change Request before clearance.',
          },
        },
        created_at: new Date().toISOString(),
      });
    } else if (match && cleanExtractedIFSC && match.ifsc_code.toUpperCase() !== cleanExtractedIFSC) {
      // IFSC discrepancy on matching account
      findings.push({
        id: `ff_${Date.now()}_ifsc_mismatch`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_BANK_MISMATCH',
        rule_name: 'Bank Branch IFSC Discrepancy',
        category: 'bank_account',
        severity: 'medium',
        is_hard_stop: false,
        evidence: {
          message: `Bank account matches, but IFSC code "${cleanExtractedIFSC}" differs from master record "${match.ifsc_code}".`,
          fields: ['ifsc_code'],
          expected: match.ifsc_code,
          actual: cleanExtractedIFSC,
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * 3. Invoice Splitting and Approval Threshold Manipulation
   */
  static checkInvoiceSplitting(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, historicalInvoices } = context;

    // Standard approval limit ceilings
    const APPROVAL_CEILING = 100000.0; // ₹1,00,000 threshold for director/executive signoff
    const LOWER_BOUND = 90000.0; // 90k - 99.9k cluster

    const invoiceDate = new Date(invoice.invoice_date).getTime();
    const ROLLING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Check if current invoice is just below threshold
    const isJustBelow = invoice.subtotal >= LOWER_BOUND && invoice.subtotal < APPROVAL_CEILING;

    // Check recent invoices from same vendor in rolling window
    const recentVendorInvoices = historicalInvoices.filter((inv) => {
      if (inv.id === invoice.id || inv.vendor_id !== invoice.vendor_id) return false;
      const diff = Math.abs(invoiceDate - new Date(inv.invoice_date).getTime());
      return diff <= ROLLING_WINDOW_MS;
    });

    const recentBelowThreshold = recentVendorInvoices.filter(
      (inv) => inv.subtotal >= LOWER_BOUND && inv.subtotal < APPROVAL_CEILING
    );

    if (isJustBelow && recentBelowThreshold.length > 0) {
      const combinedAmount =
        invoice.total_amount +
        recentBelowThreshold.reduce((sum, inv) => sum + inv.total_amount, 0);

      findings.push({
        id: `ff_${Date.now()}_splitting`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_INVOICE_SPLITTING',
        rule_name: 'Potential Invoice Splitting Pattern',
        category: 'splitting',
        severity: 'high',
        is_hard_stop: false,
        evidence: {
          message: `Invoice subtotal (₹${invoice.subtotal.toLocaleString()}) sits just below approval limit (₹1,00,000). Found ${recentBelowThreshold.length} other invoice(s) within 7 days from this vendor.`,
          fields: ['subtotal', 'vendor_id', 'invoice_date'],
          details: {
            approval_ceiling: APPROVAL_CEILING,
            recent_invoices_count: recentBelowThreshold.length + 1,
            combined_exposure: combinedAmount,
            recommendation: 'Evaluate whether these deliveries originate from a single procurement order to avoid threshold bypass.',
          },
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * 4. Suspicious Vendor Detection
   */
  static checkSuspiciousVendor(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, vendor, allVendors } = context;

    if (!vendor) {
      findings.push({
        id: `ff_${Date.now()}_no_vendor`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_SUSPICIOUS_VENDOR',
        rule_name: 'Unassociated Vendor Profile',
        category: 'vendor',
        severity: 'high',
        is_hard_stop: false,
        evidence: {
          message: 'Invoice has no verified vendor record associated in the master vendor directory.',
          fields: ['vendor_id'],
        },
        created_at: new Date().toISOString(),
      });
      return findings;
    }

    // 4a. Shared Tax ID / GSTIN / PAN with another vendor
    const cleanTaxId = vendor.tax_id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const sharedVendor = allVendors.find(
      (v) =>
        v.id !== vendor.id &&
        v.tax_id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanTaxId
    );

    if (sharedVendor) {
      findings.push({
        id: `ff_${Date.now()}_shared_tax`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_SUSPICIOUS_VENDOR',
        rule_name: 'Shared Tax ID with Existing Vendor',
        category: 'vendor',
        severity: 'critical',
        is_hard_stop: true,
        evidence: {
          message: `Vendor "${vendor.name}" shares tax credential (${vendor.tax_id}) with existing vendor "${sharedVendor.name}" (${sharedVendor.vendor_code}).`,
          fields: ['tax_id', 'pan_number'],
          expected: 'Unique GSTIN per commercial vendor',
          actual: `Duplicated with ${sharedVendor.name}`,
          details: {
            conflicting_vendor_id: sharedVendor.id,
            conflicting_vendor_code: sharedVendor.vendor_code,
          },
        },
        created_at: new Date().toISOString(),
      });
    }

    // 4b. Newly created vendor (< 30 days old)
    const vendorAgeDays = Math.floor(
      (Date.now() - new Date(vendor.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (vendorAgeDays < 30 && vendor.verification_status !== 'verified') {
      findings.push({
        id: `ff_${Date.now()}_new_vendor`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_SUSPICIOUS_VENDOR',
        rule_name: 'New Unverified Vendor Onboarding',
        category: 'vendor',
        severity: 'medium',
        is_hard_stop: false,
        evidence: {
          message: `Vendor was onboarded ${vendorAgeDays} days ago and has not passed compliance verification.`,
          fields: ['vendor_id', 'verification_status'],
          details: { vendor_age_days: vendorAgeDays, status: vendor.verification_status },
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * 5. Purchase Order Matching
   */
  static checkPurchaseOrder(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, purchaseOrder } = context;

    // Policy: Invoices > ₹25,000 require a linked Purchase Order
    if (!purchaseOrder) {
      if (invoice.total_amount > 25000) {
        findings.push({
          id: `ff_${Date.now()}_missing_po`,
          organization_id: invoice.organization_id,
          invoice_id: invoice.id,
          rule_code: 'RULE_PO_MISMATCH',
          rule_name: 'Missing Purchase Order Reference',
          category: 'purchase_order',
          severity: 'medium',
          is_hard_stop: false,
          evidence: {
            message: `Corporate policy mandates a valid Purchase Order for invoices exceeding ₹25,000. Total billed: ₹${invoice.total_amount.toLocaleString()}.`,
            fields: ['po_id', 'total_amount'],
          },
          created_at: new Date().toISOString(),
        });
      }
      return findings;
    }

    // 5a. Vendor on PO mismatch
    if (purchaseOrder.vendor_id !== invoice.vendor_id) {
      findings.push({
        id: `ff_${Date.now()}_po_vendor_mismatch`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_PO_MISMATCH',
        rule_name: 'Purchase Order Vendor Mismatch',
        category: 'purchase_order',
        severity: 'high',
        is_hard_stop: true,
        evidence: {
          message: `PO "${purchaseOrder.po_number}" was issued to a different vendor than this invoice.`,
          fields: ['vendor_id', 'po_id'],
        },
        created_at: new Date().toISOString(),
      });
    }

    // 5b. Invoice exceeds approved PO ceiling
    if (invoice.subtotal > purchaseOrder.total_amount * 1.05) {
      // > 5% variance
      findings.push({
        id: `ff_${Date.now()}_po_overbilled`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_PO_MISMATCH',
        rule_name: 'Invoice Exceeds Approved PO Balance',
        category: 'purchase_order',
        severity: 'high',
        is_hard_stop: false,
        evidence: {
          message: `Billed subtotal ₹${invoice.subtotal.toLocaleString()} exceeds PO approved amount ₹${purchaseOrder.total_amount.toLocaleString()} by ${(
            ((invoice.subtotal - purchaseOrder.total_amount) / purchaseOrder.total_amount) *
            100
          ).toFixed(1)}%.`,
          fields: ['subtotal', 'po_id'],
          expected: purchaseOrder.total_amount,
          actual: invoice.subtotal,
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * 6. Three-Way Matching (PO vs Invoice vs GRN)
   */
  static checkThreeWayMatch(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, purchaseOrder, goodsReceipts } = context;

    if (!purchaseOrder) return findings;

    const grns = goodsReceipts || [];
    if (grns.length === 0) {
      findings.push({
        id: `ff_${Date.now()}_no_grn`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_THREE_WAY_MATCH',
        rule_name: 'No Goods Receipt Note (GRN) on File',
        category: 'three_way_match',
        severity: 'high',
        is_hard_stop: true,
        evidence: {
          message: `No warehouse goods receipt note has been filed for PO "${purchaseOrder.po_number}". Physical goods/services delivery unconfirmed.`,
          fields: ['po_id'],
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * 7. Unusual Invoice Amount Anomaly (Statistical Z-Score)
   */
  static checkAmountAnomaly(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, historicalInvoices } = context;

    const pastVendorInvoices = historicalInvoices.filter(
      (inv) => inv.vendor_id === invoice.vendor_id && inv.id !== invoice.id
    );

    // If insufficient history, do not hallucinate an anomaly
    if (pastVendorInvoices.length < 3) {
      return findings;
    }

    const amounts = pastVendorInvoices.map((inv) => inv.total_amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    // Z-score calculation
    if (stdDev > 0) {
      const zScore = (invoice.total_amount - mean) / stdDev;
      if (zScore > 3.0) {
        findings.push({
          id: `ff_${Date.now()}_amount_anomaly`,
          organization_id: invoice.organization_id,
          invoice_id: invoice.id,
          rule_code: 'RULE_AMOUNT_ANOMALY',
          rule_name: 'Statistical Transaction Amount Outlier',
          category: 'unusual_amount',
          severity: 'medium',
          is_hard_stop: false,
          evidence: {
            message: `Invoice total (₹${invoice.total_amount.toLocaleString()}) is significantly higher than historical average for this vendor (Mean: ₹${Math.round(mean).toLocaleString()}, Z-Score: ${zScore.toFixed(1)}).`,
            fields: ['total_amount'],
            expected: `Within historical range ₹${Math.round(Math.max(0, mean - 2 * stdDev)).toLocaleString()} - ₹${Math.round(mean + 2 * stdDev).toLocaleString()}`,
            actual: `₹${invoice.total_amount.toLocaleString()}`,
            details: { historical_samples: amounts.length, z_score: zScore },
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    return findings;
  }

  /**
   * 8. Tax & Arithmetic Validation
   */
  static checkTaxValidation(context: FraudAnalysisContext): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const { invoice, vendor } = context;

    // 8a. GSTIN format check (India standard 15-character GSTIN)
    if (vendor?.tax_id) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const cleanGSTIN = vendor.tax_id.trim().toUpperCase();
      if (!gstinRegex.test(cleanGSTIN)) {
        findings.push({
          id: `ff_${Date.now()}_invalid_gstin`,
          organization_id: invoice.organization_id,
          invoice_id: invoice.id,
          rule_code: 'RULE_TAX_VALIDATION',
          rule_name: 'Invalid GSTIN Format Structure',
          category: 'tax_validation',
          severity: 'medium',
          is_hard_stop: false,
          evidence: {
            message: `Vendor tax identifier "${vendor.tax_id}" does not conform to valid GSTIN specification.`,
            fields: ['tax_id'],
            expected: '15-digit alphanumeric format (e.g. 27AAACP1234A1Z5)',
            actual: vendor.tax_id,
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    // 8b. Mathematical Consistency: Subtotal + Tax - Discount ≈ Total
    const computedTotal = invoice.subtotal + invoice.tax_amount - invoice.discount_amount;
    const diff = Math.abs(computedTotal - invoice.total_amount);

    if (diff > 1.0) {
      findings.push({
        id: `ff_${Date.now()}_math_inconsistency`,
        organization_id: invoice.organization_id,
        invoice_id: invoice.id,
        rule_code: 'RULE_TAX_VALIDATION',
        rule_name: 'Financial Arithmetic Inconsistency',
        category: 'tax_validation',
        severity: 'high',
        is_hard_stop: false,
        evidence: {
          message: `Subtotal (₹${invoice.subtotal.toLocaleString()}) + Tax (₹${invoice.tax_amount.toLocaleString()}) - Discount (₹${invoice.discount_amount.toLocaleString()}) = ₹${computedTotal.toLocaleString()}, which does not match billed Total (₹${invoice.total_amount.toLocaleString()}). Discrepancy: ₹${diff.toFixed(2)}.`,
          fields: ['subtotal', 'tax_amount', 'discount_amount', 'total_amount'],
          expected: computedTotal,
          actual: invoice.total_amount,
        },
        created_at: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * Run all 8 detection modules
   */
  static runAllChecks(context: FraudAnalysisContext): FraudFinding[] {
    return [
      ...this.checkDuplicates(context),
      ...this.checkBankMismatch(context),
      ...this.checkInvoiceSplitting(context),
      ...this.checkSuspiciousVendor(context),
      ...this.checkPurchaseOrder(context),
      ...this.checkThreeWayMatch(context),
      ...this.checkAmountAnomaly(context),
      ...this.checkTaxValidation(context),
    ];
  }
}

