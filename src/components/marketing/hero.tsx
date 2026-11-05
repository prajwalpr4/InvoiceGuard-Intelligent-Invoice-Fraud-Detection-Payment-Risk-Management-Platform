import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ForensicsStage } from './forensics-stage';

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] flex items-center py-12 lg:py-16 overflow-hidden bg-white">
      {/* Background Static Atmosphere: subtle grid pattern and faint radial wash */}
      <div className="absolute inset-0 fl-grid-pattern opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 fl-hero-wash pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column (cols 1-5 on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7FE] text-[#2347F5] text-xs font-semibold mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#2347F5] animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#2347F5] -ml-4" />
              <span>Accounts payable fraud defense</span>
            </div>

            {/* H1 Display */}
            <h1 className="fl-display text-[#0A1226]">
              Catch invoice fraud{' '}
              <span className="relative inline-block text-[#2347F5]">
                before the payment leaves.
                {/* Hand-drawn feel SVG underline stroke sitting below descenders */}
                <svg
                  viewBox="0 0 280 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#2347F5] overflow-visible"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10C65 4 195 2 277 8"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Lead Subtitle (<= 2 lines worth, max-w ~60ch) */}
            <p className="fl-lead mt-6 max-w-[55ch]">
              InvoiceGuard reads every vendor invoice, checks it against your payment history, and shows
              reviewers exactly why it looks risky.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#2347F5] hover:bg-[#1B38C9] text-white font-semibold text-sm h-12 px-7 rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-[#F7F9FC] hover:bg-[#EEF2F8] text-[#0A1226] font-semibold text-sm h-12 px-7 rounded-xl border border-[#E3E8F0] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5]"
              >
                <span>See how it works</span>
              </a>
            </div>

            {/* 3 Truthful Micro-points Only */}
            <div className="mt-8 pt-6 border-t border-[#E3E8F0] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#667085] font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Maker-checker approvals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Append-only audit trail
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Role-based access
              </span>
            </div>
          </div>

          {/* Right Column: Live Forensics Stage (cols 6-12) */}
          <div className="lg:col-span-7 w-full">
            <ForensicsStage />
          </div>
        </div>
      </div>
    </section>
  );
}
