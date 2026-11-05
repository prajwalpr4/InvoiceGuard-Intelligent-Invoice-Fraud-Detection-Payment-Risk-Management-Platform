import {
  Organization,
  Profile,
  OrganizationMember,
  Vendor,
  VendorBankAccount,
  VendorBankChangeRequest,
  PurchaseOrder,
  GoodsReceipt,
  Invoice,
  InvoiceFile,
  InvoiceExtraction,
  FraudFinding,
  FraudRule,
  RiskAssessment,
  ApprovalRequest,
  PaymentRecord,
  Notification,
  AuditLog,
  InvoiceComment,
} from '@/types/database';
import {
  DEMO_ORG,
  DEMO_MEMBERS,
  DEMO_VENDORS,
  DEMO_BANK_ACCOUNTS,
  DEMO_PURCHASE_ORDERS,
  DEMO_GOODS_RECEIPTS,
  DEMO_INVOICES,
  DEMO_FRAUD_FINDINGS,
  DEMO_PAYMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_AUDIT_LOGS,
} from './demo-data';
import { FraudDetectionEngine } from '../fraud/detector';
import { RiskScoringEngine } from '../fraud/risk-scorer';
import { OCRExtractionPipeline } from '../ocr/extractor';

// In-memory state for development & live operational demo
class InvoiceGuardStore {
  organization: Organization = DEMO_ORG;
  members: OrganizationMember[] = [...DEMO_MEMBERS];
  vendors: Vendor[] = [...DEMO_VENDORS];
  bankAccounts: VendorBankAccount[] = [...DEMO_BANK_ACCOUNTS];
  bankChangeRequests: VendorBankChangeRequest[] = [];
  purchaseOrders: PurchaseOrder[] = [...DEMO_PURCHASE_ORDERS];
  goodsReceipts: GoodsReceipt[] = [...DEMO_GOODS_RECEIPTS];
  invoices: Invoice[] = [...DEMO_INVOICES];
  fraudFindings: FraudFinding[] = [...DEMO_FRAUD_FINDINGS];
  payments: PaymentRecord[] = [...DEMO_PAYMENTS];
  notifications: Notification[] = [...DEMO_NOTIFICATIONS];
  auditLogs: AuditLog[] = [...DEMO_AUDIT_LOGS];
  comments: InvoiceComment[] = [];

  constructor() {
    // Run initial risk scoring for all demo invoices
    this.recalculateAllRisks();
  }

  private recalculateAllRisks() {
    for (const inv of this.invoices) {
      const findings = this.fraudFindings.filter((f) => f.invoice_id === inv.id);
      const assessment = RiskScoringEngine.calculateRisk(inv.id, this.organization.id, findings);
      inv.risk_score = assessment.risk_score;
      inv.risk_level = assessment.risk_level;
      inv.has_hard_stop = assessment.has_hard_stop;
    }
  }
}

// Global singleton instance
const globalStore = (global as any)._invoiceguardStore || new InvoiceGuardStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any)._invoiceguardStore = globalStore;
}

export class InvoiceGuardRepository {
  private static store: InvoiceGuardStore = globalStore;

  // --- DASHBOARD METRICS ---
  static async getDashboardSummary() {
    const invoices = this.store.invoices;
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingReview = invoices.filter(
      (inv) => inv.workflow_status === 'pending_review' || inv.workflow_status === 'draft'
    ).length;
    const onHold = invoices.filter((inv) => inv.workflow_status === 'on_hold').length;
    const pendingApproval = invoices.filter((inv) => inv.workflow_status === 'pending_approval').length;
    const approved = invoices.filter((inv) => inv.workflow_status === 'approved' || inv.workflow_status === 'ready_for_payment').length;
    const rejected = invoices.filter((inv) => inv.workflow_status === 'rejected').length;
    const paid = invoices.filter((inv) => inv.workflow_status === 'paid' || inv.workflow_status === 'partially_paid').length;
    const highRisk = invoices.filter((inv) => inv.risk_level === 'high').length;

    // Fraud metrics
    const duplicateFindings = this.store.fraudFindings.filter((f) => f.category === 'duplicate');
    const bankMismatches = this.store.fraudFindings.filter((f) => f.category === 'bank_account');

    // Calculate potential exposure saved
    const potentialExposure = invoices
      .filter((inv) => inv.risk_level === 'high' && inv.workflow_status !== 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    return {
      totalInvoices,
      totalValue,
      pendingReview,
      onHold,
      pendingApproval,
      approved,
      rejected,
      paid,
      highRisk,
      duplicatesCaught: duplicateFindings.length,
      bankMismatchesCaught: bankMismatches.length,
      potentialExposure,
      currency: this.store.organization.currency,
    };
  }

  static async getDashboardAnalytics() {
    // 1. Monthly Volume and Spend dynamically computed from real invoices
    const now = new Date();
    const months: { month: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      });
    }

