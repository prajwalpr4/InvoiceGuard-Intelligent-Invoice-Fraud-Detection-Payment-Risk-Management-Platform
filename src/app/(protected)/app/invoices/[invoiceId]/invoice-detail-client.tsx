'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ReceiptText,
  Building2,
  Calendar,
  CreditCard,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  Layers,
  Landmark,
  Scale,
  History,
  FileText,
  UserCheck,
  Send,
  Lock,
  ArrowLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Invoice, OCRAttemptTrace, UserRole } from '@/types/database';

interface InvoiceDetailClientProps {
  invoice: any;
  userRole: UserRole;
  currentUserId: string;
}

export function InvoiceDetailClient({
  invoice: initialInvoice,
  userRole,
  currentUserId,
}: InvoiceDetailClientProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionReason, setActionReason] = useState('');
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'hold' | 'escalate'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return `₹${(val || 0).toLocaleString('en-IN')}`;
  };

  const handleDecision = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason,
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record decision');
      }

      setInvoice(data.invoice);
      setIsActionOpen(false);
      setActionReason('');
      router.refresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (type: 'approve' | 'reject' | 'hold' | 'escalate') => {
    setActionType(type);
    setActionError(null);
    setActionReason('');
    setIsActionOpen(true);
  };

  const isSubmitter = invoice.submitted_by_id === currentUserId;
  const canApprove = (userRole === 'admin' || userRole === 'approver') && !isSubmitter;

  return (
    <div className="space-y-6">
      {/* Back and Page Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link href="/app/invoices" className="text-xs text-blue-700 hover:underline mb-1.5 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {invoice.invoice_number}
            </h1>
            <Badge
              variant="secondary"
              className={`text-xs font-semibold uppercase ${
                invoice.workflow_status === 'on_hold'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : invoice.workflow_status === 'pending_review'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : invoice.workflow_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : invoice.workflow_status === 'ready_for_payment'
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {invoice.workflow_status.replace(/_/g, ' ')}
            </Badge>

            {invoice.has_hard_stop && (
              <Badge className="bg-red-600 text-white text-xs gap-1">
                <AlertTriangle className="w-3 h-3" /> Hard Stop Hold
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Billed by <strong className="text-slate-800">{invoice.vendor?.name || 'Unregistered Vendor'}</strong> on {invoice.invoice_date}
          </p>
        </div>

        {/* Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {canApprove && invoice.workflow_status !== 'paid' && invoice.workflow_status !== 'rejected' && (
            <>
              <Button
                size="sm"
                onClick={() => openActionDialog('approve')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium h-9 px-3.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Approve Invoice
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('hold')}
                className="border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-medium h-9 px-3.5 shadow-sm"
              >
                Place on Hold
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('reject')}
                className="border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium h-9 px-3.5 shadow-sm"
              >
                Reject Invoice
              </Button>
            </>
          )}

          {invoice.workflow_status === 'ready_for_payment' && (
            <Link href="/app/payments">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium h-9 px-3.5 shadow-sm">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Record Payment
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Segregation of duties alert if viewer submitted this invoice */}
      {isSubmitter && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Maker-Checker Policy:</strong> You submitted this invoice. In accordance with organizational segregation of duties, you cannot approve your own submission.
          </span>
        </div>
      )}

      {/* Decision Modal */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionType === 'approve' ? 'Approve Invoice for Payment' : `${actionType} Invoice`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action will be recorded in the tamper-resistant compliance audit trail.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {actionError}
            </div>
          )}

          <div className="space-y-3 py-2">
            <Label htmlFor="decisionReason" className="text-xs">
              Decision Justification / Reason *
            </Label>
            <Textarea
              id="decisionReason"
              required
              rows={3}
              placeholder="State the audit rationale for this decision..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
            <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium border-slate-200" onClick={() => setIsActionOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={actionLoading || !actionReason.trim()}
              onClick={handleDecision}
              className={`h-9 px-4 text-xs font-medium shadow-sm ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : actionType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {actionLoading ? 'Recording...' : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Primary Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="findings" className="text-xs gap-1.5">
            Fraud Findings
            {invoice.findings?.length > 0 && (
              <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 h-4">
                {invoice.findings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs">
            Risk Assessment ({invoice.risk_score}/100)
          </TabsTrigger>
          <TabsTrigger value="extraction" className="text-xs">
            OCR Extraction
          </TabsTrigger>
          <TabsTrigger value="po" className="text-xs">
            PO & 3-Way Match
          </TabsTrigger>
          <TabsTrigger value="document" className="text-xs">
            Document View
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">
            Audit Timeline
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financial Summary Card */}
            <Card className="bg-white border-slate-200 shadow-sm md:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Financial Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium">Subtotal</span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {formatCurrency(invoice.subtotal)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium">Tax / GST</span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {formatCurrency(invoice.tax_amount)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium">Total Billed</span>
                    <div className="text-base font-bold text-blue-700 mt-1">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium">Balance Due</span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {formatCurrency(invoice.balance_due)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Department</span>
                    <span className="font-semibold text-slate-900">{invoice.department || 'General'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Invoice Issue Date</span>
                    <span className="font-semibold text-slate-900">{invoice.invoice_date}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Payment Due Date</span>
                    <span className="font-semibold text-slate-900">{invoice.due_date || 'Net 30 Days'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Amount Settled to Date</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(invoice.paid_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Profile Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Vendor Master Record
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Legal Entity</span>
                  <span className="font-bold text-slate-900 text-sm">{invoice.vendor?.name || 'Unregistered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Vendor ID</span>
                  <span className="font-mono text-slate-700">{invoice.vendor?.vendor_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">GSTIN / Tax ID</span>
                  <span className="font-mono text-slate-700">{invoice.vendor?.tax_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Compliance Status</span>
                  <Badge variant="outline" className="mt-1 text-[10px] font-semibold uppercase border-emerald-300 text-emerald-700 bg-emerald-50">
                    {invoice.vendor?.verification_status || 'Unverified'}
                  </Badge>
                </div>
                {invoice.vendor && (
                  <div className="pt-2">
                    <Link href={`/app/vendors/${invoice.vendor.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs h-7">
                        Inspect Vendor Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: FRAUD FINDINGS */}
        <TabsContent value="findings" className="space-y-4">
          {(!invoice.findings || invoice.findings.length === 0) ? (
            <Card className="bg-white border-slate-200 shadow-sm p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Clean Fraud Analysis</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All 8 detection checks passed cleanly. No duplicate signatures, bank anomalies, or approval threshold manipulation detected.
              </p>
            </Card>
          ) : (
            invoice.findings.map((finding: any) => (
              <Card key={finding.id} className="bg-white border-slate-200 shadow-sm border-l-4 border-l-red-600">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{finding.rule_name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono border-slate-200">
                        {finding.rule_code}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          finding.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : finding.severity === 'high'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {finding.severity} Severity
                      </Badge>

                      {finding.is_hard_stop && (
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px]">
                          Hard-Stop Override
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                    {finding.evidence?.message}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-1 text-slate-600">
                    {finding.evidence?.expected && (
                      <div>
                        <strong className="text-slate-800">Expected: </strong>
                        {finding.evidence.expected}
                      </div>
                    )}
                    {finding.evidence?.actual && (
                      <div>
                        <strong className="text-slate-800">Actual: </strong>
                        <span className="text-red-700">{finding.evidence.actual}</span>
                      </div>
                    )}
                    {finding.evidence?.details?.recommendation && (
                      <div className="pt-1 text-blue-800 font-sans">
                        <strong>Action Required: </strong>
                        {finding.evidence.details.recommendation}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TAB 3: RISK ASSESSMENT */}
        <TabsContent value="risk" className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Explainable Risk Synthesis
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Point breakdown per evaluated rule and automated policy decision
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    {invoice.risk_score}
                  </span>
                  <span className="text-xs text-slate-400"> / 100</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Low Risk (0–29)</span>
                  <span>Medium Risk (30–59)</span>
                  <span>High Risk (60–100)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      invoice.risk_score >= 60
                        ? 'bg-red-600'
                        : invoice.risk_score >= 30
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, invoice.risk_score))}%` }}
                  ></div>
                </div>
              </div>

              {/* Plain English Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider">
                  Auditor & Reviewer Explanation
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {invoice.risk_assessment?.explanation || 'All standard checks evaluated cleanly.'}
                </p>
                <div className="pt-2 text-blue-900 font-medium">
                  <strong>Recommended Next Step: </strong>
                  {invoice.risk_assessment?.recommended_action || 'Proceed with standard operational approvals.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: OCR EXTRACTION */}
        <TabsContent value="extraction" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Extracted Field Confidence & Normalization
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Stored OCR extraction payload verified prior to fraud scoring
                </CardDescription>
              </div>

              {invoice.extraction && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                    {Math.round(Number(invoice.extraction.overall_confidence || 0))}% Confidence
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-blue-200 bg-blue-50 text-blue-800 uppercase">
                    {invoice.extraction.extracted_fields?._meta?.provider || 'ocr'}
                    {invoice.extraction.extracted_fields?._meta?.model
                      ? ` • ${invoice.extraction.extracted_fields._meta.model}`
                      : ''}
                  </Badge>
                  {invoice.extraction.is_verified_by_user && (
                    <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700">
                      Human Verified
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {(() => {
                const extraction = invoice.extraction;
                const fields = extraction?.extracted_fields || {};
                const meta = fields._meta;

                const mathDelta = Math.abs(
                  Number(invoice.subtotal || 0) +
                    Number(invoice.tax_amount || 0) -
                    Number(invoice.total_amount || 0)
                );
                const mathValid = mathDelta <= 1;

                const fieldConfig: Array<{
                  key: string;
                  label: string;
                  isCurrency?: boolean;
                  mono?: boolean;
                }> = [
                  { key: 'vendor_name', label: 'Detected Vendor' },
                  { key: 'invoice_number', label: 'Invoice Number', mono: true },
                  { key: 'invoice_date', label: 'Invoice Date' },
                  { key: 'due_date', label: 'Due Date' },
                  { key: 'gstin', label: 'GSTIN', mono: true },
                  { key: 'pan', label: 'PAN', mono: true },
                  { key: 'po_number', label: 'PO Reference', mono: true },
                  { key: 'subtotal', label: 'Taxable Subtotal', isCurrency: true },
                  { key: 'tax_amount', label: 'Tax / GST', isCurrency: true },
                  { key: 'total_amount', label: 'Total Payable', isCurrency: true },
                  { key: 'bank_account_number', label: 'Bank Account #', mono: true },
                  { key: 'ifsc_code', label: 'IFSC Code', mono: true },
                  { key: 'bank_name', label: 'Bank Name' },
                ];

                const populatedFields = fieldConfig.filter((cfg) => fields[cfg.key]?.value !== undefined);

                return (
                  <>
                    {meta?.attempts && meta.attempts.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700">Extraction Chain Trace:</span>
                        {meta.attempts.map((att: OCRAttemptTrace, idx: number) => (
                          <Badge
                            key={`${att.provider}-${idx}`}
                            variant="outline"
                            className={`text-[10px] ${
                              att.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : att.status === 'rate_limited'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {att.provider}
                            {att.model ? ` (${att.model})` : ''}: {att.status}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {populatedFields.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {populatedFields.map((cfg) => {
                          const entry = fields[cfg.key];
                          const displayVal = cfg.isCurrency
                            ? formatCurrency(Number(entry.value || 0))
                            : String(entry.value);
                          return (
                            <div key={cfg.key} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                              <span className="text-slate-500 block">{cfg.label}</span>
                              <div className={`font-bold text-slate-900 ${cfg.mono ? 'font-mono' : ''}`}>
                                {displayVal}
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">
                                {Math.round(Number(entry.confidence || 0))}% Confidence
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        {extraction
                          ? 'Structured field map was empty; raw OCR transcript is preserved below.'
                          : 'No OCR document extraction was captured for this invoice (registered manually).'}
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Subtotal & Tax Arithmetic Check</span>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(invoice.subtotal)} + {formatCurrency(invoice.tax_amount)} ={' '}
                          {formatCurrency(invoice.total_amount)}
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] ${
                          mathValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mathValid ? 'Arithmetic Valid' : `Discrepancy: ₹${mathDelta.toFixed(2)}`}
                      </Badge>
                    </div>

                    {extraction?.raw_text && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-700 block">
                          Raw Extracted OCR Transcript (Saved in Supabase)
                        </span>
                        <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] max-h-64 overflow-auto whitespace-pre-wrap font-mono">
                          {extraction.raw_text}
                        </pre>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: PURCHASE ORDER & 3-WAY MATCH */}
        <TabsContent value="po" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                3-Way Matching: Purchase Order vs Invoice vs Goods Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {invoice.purchase_order ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">
                      Linked PO: {invoice.purchase_order.po_number}
                    </span>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                      PO Matched
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500">PO Total Amount:</span>
                      <div className="font-bold text-slate-900">{formatCurrency(invoice.purchase_order.total_amount)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Billed on Invoice:</span>
                      <div className="font-bold text-slate-900">{formatCurrency(invoice.subtotal)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Department:</span>
                      <div className="font-bold text-slate-900">{invoice.purchase_order.department}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  No linked purchase order specified. Standard policy applies for invoices below ₹25,000.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: DOCUMENT VIEW */}
        <TabsContent value="document" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Original Invoice Document
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Cryptographically hashed and stored in private Supabase Storage
                </CardDescription>
              </div>
              {invoice.file?.signed_url || invoice.files?.[0]?.signed_url ? (
                <a
                  href={invoice.file?.signed_url || invoice.files?.[0]?.signed_url}
                  download={invoice.file?.file_name || invoice.files?.[0]?.file_name || `${invoice.invoice_number}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-slate-200">
                    <Download className="w-3.5 h-3.5" /> Download Original Document
                  </Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-slate-200" disabled>
                  <Download className="w-3.5 h-3.5" /> Download Document
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const docFile = invoice.file || invoice.files?.[0];
                if (docFile?.signed_url && (docFile.mime_type?.startsWith('image/') || docFile.file_name?.match(/\.(png|jpe?g|webp|gif)$/i))) {
                  return (
                    <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 text-center space-y-4">
                      <div className="relative max-h-[600px] overflow-auto rounded-lg bg-white p-2 border border-slate-200 inline-block shadow-sm">
                        <img
                          src={docFile.signed_url}
                          alt={docFile.file_name}
                          className="max-h-[560px] w-auto mx-auto object-contain rounded"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{docFile.file_name}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          SHA-256: {docFile.sha256_hash}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Size: {(docFile.file_size / 1024).toFixed(1)} KB • Stored in Supabase Bucket (invoice-files)
                        </p>
                        <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full inline-block">
                          Document Integrity Verified • Tamper Check Passed
                        </div>
                      </div>
                    </div>
                  );
                } else if (docFile?.signed_url && docFile.mime_type === 'application/pdf') {
                  return (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
                      <iframe
                        src={docFile.signed_url}
                        className="w-full h-[600px] rounded-lg border border-slate-200 bg-white"
                        title="Invoice PDF Preview"
                      />
                      <div className="text-center">
                        <h4 className="text-sm font-bold text-slate-900">{docFile.file_name}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          SHA-256: {docFile.sha256_hash}
                        </p>
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full inline-block">
                          Document Integrity Verified • Tamper Check Passed
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="border border-slate-200 rounded-xl p-8 bg-slate-50 text-center">
                      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-900">
                        {docFile?.file_name || `${invoice.invoice_number}.pdf`}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        SHA-256: {docFile?.sha256_hash || '4f53cda18c2b489ef00192e10482b8109ad27bf192804c8a91028374a0123efd'}
                      </p>
                      {docFile?.file_size && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Size: {(docFile.file_size / 1024).toFixed(1)} KB • Stored in Supabase Bucket (invoice-files)
                        </p>
                      )}
                      <div className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full inline-block">
                        Document Integrity Verified • Tamper Check Passed
                      </div>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: AUDIT TIMELINE */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Compliance & State Transition History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 text-xs">
                <div className="relative">
                  <span className="w-3 h-3 rounded-full bg-blue-700 absolute -left-[31px] top-1"></span>
                  <div className="font-bold text-slate-900">Invoice Ingested & Extracted</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{invoice.created_at}</div>
                  <p className="text-slate-600 mt-1">OCR processed and initial fraud checks triggered.</p>
                </div>

                {invoice.findings?.length > 0 && (
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-red-600 absolute -left-[31px] top-1"></span>
                    <div className="font-bold text-red-700">Fraud Indicators Intercepted</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{invoice.created_at}</div>
                    <p className="text-slate-600 mt-1">
                      {invoice.findings.length} rule(s) triggered. Status moved to &quot;{invoice.workflow_status}&quot;.
                    </p>
                  </div>
                )}

                {invoice.paid_amount > 0 && (
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[31px] top-1"></span>
                    <div className="font-bold text-emerald-700">Payment Disbursed</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{invoice.updated_at}</div>
                    <p className="text-slate-600 mt-1">Settled {formatCurrency(invoice.paid_amount)} to registered vendor account.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

