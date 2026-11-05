import React from 'react';
import {
  ShieldAlert,
  Layers,
  ScanText,
  Landmark,
  FileCheck2,
  Scale,
  History,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-20 md:py-28 bg-[#F7F9FC] border-t border-[#E3E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold text-[#2347F5] uppercase tracking-wider mb-3">
            Core Platform Capabilities
          </div>
          <h2 className="fl-h2 text-[#0A1226]">
            Everything between upload and payment.
          </h2>
          <p className="mt-3 text-base text-[#475467] leading-relaxed">
            Eight specialized defense engines working together to inspect documents, identify anomalies, and enforce
            governance before funds leave your company accounts.
          </p>
        </div>

        {/* 12-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Large Tile A (cols 1-6): Explainable Risk Scoring */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E3E8F0] p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-5 border border-[#C7D7FE]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1226]">
                Explainable risk scoring (0–100)
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Deterministic rule weighting synthesizes findings into a single transparent score. Reviewers see the exact
                contribution of each detected anomaly, with clear guidance for action.
              </p>
            </div>

            {/* Live Contribution-Bars Mini-Visual */}
            <div className="mt-6 p-4 rounded-xl bg-[#F7F9FC] border border-[#E3E8F0] space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-[#0A1226] font-semibold pb-2 border-b border-[#E3E8F0]">
                <span>Risk Contribution Breakdown</span>
                <span className="font-mono text-[#F04438] font-bold">Total: 75 / 100</span>
              </div>
              <div className="flex items-center justify-between text-[#475467]">
                <span>Duplicate Document Hash Match</span>
                <span className="font-mono font-bold text-[#F04438]">+40 pts</span>
              </div>
              <div className="w-full bg-[#E3E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#F04438] h-full w-[40%]" />
              </div>
              <div className="flex items-center justify-between text-[#475467]">
                <span>Remittance Bank Account Mismatch</span>
                <span className="font-mono font-bold text-[#F04438]">+35 pts</span>
              </div>
              <div className="w-full bg-[#E3E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#F04438] h-full w-[35%]" />
              </div>
            </div>
          </div>

          {/* Large Tile B (cols 7-12): Duplicate Detection */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E3E8F0] p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-5 border border-[#C7D7FE]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1226]">
                Duplicate and near-duplicate detection
              </h3>
              <p className="mt-2 text-sm text-[#475467] leading-relaxed">
                Catches exact and subtly modified duplicates using cryptographic SHA-256 file hashing, invoice number
                string distance, and date-amount cross-referencing.
              </p>
            </div>

            {/* Side-by-Side Diff Mini-Visual */}
            <div className="mt-6 p-4 rounded-xl bg-[#F7F9FC] border border-[#E3E8F0] space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0A1226] mb-2">
                Side-by-Side Invoice Diff
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-[#E3E8F0]">
                  <div className="text-[10px] text-[#667085]">CURRENT INVOICE</div>
                  <div className="font-mono font-bold text-[#0A1226]">INV-2026-0881</div>
                  <div className="font-mono text-[#F04438] mt-1 font-semibold">₹1,77,000.00</div>
                  <div className="text-[10px] text-[#667085]">24 Oct 2026</div>
                </div>
                <div className="p-2.5 bg-[#FEF3F2] rounded-lg border border-[#FECDCA]">
                  <div className="text-[10px] text-[#F04438] font-bold">CLEARED 62 DAYS AGO</div>
                  <div className="font-mono font-bold text-[#0A1226]">INV-2291</div>
                  <div className="font-mono text-[#F04438] mt-1 font-semibold">₹1,77,000.00</div>
                  <div className="text-[10px] text-[#667085]">23 Aug 2026</div>
                </div>
              </div>
              <div className="text-[11px] text-[#F04438] font-semibold text-center pt-1">
                Amount, line items and supplier match identical previous voucher
              </div>
            </div>
          </div>

          {/* Compact Tile 1 (cols 1-4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <ScanText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              Intelligent OCR extraction
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Extracts line items, taxes, invoice numbers, and bank coordinates with confidence ratings and manual review queues.
            </p>
          </div>

          {/* Compact Tile 2 (cols 5-8) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <Landmark className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              Vendor and bank verification
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Enforces hard-stop holds whenever bank accounts differ from verified master supplier files. Dual authorization required to clear.
            </p>
          </div>

          {/* Compact Tile 3 (cols 9-12) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              PO and three-way matching
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Validates invoice line items against approved Purchase Orders and Goods Receipt Notes within organizational tolerances.
            </p>
          </div>

          {/* Compact Tile 4 (cols 1-4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              Multi-level approvals
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Configurable approval matrices ensure invoice creators cannot approve disbursements, guaranteeing strict segregation of duties.
            </p>
          </div>

          {/* Compact Tile 5 (cols 5-8) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              Append-only audit trail
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Every state change, reviewer action, OCR correction, and payment disbursement creates an immutable compliance history with diffs.
            </p>
          </div>

          {/* Compact Tile 6 (cols 9-12) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs hover:border-[#C7D7FE] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#2347F5] flex items-center justify-center mb-4 border border-[#C7D7FE]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0A1226] mb-1.5">
              Analytics and reporting
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed">
              Live executive dashboards showing potential duplicate exposure, vendor risk concentration, and team cycle times.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