    const monthlyData = months.map(({ month, key }) => {
      const monthInvoices = this.store.invoices.filter((inv) =>
        inv.invoice_date?.startsWith(key)
      );
      return {
        month,
        count: monthInvoices.length,
        spend: monthInvoices.reduce((s, i) => s + i.total_amount, 0),
        flagged: monthInvoices.filter((i) => i.risk_level === 'high' || i.has_hard_stop).length,
      };
    });

    // 2. Risk Distribution
    const riskDistribution = [
      { name: 'Low Risk (0-29)', value: this.store.invoices.filter((i) => i.risk_level === 'low').length, color: '#16a34a' },
      { name: 'Medium Risk (30-59)', value: this.store.invoices.filter((i) => i.risk_level === 'medium').length, color: '#f59e0b' },
      { name: 'High Risk (60-100)', value: this.store.invoices.filter((i) => i.risk_level === 'high').length, color: '#dc2626' },
    ];

    // 3. Fraud Alerts by Category
    const categoryCounts: Record<string, number> = {};
    for (const f of this.store.fraudFindings) {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    }
    const alertsByCategory = [
      { category: 'Duplicate Invoices', count: categoryCounts['duplicate'] || 0 },
      { category: 'Bank Mismatches', count: categoryCounts['bank_account'] || 0 },
      { category: 'Threshold Splitting', count: categoryCounts['splitting'] || 0 },
      { category: 'Suspicious Vendor', count: categoryCounts['vendor'] || 0 },
      { category: 'PO Mismatches', count: categoryCounts['purchase_order'] || 0 },
      { category: '3-Way Match GRN', count: categoryCounts['three_way_match'] || 0 },
      { category: 'Tax & Math Checks', count: categoryCounts['tax_validation'] || 0 },
    ];

    // 4. Vendor Spend Breakdown
    const vendorSpend = this.store.vendors.map((v) => ({
      vendorName: v.name.length > 20 ? v.name.substring(0, 18) + '...' : v.name,
      totalSpend: v.total_amount_paid || 0,
      riskTier: v.risk_tier,
    }));

