'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  ScanText,
  SearchCheck,
  ShieldCheck,
  UserCheck,
  CheckCheck,
  FileText,
  AlertTriangle,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Step {
  number: string;
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Intake & Document Ingestion',
    desc: 'Invoices enter via drag-and-drop, email redirection, or vendor portal in PDF, PNG, or image formats. Each file is immediately fingerprinted with a SHA-256 hash.',
  },
  {
    number: '02',
    title: 'OCR Field Extraction',
    desc: 'The intelligent OCR engine isolates vendor details, invoice numbers, tax identifiers, line items, and bank remittance credentials with confidence scores.',
  },
  {
    number: '03',
    title: '8-Point Fraud Analysis',
    desc: 'Parallel analyzers scan for duplicate document hashes, unverified bank accounts, structured threshold splitting, and contract PO variances.',
  },
  {
    number: '04',
    title: 'Explainable Risk Scoring',
    desc: 'Synthesizes a transparent 0–100 score. Severe anomalies like unverified bank accounts or duplicate invoices trigger automated hard-stops.',
  },
  {
    number: '05',
    title: 'Maker-Checker Approval',
    desc: 'Invoices route through tiered approval workflows. Reviewers inspect side-by-side evidence diffs before any disbursement can be released.',
  },
  {
    number: '06',
    title: 'Payment & Audit Lock',
    desc: 'Authorized payments are scheduled for settlement while all OCR edits, approvals, and timestamps are permanently sealed in an append-only compliance audit log.',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-step-index'));
          if (!isNaN(index)) {
            setActiveStep(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0.1,
    });

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 md:py-28 bg-white border-t border-[#E3E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold text-[#2347F5] uppercase tracking-wider mb-3">
            Continuous Risk Lifecycle
          </div>
          <h2 className="fl-h2 text-[#0A1226]">
            How InvoiceGuard protects every payment.
          </h2>
          <p className="mt-3 text-base text-[#475467] leading-relaxed">
            From the moment a vendor bill arrives to the final cleared disbursement, every transaction passes
            through six transparent verification gates.
          </p>
        </div>

        {/* Sticky Storytelling Layout (Desktop lg+) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Scrolling Steps (cols 1-6) */}
          <div className="lg:col-span-6 space-y-16 lg:space-y-24 relative">
            {/* Vertical Progress Line */}
            <div
              className="hidden lg:block absolute left-5 top-4 bottom-4 w-0.5 bg-[#E3E8F0] z-0"
              aria-hidden="true"
            >
              <div
                className="w-full bg-[#2347F5] transition-all duration-300"
                style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  data-step-index={idx}
                  className={`relative z-10 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-40 lg:opacity-30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Indicator Dot */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#2347F5] text-white shadow-xs'
                          : 'bg-[#F7F9FC] text-[#667085] border border-[#E3E8F0]'
                      }`}
                    >
                      {step.number}
                    </div>

                    <div className="flex-1 pt-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0A1226]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-[#475467] leading-relaxed max-w-[48ch]">
                        {step.desc}
                      </p>

                      {/* Mobile Inline Mini-Visual (hidden on lg+) */}
                      <div className="mt-5 block lg:hidden">
                        <MiniVisual index={idx} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Visual Stage (cols 7-12) */}
          <div className="hidden lg:block lg:col-span-6 sticky top-24">
            <div className="h-[460px] bg-[#F7F9FC] rounded-[28px] border border-[#E3E8F0] p-6 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2347F5]" />
                  <span className="text-xs font-bold text-[#0A1226] uppercase tracking-wider">
                    Pipeline Visualizer • Step {steps[activeStep].number}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#667085]">
                  Active Engine
                </span>
              </div>

              {/* Dynamic Step Visual */}
              <div className="my-auto">
                <MiniVisual index={activeStep} />
              </div>

              <div className="pt-3 border-t border-[#E3E8F0] flex items-center justify-between text-xs text-[#667085]">
                <span>Automated Execution</span>
                <span className="font-mono text-[#0A1226]">Gate {activeStep + 1} of 6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mini visuals rendered per active step
function MiniVisual({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-5 h-5 text-[#2347F5]" />
              <span className="text-sm font-bold text-[#0A1226]">INV-2026-8821.pdf</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#ECFDF3] text-[#12B76A]">
              Uploaded
            </span>
          </div>
          <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8F0] text-xs font-mono text-[#475467] truncate">
            SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
          <div className="text-[11px] text-[#667085]">Cryptographic document fingerprint sealed</div>
        </div>
      );
    case 1:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-[#0A1226] uppercase tracking-wider flex items-center gap-2">
            <ScanText className="w-4 h-4 text-[#2347F5]" />
            <span>OCR Field Identification & Confidence</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[#475467] mb-1">
                <span>Vendor Master Match</span>
                <span className="font-mono font-bold text-[#12B76A]">99.4%</span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#12B76A] w-[99.4%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#475467] mb-1">
                <span>Remittance Bank Coordinates</span>
                <span className="font-mono font-bold text-[#12B76A]">98.8%</span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#12B76A] w-[98.8%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#475467] mb-1">
                <span>Total Taxable & Line Items</span>
                <span className="font-mono font-bold text-[#12B76A]">99.1%</span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#12B76A] w-[99.1%]" />
              </div>
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-2.5">
          <div className="text-xs font-bold text-[#0A1226] uppercase tracking-wider flex items-center gap-2 mb-2">
            <SearchCheck className="w-4 h-4 text-[#2347F5]" />
            <span>8 Parallel Fraud Analyzers</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-[#F7F9FC]">
            <span>Hash Duplicate Check</span>
            <span className="text-[#12B76A] font-semibold">Passed</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-[#F7F9FC]">
            <span>Master Bank Record</span>
            <span className="text-[#F04438] font-semibold">Mismatch Flagged</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-[#F7F9FC]">
            <span>Threshold Structure Filter</span>
            <span className="text-[#12B76A] font-semibold">Passed</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span>PO Line Item Tolerances</span>
            <span className="text-[#12B76A] font-semibold">Within Bounds</span>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1226] uppercase tracking-wider">
              Risk Score Contribution
            </span>
            <span className="text-sm font-black font-mono text-[#F04438]">75 / 100</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-[#FEF3F2] border border-[#FECDCA] flex justify-between items-center text-[#B42318]">
              <span>Unverified Bank Account Mismatch</span>
              <span className="font-bold font-mono">+40 pts</span>
            </div>
            <div className="p-2 rounded bg-[#FFFAEB] border border-[#FEDF89] flex justify-between items-center text-[#B54708]">
              <span>PO Surcharge Variance (+12%)</span>
              <span className="font-bold font-mono">+35 pts</span>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-[#F04438]">
            Automated Policy Action: Immediate Hold Applied
          </div>
        </div>
      );
    case 4:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-[#0A1226] uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#2347F5]" />
            <span>Maker-Checker Authorization Matrix</span>
          </div>
          <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8F0] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#475467]">Maker (Finance Staff):</span>
              <span className="text-[#0A1226] font-semibold">Reviewed & Forwarded</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#475467]">Checker (Approver/CFO):</span>
              <span className="text-[#F04438] font-bold">Dual-Signoff Required</span>
            </div>
          </div>
          <div className="text-[11px] text-[#667085]">
            Segregation enforced: Creator cannot self-approve payout
          </div>
        </div>
      );
    case 5:
      return (
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1226] uppercase tracking-wider flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-[#12B76A]" />
              <span>Audit Ledger Sealed</span>
            </span>
            <span className="text-xs font-mono text-[#12B76A]">Verified</span>
          </div>
          <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8F0] text-xs font-mono text-[#475467] space-y-1">
            <div>EVENT_ID: EVT-99214-EXEC</div>
            <div>STATUS: DISBURSEMENT_CLEARED</div>
            <div>ACTOR: alex.morgan@acmeglobal.com</div>
            <div>TIMESTAMP: 2026-10-24T14:32:01Z</div>
          </div>
          <div className="text-[11px] text-[#667085]">
            Append-only immutable record ready for regulatory audit
          </div>
        </div>
      );
    default:
      return null;
  }
}
