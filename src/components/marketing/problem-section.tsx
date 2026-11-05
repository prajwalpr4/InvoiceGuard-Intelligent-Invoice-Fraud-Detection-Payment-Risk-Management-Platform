import React from 'react';
import {
  FileSpreadsheet,
  Landmark,
  Coins,
  Building2,
  Scale,
  History,
  AlertOctagon,
} from 'lucide-react';

const problems = [
  {
    icon: FileSpreadsheet,
    tag: 'Frequency: High',
    title: 'Duplicate Invoice Payments',
    description:
      'Identical or subtly altered invoices submitted weeks apart across different departments, silently triggering unrecovered double disbursements.',
  },
  {
    icon: Landmark,
    tag: 'Impact: Severe',
    title: 'Vendor Bank Manipulation',
    description:
      'Compromised supplier inboxes requesting urgent routing updates to fraudulent accounts without dual maker-checker authorization.',
  },
  {
    icon: Coins,
    tag: 'Pattern: Evasive',
    title: 'Threshold Splitting & Structuring',
    description:
      'Invoices intentionally split into sub-threshold increments (e.g., $9,800) across consecutive days to bypass mandatory executive approvals.',
  },
  {
    icon: Building2,
    tag: 'Risk: Critical',
    title: 'Shell & Duplicate Vendors',
    description:
      'Newly formed supplier entities that share PAN, GSTIN, physical addresses, or bank accounts with existing cleared master vendor profiles.',
  },
  {
    icon: Scale,
    tag: 'Frequency: Daily',
    title: 'PO Line-Item Discrepancies',
    description:
      'Invoiced line items with unauthorized unit price surcharges or quantities that exceed the agreed Goods Receipt Note (GRN) amounts.',
  },
  {
    icon: History,
    tag: 'Impact: Irreversible',
    title: 'Delayed Audit Discovery',
    description:
      'Detecting fraudulent disbursements 4 to 8 months after execution during external annual audits, when recovery of capital is virtually impossible.',
  },
];

export function ProblemSection() {
  return (
    <section id="overview" className="py-20 md:py-28 bg-slate-50/80 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>The AP Vulnerability Gap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Why Traditional Accounting Leaves Millions at Risk
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Enterprise finance teams process thousands of invoices each cycle. Manual sampling and legacy ERP
            checks fail to catch modern, coordinated fraud vectors before payments clear.
          </p>
        </div>

        {/* 6 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {problem.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {problem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