    return {
      monthlyData,
      riskDistribution,
      alertsByCategory,
      vendorSpend,
    };
  }

  // --- INVOICES ---
  static async getInvoices(filters?: {
    search?: string;
    status?: string;
    risk?: string;
    vendorId?: string;
  }) {
    let result = [...this.store.invoices];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.vendor?.name.toLowerCase().includes(q) ||
          i.department?.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((i) => i.workflow_status === filters.status);
    }

    if (filters?.risk && filters.risk !== 'all') {
      result = result.filter((i) => i.risk_level === filters.risk);
    }

    if (filters?.vendorId) {
      result = result.filter((i) => i.vendor_id === filters.vendorId);
    }

    // Attach vendor object
    return result.map((inv) => ({
      ...inv,
      vendor: this.store.vendors.find((v) => v.id === inv.vendor_id),
    }));
  }

  static async getInvoiceById(id: string) {
    const invoice = this.store.invoices.find((i) => i.id === id);
    if (!invoice) return null;

    const vendor = this.store.vendors.find((v) => v.id === invoice.vendor_id);
    const purchase_order = this.store.purchaseOrders.find((p) => p.id === invoice.po_id);
    const findings = this.store.fraudFindings.filter((f) => f.invoice_id === invoice.id);
    const risk_assessment = RiskScoringEngine.calculateRisk(
      invoice.id,
      this.store.organization.id,
      findings
    );

    return {
      ...invoice,
      vendor,
      purchase_order,
      findings,
      risk_assessment,
    };
  }

  static async createInvoice(data: {
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    vendor_id?: string;
    po_id?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount?: number;
    total_amount: number;
    department?: string;
    category?: string;
    notes?: string;
    submitted_by_id: string;
    extracted_text?: string;
    bank_details?: {
      account_number?: string;
      ifsc_code?: string;
      bank_name?: string;
    };
  }): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newInvoice: Invoice = {
      id,
      organization_id: this.store.organization.id,
      vendor_id: data.vendor_id || null,
      po_id: data.po_id || null,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date || null,
      currency: this.store.organization.currency,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      discount_amount: data.discount_amount || 0,
      total_amount: data.total_amount,
      paid_amount: 0,
      balance_due: data.total_amount,
      department: data.department || 'General',
      category: data.category || 'Standard Procurement',
      notes: data.notes || '',
      processing_status: 'extracted',
      workflow_status: 'draft',
      risk_score: 0,
      risk_level: 'low',
      has_hard_stop: false,
      submitted_by_id: data.submitted_by_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.store.invoices.unshift(newInvoice);

    // Run Fraud Detection Pipeline
    await this.runFraudAnalysis(newInvoice.id, data.bank_details);

    // Log Audit Event
    await this.logAuditEvent({
      action: 'INVOICE_CREATED',
      entity_type: 'invoice',
      entity_id: newInvoice.id,
      user_id: data.submitted_by_id,
      new_state: {
        invoice_number: newInvoice.invoice_number,
        total_amount: newInvoice.total_amount,
      },
      reason: 'Invoice registered via manual or automated intake',
    });

    return (await this.getInvoiceById(newInvoice.id))!;
  }

  static async updateInvoice(id: string, updates: Partial<Invoice>, userId?: string) {
    const index = this.store.invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const oldState = { ...this.store.invoices[index] };
    this.store.invoices[index] = {
      ...this.store.invoices[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (userId) {
      await this.logAuditEvent({
        action: 'INVOICE_UPDATED',
        entity_type: 'invoice',
        entity_id: id,
        user_id: userId,
        old_state: oldState,
        new_state: updates,
        reason: 'Authorized invoice field modification',
      });
    }

    return await this.getInvoiceById(id);
  }

  static async runFraudAnalysis(
    invoiceId: string,
    extractedBank?: { account_number?: string; ifsc_code?: string; bank_name?: string }
  ) {
    const invoice = this.store.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const vendor = this.store.vendors.find((v) => v.id === invoice.vendor_id);
    const bankAccounts = this.store.bankAccounts.filter((ba) => ba.vendor_id === invoice.vendor_id);
    const purchaseOrder = this.store.purchaseOrders.find((p) => p.id === invoice.po_id);
    const goodsReceipts = this.store.goodsReceipts.filter((g) => g.po_id === invoice.po_id);

    // Run all 8 detection algorithms
    const findings = FraudDetectionEngine.runAllChecks({
      invoice,
      vendor,
      bankAccounts,
      purchaseOrder,
      goodsReceipts,
      historicalInvoices: this.store.invoices,
      allVendors: this.store.vendors,
      allBankAccounts: this.store.bankAccounts,
      extractedBankDetails: extractedBank,
    });

    // Remove previous findings for this invoice and add fresh ones
    this.store.fraudFindings = this.store.fraudFindings.filter((f) => f.invoice_id !== invoiceId);
    this.store.fraudFindings.push(...findings);

    // Calculate Explainable Risk Assessment
    const assessment = RiskScoringEngine.calculateRisk(invoiceId, this.store.organization.id, findings);

    // Apply Hard-Stop policy to Workflow Status
    invoice.risk_score = assessment.risk_score;
    invoice.risk_level = assessment.risk_level;
    invoice.has_hard_stop = assessment.has_hard_stop;

    if (assessment.has_hard_stop) {
      invoice.workflow_status = 'on_hold';
      // Generate In-App Alert
      this.store.notifications.unshift({
        id: `notif_${Date.now()}`,
        organization_id: this.store.organization.id,
        user_id: 'usr_admin_01',
        title: `Critical Alert: Invoice ${invoice.invoice_number} Placed on Hold`,
        message: assessment.explanation,
        type: 'alert',
        entity_type: 'invoice',
        entity_id: invoice.id,
        link_url: `/app/invoices/${invoice.id}`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } else if (invoice.risk_level === 'high') {
      invoice.workflow_status = 'pending_review';
    } else if (invoice.workflow_status === 'draft') {
      invoice.workflow_status = 'pending_approval';
    }

    return assessment;
  }

  // --- VENDORS ---
  static async getVendors() {
    return this.store.vendors.map((v) => ({
      ...v,
      bank_accounts: this.store.bankAccounts.filter((ba) => ba.vendor_id === v.id),
    }));
  }

  static async getVendorById(id: string) {
    const vendor = this.store.vendors.find((v) => v.id === id);
    if (!vendor) return null;
    return {
      ...vendor,
      bank_accounts: this.store.bankAccounts.filter((ba) => ba.vendor_id === vendor.id),
      invoices: this.store.invoices.filter((i) => i.vendor_id === vendor.id),
      purchase_orders: this.store.purchaseOrders.filter((p) => p.vendor_id === vendor.id),
    };
  }

  static async createVendor(data: {
    vendor_code: string;
    name: string;
    legal_name?: string;
    tax_id: string;
    pan_number?: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
  }) {
    const id = `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newVendor: Vendor = {
      id,
      organization_id: this.store.organization.id,
      vendor_code: data.vendor_code,
      name: data.name,
      legal_name: data.legal_name || data.name,
      tax_id: data.tax_id.toUpperCase(),
      pan_number: data.pan_number?.toUpperCase() || null,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: 'India',
      postal_code: data.postal_code || null,
      status: 'active',
      verification_status: 'verified',
      risk_tier: 'low',
      total_invoices_count: 0,
      total_amount_paid: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.store.vendors.push(newVendor);

    if (data.account_number && data.ifsc_code) {
      this.store.bankAccounts.push({
        id: `vba_${Date.now()}`,
        organization_id: this.store.organization.id,
        vendor_id: newVendor.id,
        bank_name: data.bank_name || 'Primary Bank',
        account_number: data.account_number,
        ifsc_code: data.ifsc_code.toUpperCase(),
        account_type: 'current',
        is_verified: true,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await this.logAuditEvent({
      action: 'VENDOR_CREATED',
      entity_type: 'vendor',
      entity_id: newVendor.id,
      new_state: { name: newVendor.name, tax_id: newVendor.tax_id },
      reason: 'New verified vendor onboarded to vendor directory',
    });

    return await this.getVendorById(newVendor.id);
  }

  static async verifyVendor(id: string, userId?: string) {
    const vendor = this.store.vendors.find((v) => v.id === id);
    if (!vendor) return null;
    vendor.verification_status = 'verified';
    vendor.risk_tier = 'low';
    vendor.status = 'active';

    await this.logAuditEvent({
      action: 'VENDOR_VERIFIED',
      entity_type: 'vendor',
      entity_id: id,
      user_id: userId,
      reason: 'Compliance documentation and GSTIN validation cleared by reviewer',
    });

    return await this.getVendorById(id);
  }

  // --- PURCHASE ORDERS & GRNS ---
  static async getPurchaseOrders() {
    return this.store.purchaseOrders.map((po) => ({
      ...po,
      vendor: this.store.vendors.find((v) => v.id === po.vendor_id),
    }));
  }

  static async getGoodsReceipts() {
    return this.store.goodsReceipts.map((grn) => ({
      ...grn,
      purchase_order: this.store.purchaseOrders.find((p) => p.id === grn.po_id),
    }));
  }

  // --- APPROVALS & REVIEWS ---
  static async recordApprovalDecision(
    invoiceId: string,
    action: 'approve' | 'reject' | 'hold' | 'escalate',
    reason: string,
    userId: string
  ) {
    const invoice = this.store.invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    // Segregation of Duties Enforcement: Submitter cannot approve
    if (invoice.submitted_by_id === userId && action === 'approve') {
      throw new Error('Maker-Checker Violation: Invoice submitter is prohibited from approving their own invoice.');
    }

    if (action === 'approve') {
      invoice.workflow_status = 'ready_for_payment';
    } else if (action === 'reject') {
      invoice.workflow_status = 'rejected';
    } else if (action === 'hold') {
      invoice.workflow_status = 'on_hold';
    } else if (action === 'escalate') {
      invoice.workflow_status = 'pending_review';
    }

    await this.logAuditEvent({
      action: `INVOICE_${action.toUpperCase()}`,
      entity_type: 'invoice',
      entity_id: invoiceId,
      user_id: userId,
      reason,
      new_state: { workflow_status: invoice.workflow_status },
    });

    return await this.getInvoiceById(invoiceId);
  }

  // --- PAYMENTS ---
  static async getPayments() {
    return this.store.payments.map((p) => ({
      ...p,
      invoice: this.store.invoices.find((i) => i.id === p.invoice_id),
    }));
  }

  static async recordPayment(data: {
    invoice_id: string;
    amount: number;
    payment_method: any;
    payment_reference: string;
    bank_account_used?: string;
    notes?: string;
    userId: string;
  }) {
    const invoice = this.store.invoices.find((i) => i.id === data.invoice_id);
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.workflow_status !== 'ready_for_payment' && invoice.workflow_status !== 'partially_paid') {
      throw new Error(`Payment blocked: Invoice must be in "Ready for Payment" status (Current status: ${invoice.workflow_status}).`);
    }

    // Duplicate payment reference check
    const existingPayment = this.store.payments.find(
      (p) => p.payment_reference.trim().toLowerCase() === data.payment_reference.trim().toLowerCase()
    );
    if (existingPayment) {
      throw new Error(`Duplicate payment reference: Transaction "${data.payment_reference}" has already been processed.`);
    }

    if (data.amount > invoice.balance_due) {
      throw new Error(`Payment amount (₹${data.amount}) cannot exceed outstanding invoice balance (₹${invoice.balance_due}).`);
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      organization_id: this.store.organization.id,
      invoice_id: data.invoice_id,
      payment_reference: data.payment_reference,
      amount: data.amount,
      currency: invoice.currency,
      payment_method: data.payment_method,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      bank_account_used: data.bank_account_used || 'Corporate Main A/C',
      recorded_by_id: data.userId,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    this.store.payments.unshift(newPayment);

    // Update Invoice balance & status
    invoice.paid_amount += data.amount;
    invoice.balance_due -= data.amount;
    if (invoice.balance_due <= 0.01) {
      invoice.workflow_status = 'paid';
    } else {
      invoice.workflow_status = 'partially_paid';
    }

    // Update vendor total paid
    const vendor = this.store.vendors.find((v) => v.id === invoice.vendor_id);
    if (vendor) {
      vendor.total_amount_paid += data.amount;
    }

    await this.logAuditEvent({
      action: 'PAYMENT_RECORDED',
      entity_type: 'payment',
      entity_id: newPayment.id,
      user_id: data.userId,
      new_state: {
        invoice_id: invoice.id,
        amount: data.amount,
        reference: data.payment_reference,
        new_balance: invoice.balance_due,
      },
      reason: 'Controlled payment disbursement logged',
    });

    return newPayment;
  }

  // --- NOTIFICATIONS & AUDIT ---
  static async getNotifications(userId?: string) {
    return this.store.notifications;
  }

  static async markNotificationRead(id: string) {
    const notif = this.store.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
    return notif;
  }

  static async markAllNotificationsRead() {
    for (const notif of this.store.notifications) {
      notif.is_read = true;
    }
  }

  static async getAuditLogs() {
    return [...this.store.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  static async logAuditEvent(data: {
    action: string;
    entity_type: string;
    entity_id: string;
    user_id?: string;
    user_email?: string;
    old_state?: any;
    new_state?: any;
    reason?: string;
  }) {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: this.store.organization.id,
      user_id: data.user_id || 'system',
      user_email: data.user_email || (data.user_id ? 'user@acmeglobal.com' : 'system@invoiceguard.local'),
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      old_state: data.old_state || null,
      new_state: data.new_state || null,
      reason: data.reason || null,
      created_at: new Date().toISOString(),
    };
    this.store.auditLogs.unshift(newLog);
    return newLog;
  }

  static async getOrganizationMembers() {
    return this.store.members;
  }
}

