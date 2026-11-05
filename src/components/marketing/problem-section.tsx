import React from 'react';
import {
  FileSpreadsheet,
  Landmark,
  Coins,
  Building2,
  Scale,
  History,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

const problemRows = [
  {
    icon: FileSpreadsheet,
    title: 'Duplicate payments',
    desc: 'Identical or subtly altered invoices submitted weeks apart through different channels.',
  },
  {
    icon: Landmark,
    title: 'Vendor bank manipulation',
    desc: 'Compromised supplier emails requesting sudden payment redirection to unauthorized accounts.',
  },
  {
    icon: Coins,
    title: 'Threshold splitting',
    desc: 'Invoices broken into sub-limit increments across consecutive days to evade CFO sign-off.',
  },
  {
    icon: Building2,
    title: 'Shell vendors',
    desc: 'New entities sharing PAN, GSTIN, phone numbers, or physical addresses with existing vendors.',
  },
  {
    icon: Scale,
    title: 'PO discrepancies',
    desc: 'Invoiced line item unit rates or surcharge markups that exceed agreed procurement contracts.',
  },
  {
    icon: History,
    title: 'Delayed detection',
    desc: 'Fraud discovered months later at audit time, when recovery of disbursed capital is virtually impossible.',
  },
];

export function ProblemSection() {
  return (
    <section id="overview" className="scroll-mt-24 py-20 md:py-28 bg-[#F7F9FC] border-t border-[#E3E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold text-[#2347F5] uppercase tracking-wider mb-3">
            The Accounts Payable Vulnerability Gap
          </div>
          <h2 className="fl-h2 text-[#0A1226]">
            Where money quietly leaks.
          </h2>
          <p className="mt-3 text-base text-[#475467] leading-relaxed">
            Finance departments process thousands of vouchers monthly. Formatting validations inside ERPs
            fail to catch intentional anomalies before payouts are executed.
          </p>
        </div>

        {/* 2-Column Editorial List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Large Statement (cols 1-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E3E8F0] p-8 shadow-xs">
            <span className="text-xs font-mono font-bold text-[#F04438] uppercase tracking-wider block mb-3">
              The Reality of Manual Audits
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A1226] leading-snug tracking-tight">
              Manual checks cannot keep up with thousands of invoices.
            </div>
            <p className="mt-4 text-sm text-[#475467] leading-relaxed">
              When accounting teams rely on sample spot-checks, 95% of transactions pass through unverified.
              InvoiceGuard inspects 100% of inbound invoices against your historical payment ledger in seconds.
            </p>

            <div className="mt-6 pt-6 border-t border-[#E3E8F0] space-y-2 text-xs text-[#667085]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                <span>Zero visibility into cross-department duplicates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                <span>No automated bank coordinate cross-checks</span>
              </div>
            </div>
          </div>

          {/* Right Compact Rows (cols 6-12) */}
          <div className="lg:col-span-7 divide-y divide-[#E3E8F0] border-y border-[#E3E8F0] bg-white rounded-2xl border px-6 shadow-xs">
            {problemRows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={idx}
                  className="py-4 sm:py-5 flex items-start gap-4 hover:bg-[#F7F9FC] transition-colors rounded-xl px-2"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FEF3F2] text-[#F04438] flex items-center justify-center shrink-0 border border-[#FECDCA]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1226]">
                      {row.title}
                    </h3>
                    <p className="text-xs text-[#475467] mt-0.5 leading-relaxed">
                      {row.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Before / After Split Strip */}
        <div className="mt-14 bg-white rounded-2xl border border-[#E3E8F0] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E3E8F0]">
            {/* Before Column */}
            <div className="pr-0 md:pr-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3F2] text-[#F04438] text-xs font-bold uppercase tracking-wider mb-4 border border-[#FECDCA]">
                <XCircle className="w-3.5 h-3.5" />
                <span>Traditional AP Workflow</span>
              </div>
              <div className="space-y-3 text-sm text-[#475467]">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                  <span>Spot checks and manual spreadsheets</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                  <span>Fraud found at audit time, months too late</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                  <span>No clear reason for a flag or hold</span>
                </div>
              </div>
            </div>

            {/* After Column */}
            <div className="pt-6 md:pt-0 pl-0 md:pl-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF3] text-[#12B76A] text-xs font-bold uppercase tracking-wider mb-4 border border-[#A6F4C5]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>With InvoiceGuard</span>
              </div>
              <div className="space-y-3 text-sm text-[#0A1226] font-medium">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                  <span>Every invoice checked automatically upon ingestion</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                  <span>Risky invoices held before payment leaves your account</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                  <span>Each flag explained with plain-language evidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
