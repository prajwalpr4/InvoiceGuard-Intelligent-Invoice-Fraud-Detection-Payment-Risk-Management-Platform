import React from 'react';
import {
  ScanText,
  Layers,
  Landmark,
  ShieldAlert,
  FileCheck2,
  Scale,
  History,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: ScanText,
    title: 'Intelligent Multi-Field OCR',
    description:
      'Extracts invoice numbers, dates, line items, tax IDs, and bank routing numbers with field-level confidence scores and automated fallback queues.',
    featured: true,
    highlight: '99.2% extraction accuracy across scanned PDFs & mobile photos',
  },
  {
    icon: Layers,
    title: 'Multi-Factor Duplicate Interceptor',
    description:
      'Detects duplicate disbursements using SHA-256 document hashing, fuzzy invoice number matching, and multi-parameter amount/date cross-checks.',
    featured: false,
  },
  {
    icon: Landmark,
    title: 'Master Bank Account Safeguards',
    description:
      'Triggers immediate payment holds whenever remittance banking details on an invoice diverge from verified master supplier files.',
    featured: false,
  },
  {
    icon: ShieldAlert,
    title: 'Explainable 0–100 Risk Scoring',
    description:
      'Generates an audit-ready risk score with transparent rule breakdowns, allowing finance staff to understand exactly why an invoice was flagged.',
    featured: true,
    highlight: 'Deterministic rule weighting — no black-box hallucinations',
  },
  {
    icon: FileCheck2,
    title: 'Automated 3-Way Matching',
    description:
      'Continuously cross-references invoices against approved Purchase Orders (POs) and Warehouse Goods Receipt Notes (GRNs) within configurable tolerances.',
    featured: false,
  },
  {
    icon: Scale,
    title: 'Segregation of Duties & Tiered Approvals',
    description:
      'Enforces organizational approval hierarchies so invoice uploaders cannot approve payments, preventing internal collusion.',
    featured: false,
  },
  {
    icon: History,
    title: 'Immutable Compliance Audit Trail',
    description:
      'Append-only database logging records every user action, state change, approval note, and OCR modification for external regulatory audits.',
    featured: false,
  },
  {
    icon: BarChart3,
    title: 'Live AP Risk Analytics & KPIs',
    description:
      'Real-time reporting on potential duplicate exposure, high-risk vendor concentrations, approval bottlenecks, and operational savings.',
    featured: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Enterprise AP Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Engineered to Protect Corporate Working Capital
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Eight specialized defense modules inspect every transaction from ingestion through review,
            approval, and bank settlement.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-blue-400 hover:shadow-md ${
                  feature.featured
                    ? 'lg:col-span-2 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/60'
                    : 'bg-white'
                }`}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {feature.highlight && (
                  <div className="mt-5 pt-4 border-t border-blue-100/80 flex items-center gap-2 text-xs font-semibold text-blue-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{feature.highlight}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

