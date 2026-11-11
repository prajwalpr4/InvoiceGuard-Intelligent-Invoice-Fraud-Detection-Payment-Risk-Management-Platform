import crypto from 'crypto';
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
  InvoiceWorkflowStatus,
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
import { OCRExtractionPipeline, ExtractedInvoiceData } from '../ocr/extractor';
import { createAdminClient } from '@/lib/supabase/admin';

function getSupabase() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }
    return createAdminClient();
  } catch {
    return null;
  }
}

// In-memory state for development & instant-fallback caching
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
  extractions: InvoiceExtraction[] = [];

  constructor() {
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
    const invoices = await this.getInvoices();
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const pendingReview = invoices.filter(
      (inv) => inv.workflow_status === 'pending_review' || inv.workflow_status === 'draft'
    ).length;
    const onHold = invoices.filter((inv) => inv.workflow_status === 'on_hold').length;
    const pendingApproval = invoices.filter((inv) => inv.workflow_status === 'pending_approval').length;
    const approved = invoices.filter(
      (inv) => inv.workflow_status === 'approved' || inv.workflow_status === 'ready_for_payment'
    ).length;
    const rejected = invoices.filter((inv) => inv.workflow_status === 'rejected').length;
    const paid = invoices.filter(
      (inv) => inv.workflow_status === 'paid' || inv.workflow_status === 'partially_paid'
    ).length;
    const highRisk = invoices.filter((inv) => inv.risk_level === 'high').length;

    // Fraud metrics
    let duplicateFindingsCount = this.store.fraudFindings.filter((f) => f.category === 'duplicate').length;
    let bankMismatchesCount = this.store.fraudFindings.filter((f) => f.category === 'bank_account').length;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const [dupRes, bankRes] = await Promise.all([
          supabase.from('fraud_findings').select('id', { count: 'exact', head: true }).eq('category', 'duplicate'),
          supabase.from('fraud_findings').select('id', { count: 'exact', head: true }).eq('category', 'bank_account'),
        ]);
        if (dupRes.count !== null && dupRes.count !== undefined) duplicateFindingsCount = dupRes.count;
        if (bankRes.count !== null && bankRes.count !== undefined) bankMismatchesCount = bankRes.count;
      } catch {}
    }

    // Calculate potential exposure saved
    const potentialExposure = invoices
      .filter((inv) => inv.risk_level === 'high' && inv.workflow_status !== 'paid')
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

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
      duplicatesCaught: duplicateFindingsCount,
      bankMismatchesCaught: bankMismatchesCount,
      potentialExposure,
      currency: this.store.organization.currency,
    };
  }

  static async getDashboardAnalytics() {
    const invoices = await this.getInvoices();
    const vendors = await this.getVendors();

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
      const monthInvoices = invoices.filter((inv) => inv.invoice_date?.startsWith(key));
      return {
        month,
        count: monthInvoices.length,
        spend: monthInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0),
        flagged: monthInvoices.filter((i) => i.risk_level === 'high' || i.has_hard_stop).length,
      };
    });

    // 2. Risk Distribution
    const riskDistribution = [
      { name: 'Low Risk (0-29)', value: invoices.filter((i) => i.risk_level === 'low').length, color: '#16a34a' },
      { name: 'Medium Risk (30-59)', value: invoices.filter((i) => i.risk_level === 'medium').length, color: '#f59e0b' },
      { name: 'High Risk (60-100)', value: invoices.filter((i) => i.risk_level === 'high').length, color: '#dc2626' },
    ];

    // 3. Fraud Alerts by Category
    const categoryCounts: Record<string, number> = {};
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: findings } = await supabase.from('fraud_findings').select('category');
        if (findings) {
          for (const f of findings) {
            categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
          }
        }
      } catch {}
    } else {
      for (const f of this.store.fraudFindings) {
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
      }
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
    const vendorSpend = vendors.map((v) => ({
      vendorName: v.name.length > 20 ? v.name.substring(0, 18) + '...' : v.name,
      totalSpend: Number(v.total_amount_paid || 0),
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
  }): Promise<(Invoice & { vendor?: Vendor })[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('invoices').select('*, vendor:vendors(*)').order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('workflow_status', filters.status);
        }
        if (filters?.risk && filters.risk !== 'all') {
          query = query.eq('risk_level', filters.risk);
        }
        if (filters?.vendorId) {
          query = query.eq('vendor_id', filters.vendorId);
        }

        const { data, error } = await query;
        if (!error && data) {
          let results = data;
          if (filters?.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(
              (i: any) =>
                i.invoice_number?.toLowerCase().includes(q) ||
                i.vendor?.name?.toLowerCase().includes(q) ||
                i.department?.toLowerCase().includes(q)
            );
          }
          // Warm up cache
          this.store.invoices = results as Invoice[];
          return results as (Invoice & { vendor?: Vendor })[];
        }
      } catch (e) {
        console.error('Supabase getInvoices error:', e);
      }
    }

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

    return result.map((inv) => ({
      ...inv,
      vendor: this.store.vendors.find((v) => v.id === inv.vendor_id),
    }));
  }

  static async getInvoiceById(id: string): Promise<(Invoice & {
    vendor?: Vendor;
    purchase_order?: PurchaseOrder;
    findings?: FraudFinding[];
    risk_assessment?: RiskAssessment;
    files?: InvoiceFile[];
    file?: InvoiceFile;
    extraction?: InvoiceExtraction;
  }) | null> {
    const supabase = getSupabase();
    let invoice: Invoice | null = null;
    let vendor: Vendor | undefined = undefined;
    let purchase_order: PurchaseOrder | undefined = undefined;
    let findings: FraudFinding[] = [];
    let risk_assessment: RiskAssessment | undefined = undefined;
    let files: InvoiceFile[] = [];
    let extraction: InvoiceExtraction | undefined = undefined;

    if (supabase) {
      try {
        const { data: inv, error: invErr } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
        if (!invErr && inv) {
          invoice = inv as Invoice;

          const [vRes, poRes, fRes, raRes, filesRes, extRes] = await Promise.all([
            inv.vendor_id ? supabase.from('vendors').select('*').eq('id', inv.vendor_id).maybeSingle() : Promise.resolve({ data: null }),
            inv.po_id ? supabase.from('purchase_orders').select('*').eq('id', inv.po_id).maybeSingle() : Promise.resolve({ data: null }),
            supabase.from('fraud_findings').select('*').eq('invoice_id', id),
            supabase.from('risk_assessments').select('*').eq('invoice_id', id).maybeSingle(),
            supabase.from('invoice_files').select('*').eq('invoice_id', id),
            supabase.from('invoice_extractions').select('*').eq('invoice_id', id).maybeSingle(),
          ]);

          if (vRes.data) vendor = vRes.data as Vendor;
          if (poRes.data) purchase_order = poRes.data as PurchaseOrder;
          if (fRes.data) findings = fRes.data as FraudFinding[];
          if (raRes.data) risk_assessment = raRes.data as RiskAssessment;
          if (extRes.data) extraction = extRes.data as InvoiceExtraction;

          if (filesRes.data && filesRes.data.length > 0) {
            files = await Promise.all(
              filesRes.data.map(async (f: any) => {
                let signed_url = '';
                try {
                  const { data: sData } = await supabase.storage.from('invoice-files').createSignedUrl(f.file_path, 3600);
                  if (sData?.signedUrl) signed_url = sData.signedUrl;
                } catch {}
                return { ...f, signed_url } as InvoiceFile;
              })
            );
          }
        }
      } catch (e) {
        console.error('Supabase getInvoiceById error:', e);
      }
    }

    if (!invoice) {
      const fallbackInv = this.store.invoices.find((i) => i.id === id);
      if (!fallbackInv) return null;
      invoice = fallbackInv;
      vendor = this.store.vendors.find((v) => v.id === fallbackInv.vendor_id);
      purchase_order = this.store.purchaseOrders.find((p) => p.id === fallbackInv.po_id);
      findings = this.store.fraudFindings.filter((f) => f.invoice_id === fallbackInv.id);
      extraction = this.store.extractions.find((e) => e.invoice_id === fallbackInv.id);
    } else if (!extraction) {
      extraction = this.store.extractions.find((e) => e.invoice_id === id);
    }

    if (!risk_assessment) {
      risk_assessment = RiskScoringEngine.calculateRisk(
        invoice.id,
        this.store.organization.id,
        findings
      );
    }

    return {
      ...invoice,
      vendor,
      purchase_order,
      findings,
      risk_assessment,
      files,
      file: files.length > 0 ? files[0] : undefined,
      extraction,
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
    extracted_data?: Partial<ExtractedInvoiceData>;
    bank_details?: {
      account_number?: string;
      ifsc_code?: string;
      bank_name?: string;
    };
    file?: {
      buffer: Buffer;
      fileName: string;
      mimeType: string;
      fileSize: number;
      sha256?: string;
    };
  }): Promise<Invoice> {
    const id = crypto.randomUUID();
    const subtotal = Number(data.subtotal) || 0;
    const tax_amount = Number(data.tax_amount) || 0;
    const discount_amount = Number(data.discount_amount) || 0;
    const total_amount = Number(data.total_amount) || 0;

    const newInvoice: Invoice = {
      id,
      organization_id: this.store.organization.id,
      vendor_id: data.vendor_id || null,
      po_id: data.po_id || null,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date || null,
      currency: this.store.organization.currency,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      paid_amount: 0,
      balance_due: total_amount,
      department: data.department || 'Operations',
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

    const supabase = getSupabase();

    // 1. Persist invoice to Supabase PostgreSQL table first (so foreign keys for files/extractions/findings succeed)
    if (supabase) {
      try {
        const { error: invErr } = await supabase.from('invoices').insert({
          id: newInvoice.id,
          organization_id: newInvoice.organization_id,
          vendor_id: newInvoice.vendor_id,
          po_id: newInvoice.po_id,
          invoice_number: newInvoice.invoice_number,
          invoice_date: newInvoice.invoice_date,
          due_date: newInvoice.due_date,
          currency: newInvoice.currency,
          subtotal: newInvoice.subtotal,
          tax_amount: newInvoice.tax_amount,
          discount_amount: newInvoice.discount_amount,
          total_amount: newInvoice.total_amount,
          paid_amount: newInvoice.paid_amount,
          balance_due: newInvoice.balance_due,
          department: newInvoice.department,
          category: newInvoice.category,
          notes: newInvoice.notes,
          processing_status: newInvoice.processing_status,
          workflow_status: newInvoice.workflow_status,
          risk_score: newInvoice.risk_score,
          risk_level: newInvoice.risk_level,
          has_hard_stop: newInvoice.has_hard_stop,
          submitted_by_id: newInvoice.submitted_by_id,
          created_at: newInvoice.created_at,
          updated_at: newInvoice.updated_at,
        });

        if (invErr) {
          console.error('Supabase invoice insert error:', invErr);
        }
      } catch (dbErr) {
        console.error('Supabase invoice insert exception:', dbErr);
      }
    }

    // 2. If file uploaded, persist file binary into Supabase Storage and file metadata table
    if (supabase && data.file) {
      try {
        const fileSha256 = data.file.sha256 || crypto.createHash('sha256').update(data.file.buffer).digest('hex');
        const safeName = data.file.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `invoices/${id}/${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from('invoice-files')
          .upload(filePath, data.file.buffer, {
            contentType: data.file.mimeType,
            upsert: true,
          });

        if (!uploadErr) {
          const fileRecord: InvoiceFile = {
            id: crypto.randomUUID(),
            organization_id: this.store.organization.id,
            invoice_id: id,
            file_name: data.file.fileName,
            file_path: filePath,
            file_size: data.file.fileSize,
            mime_type: data.file.mimeType,
            sha256_hash: fileSha256,
            page_count: 1,
            created_at: new Date().toISOString(),
          };
          const { error: fileInsertErr } = await supabase.from('invoice_files').insert(fileRecord);
          if (fileInsertErr) {
            console.error('invoice_files insert error:', fileInsertErr);
          }
        } else {
          console.error('Storage upload failed:', uploadErr);
        }
      } catch (fileErr) {
        console.error('File storage error:', fileErr);
      }
    }

    // 3. Save structured OCR extraction metadata & raw text if present
    if (data.extracted_data || data.extracted_text) {
      const rawText = data.extracted_data?.raw_text || data.extracted_text || '';
      const parsedFallback = rawText ? OCRExtractionPipeline.parseInvoiceText(rawText) : undefined;
      const mergedExtraction: ExtractedInvoiceData = {
        ...parsedFallback,
        ...data.extracted_data,
        raw_text: rawText,
        overall_confidence:
          data.extracted_data?.overall_confidence ??
          parsedFallback?.overall_confidence ??
          0,
      };
      const formatted = OCRExtractionPipeline.formatForDatabase(id, mergedExtraction, {
        isVerified: true,
        verifiedById: data.submitted_by_id,
        sourceFileType: data.file?.mimeType,
      });

      this.store.extractions = this.store.extractions.filter((e) => e.invoice_id !== id);
      this.store.extractions.push(formatted);

      if (supabase) {
        try {
          const { error: extErr } = await supabase.from('invoice_extractions').insert({
            id: crypto.randomUUID(),
            invoice_id: id,
            raw_text: formatted.raw_text,
            extracted_fields: formatted.extracted_fields,
            overall_confidence: formatted.overall_confidence,
            is_verified_by_user: formatted.is_verified_by_user,
            verified_by_id: formatted.verified_by_id,
            verified_at: formatted.verified_at,
            created_at: formatted.created_at,
          });
          if (extErr) {
            console.error('invoice_extractions insert error:', extErr);
          }
        } catch (e) {
          console.error('invoice_extractions error:', e);
        }
      }
    }

    // Keep in-memory cache synchronized
    this.store.invoices.unshift(newInvoice);

    // 3. Run Fraud Detection Pipeline & persist findings/risk
    await this.runFraudAnalysis(newInvoice.id, data.bank_details);

    // 4. Log Audit Event in Supabase & memory
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
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('invoices')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.error('Supabase updateInvoice error:', e);
      }
    }

    const index = this.store.invoices.findIndex((i) => i.id === id);
    if (index !== -1) {
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
    }

    return await this.getInvoiceById(id);
  }

  static async runFraudAnalysis(
    invoiceId: string,
    extractedBank?: { account_number?: string; ifsc_code?: string; bank_name?: string }
  ) {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) return;

    const vendors = await this.getVendors();
    const vendor = vendors.find((v) => v.id === invoice.vendor_id);
    const bankAccounts = vendor?.bank_accounts || [];
    const purchaseOrders = await this.getPurchaseOrders();
    const purchaseOrder = purchaseOrders.find((p) => p.id === invoice.po_id);
    const goodsReceipts = await this.getGoodsReceipts();
    const relatedGRNs = goodsReceipts.filter((g) => g.po_id === invoice.po_id);
    const allInvoices = await this.getInvoices();

    // Run all 8 detection algorithms
    const findings = FraudDetectionEngine.runAllChecks({
      invoice,
      vendor,
      bankAccounts,
      purchaseOrder,
      goodsReceipts: relatedGRNs,
      historicalInvoices: allInvoices,
      allVendors: vendors,
      allBankAccounts: bankAccounts,
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

    let newStatus: InvoiceWorkflowStatus = invoice.workflow_status;
    if (assessment.has_hard_stop) {
      newStatus = 'on_hold';
    } else if (invoice.risk_level === 'high') {
      newStatus = 'pending_review';
    } else if (invoice.workflow_status === 'draft') {
      newStatus = 'pending_approval';
    }
    invoice.workflow_status = newStatus;

    // Persist to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Delete old findings
        await supabase.from('fraud_findings').delete().eq('invoice_id', invoiceId);

        // Insert new findings
        if (findings.length > 0) {
          await supabase.from('fraud_findings').insert(
            findings.map((f) => ({
              id: crypto.randomUUID(),
              organization_id: this.store.organization.id,
              invoice_id: invoiceId,
              rule_code: f.rule_code,
              rule_name: f.rule_name,
              category: f.category,
              severity: f.severity,
              is_hard_stop: f.is_hard_stop,
              evidence: f.evidence,
              created_at: new Date().toISOString(),
            }))
          );
        }

        // Upsert risk assessment
        await supabase.from('risk_assessments').upsert(
          {
            id: crypto.randomUUID(),
            organization_id: this.store.organization.id,
            invoice_id: invoiceId,
            risk_score: assessment.risk_score,
            risk_level: assessment.risk_level,
            has_hard_stop: assessment.has_hard_stop,
            score_breakdown: assessment.score_breakdown,
            explanation: assessment.explanation,
            recommended_action: assessment.recommended_action,
            evaluated_at: new Date().toISOString(),
          },
          { onConflict: 'invoice_id' }
        );

        // Update invoice risk metadata and workflow status
        await supabase
          .from('invoices')
          .update({
            risk_score: assessment.risk_score,
            risk_level: assessment.risk_level,
            has_hard_stop: assessment.has_hard_stop,
            workflow_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);
      } catch (e) {
        console.error('Supabase fraud analysis persistence error:', e);
      }
    }

    if (assessment.has_hard_stop) {
      // Generate In-App Alert in Supabase & memory
      await this.createNotification({
        user_id: '0821301e-9a4a-41cc-b6f4-0cd663e91cf3',
        title: `Critical Alert: Invoice ${invoice.invoice_number} Placed on Hold`,
        message: assessment.explanation,
        type: 'alert',
        entity_type: 'invoice',
        entity_id: invoice.id,
        link_url: `/app/invoices/${invoice.id}`,
      });
    }

    return assessment;
  }

  // --- VENDORS ---
  static async getVendors(): Promise<Vendor[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: vList, error } = await supabase
          .from('vendors')
          .select('*, bank_accounts:vendor_bank_accounts(*)')
          .order('created_at', { ascending: false });

        if (!error && vList) {
          this.store.vendors = vList as Vendor[];
          return vList as Vendor[];
        }
      } catch (e) {
        console.error('Supabase getVendors error:', e);
      }
    }

    return this.store.vendors.map((v) => ({
      ...v,
      bank_accounts: this.store.bankAccounts.filter((ba) => ba.vendor_id === v.id),
    }));
  }

  static async getVendorById(id: string): Promise<(Vendor & {
    bank_accounts?: VendorBankAccount[];
    invoices?: Invoice[];
    purchase_orders?: PurchaseOrder[];
  }) | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: vendor, error } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
        if (!error && vendor) {
          const [baRes, invRes, poRes] = await Promise.all([
            supabase.from('vendor_bank_accounts').select('*').eq('vendor_id', id),
            supabase.from('invoices').select('*').eq('vendor_id', id),
            supabase.from('purchase_orders').select('*').eq('vendor_id', id),
          ]);
          return {
            ...vendor,
            bank_accounts: baRes.data || [],
            invoices: invRes.data || [],
            purchase_orders: poRes.data || [],
          } as Vendor;
        }
      } catch (e) {
        console.error('Supabase getVendorById error:', e);
      }
    }

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
    const id = crypto.randomUUID();
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

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: vErr } = await supabase.from('vendors').insert(newVendor);
        if (vErr) console.error('Supabase vendor insert error:', vErr);

        if (data.account_number && data.ifsc_code) {
          const { error: bErr } = await supabase.from('vendor_bank_accounts').insert({
            id: crypto.randomUUID(),
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
          if (bErr) console.error('Supabase bank account insert error:', bErr);
        }
      } catch (e) {
        console.error('Supabase createVendor exception:', e);
      }
    }

    this.store.vendors.push(newVendor);

    if (data.account_number && data.ifsc_code) {
      this.store.bankAccounts.push({
        id: crypto.randomUUID(),
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
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('vendors')
          .update({
            verification_status: 'verified',
            risk_tier: 'low',
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (e) {
        console.error('Supabase verifyVendor error:', e);
      }
    }

    const vendor = this.store.vendors.find((v) => v.id === id);
    if (vendor) {
      vendor.verification_status = 'verified';
      vendor.risk_tier = 'low';
      vendor.status = 'active';
    }

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
  static async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, vendor:vendors(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          this.store.purchaseOrders = data as PurchaseOrder[];
          return data as PurchaseOrder[];
        }
      } catch (e) {
        console.error('Supabase getPurchaseOrders error:', e);
      }
    }

    return this.store.purchaseOrders.map((po) => ({
      ...po,
      vendor: this.store.vendors.find((v) => v.id === po.vendor_id),
    }));
  }

  static async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('goods_receipts')
          .select('*, purchase_order:purchase_orders(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          this.store.goodsReceipts = data as GoodsReceipt[];
          return data as GoodsReceipt[];
        }
      } catch (e) {
        console.error('Supabase getGoodsReceipts error:', e);
      }
    }

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
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    // Segregation of Duties Enforcement: Submitter cannot approve
    if (invoice.submitted_by_id === userId && action === 'approve') {
      throw new Error('Maker-Checker Violation: Invoice submitter is prohibited from approving their own invoice.');
    }

    let newStatus: InvoiceWorkflowStatus = invoice.workflow_status;
    if (action === 'approve') {
      newStatus = 'ready_for_payment';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'hold') {
      newStatus = 'on_hold';
    } else if (action === 'escalate') {
      newStatus = 'pending_review';
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('invoices')
          .update({ workflow_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', invoiceId);
      } catch (e) {
        console.error('Supabase recordApprovalDecision error:', e);
      }
    }

    const storeInvoice = this.store.invoices.find((i) => i.id === invoiceId);
    if (storeInvoice) {
      storeInvoice.workflow_status = newStatus;
    }

    await this.logAuditEvent({
      action: `INVOICE_${action.toUpperCase()}`,
      entity_type: 'invoice',
      entity_id: invoiceId,
      user_id: userId,
      reason,
      new_state: { workflow_status: newStatus },
    });

    return await this.getInvoiceById(invoiceId);
  }

  // --- PAYMENTS ---
  static async getPayments(): Promise<PaymentRecord[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('payment_records')
          .select('*, invoice:invoices(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          this.store.payments = data as PaymentRecord[];
          return data as PaymentRecord[];
        }
      } catch (e) {
        console.error('Supabase getPayments error:', e);
      }
    }

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
    const invoice = await this.getInvoiceById(data.invoice_id);
    if (!invoice) throw new Error('Invoice not found');

    if (invoice.workflow_status !== 'ready_for_payment' && invoice.workflow_status !== 'partially_paid') {
      throw new Error(`Payment blocked: Invoice must be in "Ready for Payment" status (Current status: ${invoice.workflow_status}).`);
    }

    // Duplicate payment reference check
    const supabase = getSupabase();
    if (supabase) {
      const { data: existingRef } = await supabase
        .from('payment_records')
        .select('id')
        .ilike('payment_reference', data.payment_reference.trim())
        .maybeSingle();
      if (existingRef) {
        throw new Error(`Duplicate payment reference: Transaction "${data.payment_reference}" has already been processed.`);
      }
    } else {
      const existingPayment = this.store.payments.find(
        (p) => p.payment_reference.trim().toLowerCase() === data.payment_reference.trim().toLowerCase()
      );
      if (existingPayment) {
        throw new Error(`Duplicate payment reference: Transaction "${data.payment_reference}" has already been processed.`);
      }
    }

    if (data.amount > invoice.balance_due) {
      throw new Error(`Payment amount (₹${data.amount}) cannot exceed outstanding invoice balance (₹${invoice.balance_due}).`);
    }

    const paymentId = crypto.randomUUID();
    const paymentDate = new Date().toISOString().split('T')[0];
    const newPayment: PaymentRecord = {
      id: paymentId,
      organization_id: this.store.organization.id,
      invoice_id: data.invoice_id,
      payment_reference: data.payment_reference,
      amount: data.amount,
      currency: invoice.currency,
      payment_method: data.payment_method,
      payment_date: paymentDate,
      status: 'completed',
      bank_account_used: data.bank_account_used || 'Corporate Main A/C',
      recorded_by_id: data.userId,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    const newPaidAmount = Number((Number(invoice.paid_amount || 0) + data.amount).toFixed(2));
    const newBalanceDue = Number((Number(invoice.balance_due || 0) - data.amount).toFixed(2));
    const newStatus: InvoiceWorkflowStatus = newBalanceDue <= 0.01 ? 'paid' : 'partially_paid';

    if (supabase) {
      try {
        await supabase.from('payment_records').insert(newPayment);
        await supabase
          .from('invoices')
          .update({
            paid_amount: newPaidAmount,
            balance_due: newBalanceDue,
            workflow_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.invoice_id);

        if (invoice.vendor_id) {
          const { data: vData } = await supabase
            .from('vendors')
            .select('total_amount_paid')
            .eq('id', invoice.vendor_id)
            .maybeSingle();
          const currentPaid = Number(vData?.total_amount_paid || 0);
          await supabase
            .from('vendors')
            .update({
              total_amount_paid: currentPaid + data.amount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invoice.vendor_id);
        }
      } catch (e) {
        console.error('Supabase recordPayment error:', e);
      }
    }

    this.store.payments.unshift(newPayment);
    const storeInv = this.store.invoices.find((i) => i.id === data.invoice_id);
    if (storeInv) {
      storeInv.paid_amount = newPaidAmount;
      storeInv.balance_due = newBalanceDue;
      storeInv.workflow_status = newStatus;
    }
    const storeVendor = this.store.vendors.find((v) => v.id === invoice.vendor_id);
    if (storeVendor) {
      storeVendor.total_amount_paid = (storeVendor.total_amount_paid || 0) + data.amount;
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
        new_balance: newBalanceDue,
      },
      reason: 'Controlled payment disbursement logged',
    });

    return newPayment;
  }

  // --- NOTIFICATIONS & AUDIT ---
  static async getNotifications(userId?: string): Promise<Notification[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) {
          this.store.notifications = data as Notification[];
          return data as Notification[];
        }
      } catch (e) {
        console.error('Supabase getNotifications error:', e);
      }
    }
    return this.store.notifications;
  }

  static async createNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    entity_type?: 'invoice' | 'vendor' | 'approval' | 'payment' | 'user';
    entity_id?: string;
    link_url?: string;
  }) {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      organization_id: this.store.organization.id,
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      link_url: data.link_url,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('notifications').insert(newNotif);
      } catch (e) {
        console.error('Supabase createNotification error:', e);
      }
    }

    this.store.notifications.unshift(newNotif);
    return newNotif;
  }

  static async markNotificationRead(id: string) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.error('Supabase markNotificationRead error:', e);
      }
    }
    const notif = this.store.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
    return notif;
  }

  static async markAllNotificationsRead() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      } catch (e) {
        console.error('Supabase markAllNotificationsRead error:', e);
      }
    }
    for (const notif of this.store.notifications) {
      notif.is_read = true;
    }
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data) {
          this.store.auditLogs = data as AuditLog[];
          return data as AuditLog[];
        }
      } catch (e) {
        console.error('Supabase getAuditLogs error:', e);
      }
    }

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
    const id = crypto.randomUUID();
    const newLog: AuditLog = {
      id,
      organization_id: this.store.organization.id,
      user_id: data.user_id || '0821301e-9a4a-41cc-b6f4-0cd663e91cf3',
      user_email: data.user_email || (data.user_id ? 'user@invoiceguard.local' : 'system@invoiceguard.local'),
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      old_state: data.old_state || null,
      new_state: data.new_state || null,
      reason: data.reason || null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('audit_logs').insert(newLog);
      } catch (e) {
        console.error('Supabase logAuditEvent error:', e);
      }
    }

    this.store.auditLogs.unshift(newLog);
    return newLog;
  }

  static async getOrganizationMembers() {
    return this.store.members;
  }
}
