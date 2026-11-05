import React from 'react';
import { Lock, ShieldCheck, Key, Database, FileText, CheckCircle2 } from 'lucide-react';

export function SecuritySection() {
  const securityPillars = [
    'Strict multi-tenant isolation enforced via PostgreSQL Row-Level Security (RLS)',
    'Short-lived, authenticated presigned URLs for private invoice file storage',
    'Mandatory maker-checker authorization on supplier bank account modifications',
    'Immutable append-only audit trail capturing full before/after state diffs',
    'Role-Based Access Control (Admin, Finance Staff, Approver, and Auditor)',
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Context & Guarantees */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>Enterprise Security & Compliance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Institutional-Grade Governance for Sensitive Financial Workflows
            </h2>

            <p className="mt-5 text-base text-slate-600 leading-relaxed font-normal">
              Corporate AP departments handle millions in disbursements monthly. InvoiceGuard enforces strict
              cryptographic isolation, dual-authorization remittance gates, and complete evidentiary trails
              required by external auditors and SOX compliance frameworks.
            </p>

            <div className="mt-8 space-y-3.5">
              {securityPillars.map((pillar, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 leading-snug">
                    {pillar}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Architectural Verification Cards */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Defense Architecture Status
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Continuous policy enforcement at both the application and database layer:
            </p>

            <div className="space-y-3.5">
              {/* Pillar 1 */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Tenant Isolation</div>
                    <div className="text-xs text-slate-500">PostgreSQL Row-Level Security</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Bank Change Control</div>
                    <div className="text-xs text-slate-500">Maker-Checker Dual Sign-off</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Enforced
                </span>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Audit Immutability</div>
                    <div className="text-xs text-slate-500">Append-Only Event Ledger</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Sealed
                </span>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Document Encryption</div>
                    <div className="text-xs text-slate-500">AES-256 & Authenticated URLs</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

