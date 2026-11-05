import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductPreview } from './product-preview';

export function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-white">
      {/* Subtle background glow and static dot grid */}
      <div className="absolute inset-0 ig-grid-pattern opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] ig-hero-glow pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Top Copy */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Enterprise Accounts Payable Risk Management</span>
            <ChevronRight className="w-3 h-3 text-blue-600" />
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Detect Invoice Fraud Before It Becomes a{' '}
            <span className="text-blue-700 decoration-blue-200 underline-offset-8">
              Disbursement Loss.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Automate invoice verification with multi-field OCR, 8-point fraud detection, 3-way PO matching,
            and maker-checker remittance governance before funds ever leave your accounts.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base px-7 h-12 rounded-xl transition-all shadow-md shadow-blue-700/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base px-7 h-12 rounded-xl border border-slate-200 transition-all shadow-xs hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>Explore Live Demo</span>
            </Link>
          </div>

          {/* Trust Value Points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Maker-Checker Dual Controls
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              PostgreSQL Row-Level Security
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Immutable Audit Trails
            </span>
          </div>
        </div>

        {/* Hero Interactive Showcase / Product Preview */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

