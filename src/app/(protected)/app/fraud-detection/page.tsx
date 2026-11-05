import { InvoiceGuardRepository } from '@/lib/data/repository';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  AlertTriangle,
  Layers,
  Landmark,
  Coins,
  Building2,
  Scale,
  FileCheck2,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Fraud Detection Engine — 8 Modular Analyzers',
};

export default async function FraudDetectionPage() {
  const summary = await InvoiceGuardRepository.getDashboardSummary();
  const invoices = await InvoiceGuardRepository.getInvoices();
  const flaggedInvoices = invoices.filter((i) => i.risk_level === 'high' || i.has_hard_stop);

  const modules = [
    {
      code: 'RULE_DUPLICATE_EXACT',
      name: 'Duplicate Invoice Detection',
      desc: 'Detects SHA-256 file hash matches, identical vendor + invoice #, and resubmissions of already settled claims.',
      weight: '40 pts',
      hardStop: true,
      icon: Layers,
    },
    {
      code: 'RULE_BANK_MISMATCH',
      name: 'Bank Account Mismatch Safeguard',
      desc: 'Flags unlisted payment accounts on invoice differing from verified vendor master records. Requires maker-checker clearance.',
      weight: '35 pts',
      hardStop: true,
      icon: Landmark,
    },
    {
      code: 'RULE_INVOICE_SPLITTING',
      name: 'Invoice Splitting & Threshold Manipulation',
      desc: 'Detects multiple invoices within a 7-day rolling window clustering just below ₹1,00,000 executive approval limits.',
      weight: '20 pts',
      hardStop: false,
      icon: Coins,
    },
    {
      code: 'RULE_SUSPICIOUS_VENDOR',
      name: 'Suspicious & Clone Vendor Profiling',
      desc: 'Identifies unverified suppliers, dormant vendors with sudden surges, and shared tax IDs (GSTIN/PAN) across vendor records.',
      weight: '15 pts',
      hardStop: true,
      icon: Building2,
    },
    {
      code: 'RULE_PO_MISMATCH',
      name: 'Purchase Order Variance Checks',
      desc: 'Validates line items, quantities, and flags invoices exceeding approved PO ceiling limits by >5%.',
      weight: '15 pts',
      hardStop: false,
      icon: Scale,
    },
    {
      code: 'RULE_THREE_WAY_MATCH',
      name: 'Three-Way Matching (PO - Invoice - GRN)',
      desc: 'Cross-validates billed line item quantities against physically inspected warehouse goods receipt notes (GRN).',
      weight: '20 pts',
      hardStop: true,
      icon: FileCheck2,
    },
    {
      code: 'RULE_AMOUNT_ANOMALY',
      name: 'Statistical Transaction Anomaly (Z-Score)',
      desc: 'Evaluates vendor historical distribution to identify abnormal transaction amounts (> 3 standard deviations from mean).',
      weight: '15 pts',
      hardStop: false,
      icon: TrendingDown,
    },
    {
      code: 'RULE_TAX_VALIDATION',
      name: 'Tax Format & Math Consistency Checks',
      desc: 'Performs checksum validation on GSTIN/PAN and verifies Subtotal + CGST/SGST/IGST equals Total Billed.',
      weight: '10 pts',
      hardStop: false,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Intelligent Fraud Detection Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            8 independently testable fraud analyzers running automated continuous telemetry on all incoming billing files.
          </p>
        </div>

        <Link href="/app/fraud-rules">
          <Button variant="outline" className="border-slate-200 text-xs h-9 px-4 font-medium">
            Configure Rule Weights & Thresholds
          </Button>
        </Link>
      </div>

      {/* Active Interceptions Banner */}
      {flaggedInvoices.length > 0 ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">
                {flaggedInvoices.length} High-Risk Invoices Currently Intercepted
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Hard-stop hold policies prevented ₹{summary.potentialExposure.toLocaleString()} in potential unverified disbursements.
              </p>
            </div>
          </div>

          <Link href="/app/review-queue">
            <Button size="sm" className="bg-red-700 hover:bg-red-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              Open Review Queue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                All Systems Secure — No Active Fraud Holds
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                All 8 detection modules are active and continuously monitoring incoming invoice streams.
              </p>
            </div>
          </div>
          <Link href="/app/invoices/new">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium h-9 px-4 shadow-sm">
              Upload Invoice
            </Button>
          </Link>
        </div>
      )}

      {/* 8 Detection Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Active Detection Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Card key={m.code} className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-200">
                      {m.weight}
                    </Badge>
                    {m.hardStop && (
                      <span className="text-[9px] font-bold text-red-600 uppercase">Hard-Stop</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{m.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

