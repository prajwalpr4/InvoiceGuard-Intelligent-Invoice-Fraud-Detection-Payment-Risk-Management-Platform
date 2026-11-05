import React from 'react';
import {
  UploadCloud,
  ScanText,
  SearchCheck,
  ShieldCheck,
  UserCheck,
  CheckCheck,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UploadCloud,
    title: 'Intake & Document Ingestion',
    description:
      'Upload invoices via drag-and-drop, automated email routing, or vendor portal in PDF, TIFF, or image formats.',
  },
  {
    number: '02',
    icon: ScanText,
    title: 'Multi-Field OCR Extraction',
    description:
      'Engine identifies invoice numbers, tax identifiers, line items, and bank remittance coordinates with confidence metrics.',
  },
  {
    number: '03',
    icon: SearchCheck,
    title: '8-Point Fraud Analysis',
    description:
      'Modular scanners inspect duplicate document hashes, bank mismatches, threshold splitting, and PO tolerances.',
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Explainable Risk Scoring',
    description:
      'Synthesizes a 0–100 score with automatic policy holds triggered for critical banking or duplicate anomalies.',
  },
  {
    number: '05',
    icon: UserCheck,
    title: 'Maker-Checker Approval',
    description:
      'Invoices route through tiered approval authority matrix. Reviewers inspect highlighted diffs and flagged indicators.',
  },
  {
    number: '06',
    icon: CheckCheck,
    title: 'Disbursement & Audit Lock',
    description:
      'Cleared invoices proceed to payment scheduling while the complete lifecycle is sealed in an append-only audit log.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/80 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Verification Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            The 6-Step Continuous Risk Lifecycle
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            From the moment an invoice arrives to the final cleared disbursement, every transaction passes through
            rigorous automated gates.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-blue-700/30">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
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

