import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Landmark,
  FileSpreadsheet,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';

interface ProductPreviewProps {
  className?: string;
  compact?: boolean;
}

export function ProductPreview({ className = '', compact = false }: ProductPreviewProps) {
  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden text-left ${className}`}
    >
      {/* Window Title Bar */}
      <div className="bg-slate-900 px-4 py-3 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
            invoiceguard.app / inspection / inv-2026-0881
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Radar (8 Analyzers)
          </span>
        </div>
      </div>

      {/* Main Inspection View */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        {/* Invoice Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                  INV-2026-0881
                </span>
                <span className="text-xs font-medium text-slate-500">PO-8821 matched</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3 h-3" />
                  Hard-Stop Intercepted
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">Precision Metalworks Ltd.</h3>
              <p className="text-xs text-slate-500">Submitted today via Supplier Portal • Category: Heavy Equipment Parts</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">Disbursement Total</span>
              <div className="text-2xl font-extrabold text-slate-900">$17,700.00</div>
              <span className="text-xs text-slate-500">Net 30 • Due Oct 24, 2026</span>
            </div>
          </div>

          {/* Risk Scoring Metric Bar */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Calculated Risk Score: <span className="text-rose-600 font-bold">85 / 100</span> (Critical Exposure)
                </span>
                <span className="text-slate-500 font-medium">Explainable Model v2.4</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[20%]" />
                <div className="h-full bg-amber-500 w-[25%]" />
                <div className="h-full bg-rose-600 w-[40%]" />
                <div className="h-full bg-slate-200 w-[15%]" />
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Hold Policy:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Maker-Checker Block Active
              </span>
            </div>
          </div>
        </div>

        {/* 3 Real Flagged Detection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
          {/* Flag 1: Duplicate Match */}
          <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs hover:border-rose-300 transition-colors">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Duplicate Intercept</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">Fingerprint Match 99.4%</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SHA-256 payload & line items duplicate cleared invoice <span className="font-mono font-medium text-slate-800">#INV-2025-9941</span> paid 45 days prior.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-rose-700 font-medium">
              <span>Potential Loss: $17,700</span>
              <span className="underline cursor-pointer">Compare Diff</span>
            </div>
          </div>

          {/* Flag 2: Bank Mismatch */}
          <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs hover:border-rose-300 transition-colors">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Landmark className="w-4 h-4" />
              <span>Remittance Alert</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">Unverified Bank Account</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracted routing points to <span className="font-medium text-slate-800">Axis Bank ••••6544</span>. Master record lists verified <span className="font-medium text-slate-800">HDFC Bank ••••1102</span>.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-rose-700 font-medium">
              <span>BEC Suspected</span>
              <span className="underline cursor-pointer">Dual-Auth Required</span>
            </div>
          </div>

          {/* Flag 3: 3-Way Match PO Variance */}
          <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4" />
              <span>3-Way Match Variance</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">Line-Item Markup +20%</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Item #3 unit rate billed at $420.00 vs contractually approved PO unit rate of $350.00. Unapproved delta: +$1,400.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-medium">
              <span>GRN Qty Verified</span>
              <span className="underline cursor-pointer">PO Re-match</span>
            </div>
          </div>
        </div>

        {/* Action Bar / Maker-Checker Footer */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Automated Governance Active:</strong> Disbursement frozen until approved by Authorized CFO & AP Lead.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs text-center shadow-xs">
              Disbursement Held
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center border border-slate-700 cursor-pointer">
              View Audit Diff
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

