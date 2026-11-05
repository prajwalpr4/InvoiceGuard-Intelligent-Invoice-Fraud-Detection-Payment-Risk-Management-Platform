'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Landmark } from 'lucide-react';

interface AuthBrandRailProps {
  mode?: 'login' | 'signup';
}

export function AuthBrandRail({ mode = 'login' }: AuthBrandRailProps) {
  const [isVisible, setIsVisible] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  // Pause beam when offscreen
  useEffect(() => {
    if (!railRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={railRef}
      className="hidden xl:flex flex-col justify-between w-80 min-h-screen bg-[#F7F9FC] border-r border-[#E3E8F0] p-8 select-none"
    >
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D7FE] text-[#2347F5] text-[11px] font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#2347F5] animate-pulse" />
          <span>Forensic AP Defense</span>
        </div>

        <h2 className="text-xl font-bold text-[#0A1226] leading-snug">
          {mode === 'login'
            ? 'Continuous invoice anomaly inspection.'
            : 'Protect corporate disbursements before funds move.'}
        </h2>

        <p className="mt-3 text-xs text-[#475467] leading-relaxed">
          {mode === 'login'
            ? 'Sign in to access your organization workspace, review flagged vouchers, and inspect maker-checker remittance queues.'
            : 'Join finance departments defending millions in supplier transactions with automated 3-way matching.'}
        </p>
      </div>

      {/* Miniature Scanner Strip Widget */}
      <div className="relative my-8 bg-white rounded-2xl border border-[#E3E8F0] p-4 shadow-xs overflow-hidden">
        {/* Animated Scanner Beam (Pauses when offscreen) */}
        {isVisible && (
          <div
            className="fl-scanner-beam pointer-events-none absolute left-0 right-0 h-0.5 bg-[#22D3EE] shadow-[0_0_10px_2px_rgba(34,211,238,0.5)] z-20"
            aria-hidden="true"
          />
        )}

        <div className="flex items-center justify-between pb-2.5 border-b border-[#E3E8F0] mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
            <span className="text-[11px] font-mono font-semibold text-[#0A1226]">INV-2026-0881</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3F2] text-[#F04438] border border-[#FECDCA]">
            Held: 85/100
          </span>
        </div>

        <div className="space-y-2 text-[11px] text-[#475467]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span>OCR extracted line items (99.4%)</span>
          </div>
          <div className="flex items-center gap-2 text-[#F04438]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F04438] shrink-0" />
            <span>Bank mismatch intercepted</span>
          </div>
          <div className="flex items-center gap-2 text-[#F79009]">
            <Landmark className="w-3.5 h-3.5 text-[#F79009] shrink-0" />
            <span>Dual maker-checker required</span>
          </div>
        </div>
      </div>

      {/* Bottom Reassurance */}
      <div className="text-[11px] text-[#667085] space-y-1.5 pt-4 border-t border-[#E3E8F0]">
        <div className="flex items-center gap-1.5 text-[#0A1226] font-semibold">
          <Lock className="w-3.5 h-3.5 text-[#12B76A]" />
          <span>PostgreSQL RLS Protected</span>
        </div>
        <div>AES-256 Document Encryption</div>
      </div>
    </div>
  );
}

