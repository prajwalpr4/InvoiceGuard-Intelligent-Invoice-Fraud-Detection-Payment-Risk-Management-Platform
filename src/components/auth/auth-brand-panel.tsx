import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, Landmark, Sparkles } from 'lucide-react';

interface AuthBrandPanelProps {
  mode?: 'login' | 'signup';
}

export function AuthBrandPanel({ mode = 'login' }: AuthBrandPanelProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-[#0B1F4B] to-slate-950 p-12 text-white overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-800/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Institutional AP Defense</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
          {mode === 'login'
            ? 'Defend your disbursements with continuous automated inspection.'
            : 'Join leading finance teams protecting millions in supplier payouts.'}
        </h2>
        <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
          {mode === 'login'
            ? 'Sign in to access your organization workspace, review flagged invoices, and inspect maker-checker remittance queues.'
            : 'Create an account to request verified access for your organization. All new seats are governed by strict maker-checker controls.'}
        </p>
      </div>

      {/* Center Widget: Live Risk Card Preview */}
      <div className="relative z-10 my-8 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-200">INV-2026-0881</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40">
            Risk Score: 85/100
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>OCR extracted 14 line items with 99.4% confidence</span>
          </div>
          <div className="flex items-start gap-2 text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Bank mismatch intercepted: Extracted Axis Bank vs Master HDFC Bank</span>
          </div>
          <div className="flex items-start gap-2 text-amber-200">
            <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Maker-Checker hold active: Dual sign-off required to release</span>
          </div>
        </div>
      </div>

      {/* Bottom Reassurance */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>PostgreSQL RLS Protected</span>
        </div>
        <span>AES-256 Document Encryption</span>
      </div>
    </div>
  );
}

