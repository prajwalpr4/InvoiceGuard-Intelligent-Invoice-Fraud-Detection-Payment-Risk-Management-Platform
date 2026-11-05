import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-white border-t border-[#E3E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-[#0A1226] text-white p-8 sm:p-14 lg:p-20 overflow-hidden shadow-2xl">
          {/* Faint static grid texture inside panel only */}
          <div
            className="absolute inset-0 fl-grid-pattern opacity-10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="fl-h2 text-white">
              Stop fraud before the money moves.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
              Equip your finance team with continuous invoice verification, explainable risk scoring, and
              automated maker-checker holds.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F7F9FC] text-[#0A1226] font-bold text-sm h-12 px-8 rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold text-sm h-12 px-8 rounded-xl border border-white/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <span>Sign In to Workspace</span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Maker-checker segregation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Append-only audit trail
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                Zero disruption to existing ERPs
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
