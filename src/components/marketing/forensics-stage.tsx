'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Landmark,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface ForensicsScenario {
  id: string;
  name: string;
  score: number;
  level: 'Low' | 'Medium' | 'High';
  decision: string;
  vendor: string;
  gstin: string;
  invoiceNo: string;
  poNo: string;
  amount: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  highlightField: 'none' | 'duplicate' | 'bank' | 'amount';
  callout: {
    title: string;
    detail: string;
    type: 'success' | 'warning' | 'danger';
  };
}

export const SCENARIOS: ForensicsScenario[] = [
  {
    id: 'clean',
    name: 'Clean invoice',
    score: 12,
    level: 'Low',
    decision: 'Continues to standard approval',
    vendor: 'Precision Metalworks India Pvt Ltd',
    gstin: '27AABCU9603R1ZM',
    invoiceNo: 'INV-2026-0881',
    poNo: 'PO-2026-8821',
    amount: '₹1,77,000.00',
    bankName: 'HDFC Bank (Verified Master)',
    bankAccount: '••••1102',
    ifsc: 'HDFC0000123',
    highlightField: 'none',
    callout: {
      title: 'Full 3-Way Match Verified',
      detail: 'Vendor GSTIN, bank record and PO #8821 line items match perfectly.',
      type: 'success',
    },
  },
  {
    id: 'duplicate',
    name: 'Duplicate',
    score: 78,
    level: 'High',
    decision: 'On hold, manager alerted',
    vendor: 'Apex Logistics & Freight Solutions',
    gstin: '07AAACA4512Q1ZX',
    invoiceNo: 'INV-2025-9941',
    poNo: 'PO-2026-5510',
    amount: '₹3,45,200.00',
    bankName: 'ICICI Bank',
    bankAccount: '••••4491',
    ifsc: 'ICIC0000456',
    highlightField: 'duplicate',
    callout: {
      title: 'Cryptographic Hash Match 99.4%',
      detail: 'Matches cleared invoice #INV-2291 disbursed 62 days ago.',
      type: 'danger',
    },
  },
  {
    id: 'bank-change',
    name: 'Bank change',
    score: 71,
    level: 'High',
    decision: 'On hold, manager alerted',
    vendor: 'Falcon Electrical Supplies',
    gstin: '29AAACH1298K1ZT',
    invoiceNo: 'INV-2026-4412',
    poNo: 'PO-2026-9012',
    amount: '₹1,85,600.00',
    bankName: 'Axis Bank (Unverified New Account)',
    bankAccount: '••••6544',
    ifsc: 'UTIB0000789',
    highlightField: 'bank',
    callout: {
      title: 'Remittance Hijack Risk',
      detail: 'Invoice bank differs from approved master account (HDFC ••••1102).',
      type: 'danger',
    },
  },
  {
    id: 'split',
    name: 'Split below limit',
    score: 46,
    level: 'Medium',
    decision: 'Sent to review queue',
    vendor: 'Horizon IT Infrastructure',
    gstin: '19AAACN8876P1ZR',
    invoiceNo: 'INV-2026-7023',
    poNo: 'PO-2026-3391',
    amount: '₹98,500.00',
    bankName: 'State Bank of India',
    bankAccount: '••••8821',
    ifsc: 'SBIN0000882',
    highlightField: 'amount',
    callout: {
      title: 'Approval Threshold Circumvention',
      detail: 'Amount sits right below ₹1,00,000 limit with 3 submissions this week.',
      type: 'warning',
    },
  },
];

export function ForensicsStage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = SCENARIOS[activeIdx];

  // Auto-cycle scenarios every ~7s unless paused or off-screen
  useEffect(() => {
    if (isPaused || !isVisible) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCENARIOS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, isVisible]);

  // Pause when stage is off-screen using IntersectionObserver
  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Pause when browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSelectScenario = (index: number) => {
    setActiveIdx(index);
    setIsPaused(true);
    // Resume auto-cycle after 15s idle
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 15000);
  };

  // SVG Gauge calculations (180 deg semicircle, radius 44)
  // angle: from 0 deg (score 0) to 180 deg (score 100)
  const angle = (scenario.score / 100) * 180;
  const rad = ((angle - 180) * Math.PI) / 180;
  const needleX = 50 + 36 * Math.cos(rad);
  const needleY = 50 + 36 * Math.sin(rad);

  const levelStyles = {
    Low: {
      badgeBg: 'bg-[#ECFDF3]',
      badgeText: 'text-[#12B76A]',
      badgeBorder: 'border-[#A6F4C5]',
      needleColor: '#12B76A',
    },
    Medium: {
      badgeBg: 'bg-[#FFFAEB]',
      badgeText: 'text-[#F79009]',
      badgeBorder: 'border-[#FEDF89]',
      needleColor: '#F79009',
    },
    High: {
      badgeBg: 'bg-[#FEF3F2]',
      badgeText: 'text-[#F04438]',
      badgeBorder: 'border-[#FECDCA]',
      needleColor: '#F04438',
    },
  }[scenario.level];

  return (
    <div
      ref={stageRef}
      className="fl-contain relative w-full bg-white rounded-[28px] border border-[#E3E8F0] shadow-xl shadow-slate-900/5 p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* Top Stage Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F0] mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2347F5] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0A1226]">
            Forensic Inspection Stage
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#667085] bg-[#F7F9FC] px-2.5 py-0.5 rounded-full border border-[#E3E8F0]">
          Illustrative sample data
        </span>
      </div>

      {/* Main Inspection Canvas */}
      <div className="relative bg-[#F7F9FC] rounded-2xl border border-[#E3E8F0] p-4 sm:p-5 overflow-hidden">
        {/* Animated Scanning Beam (Cyan hairline with trailing gradient) */}
        <div
          className="fl-scanner-beam pointer-events-none absolute left-0 right-0 h-0.5 bg-[#22D3EE] shadow-[0_0_12px_2px_rgba(34,211,238,0.6)] z-20"
          aria-hidden="true"
        />

        {/* Invoice Paper Card */}
        <div className="bg-white rounded-xl border border-[#E3E8F0] p-4 sm:p-5 shadow-xs relative z-10">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#E3E8F0] gap-2">
            <div>
              <div className="text-[11px] font-mono text-[#667085]">TAX INVOICE</div>
              <div className="text-sm sm:text-base font-bold text-[#0A1226]">
                {scenario.vendor}
              </div>
              <div className="text-xs text-[#667085] font-mono">
                GSTIN: <span className="font-semibold text-[#0A1226]">{scenario.gstin}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-mono text-[#667085]">
                {scenario.invoiceNo}
              </div>
              <div className="text-xs text-[#667085]">Date: 24 Oct 2026</div>
              <div className="text-xs font-semibold text-[#2347F5]">
                {scenario.poNo}
              </div>
            </div>
          </div>

          {/* Invoice Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 text-xs">
            {/* Amount Field */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                scenario.highlightField === 'amount'
                  ? 'bg-[#FFFAEB] border-[#FEDF89] text-[#B54708]'
                  : 'bg-[#F7F9FC] border-[#E3E8F0] text-[#475467]'
              }`}
            >
              <div className="text-[10px] uppercase font-semibold text-[#667085] tracking-wider">
                Total Billed Amount
              </div>
              <div className="text-base font-bold text-[#0A1226] mt-0.5">
                {scenario.amount}
              </div>
              {scenario.highlightField === 'amount' && (
                <div className="text-[10px] text-[#B54708] font-medium mt-1">
                  Threshold limit: ₹1,00,000.00
                </div>
              )}
            </div>

            {/* Bank Remittance Field */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                scenario.highlightField === 'bank'
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                  : 'bg-[#F7F9FC] border-[#E3E8F0] text-[#475467]'
              }`}
            >
              <div className="text-[10px] uppercase font-semibold text-[#667085] tracking-wider">
                Remittance Account
              </div>
              <div className="font-semibold text-[#0A1226] mt-0.5">
                {scenario.bankName}
              </div>
              <div className="text-[11px] font-mono text-[#667085]">
                A/C: {scenario.bankAccount} • IFSC: {scenario.ifsc}
              </div>
            </div>
          </div>

          {/* Anomaly Callout Card (Appears based on scenario) */}
          <div
            className={`mt-3.5 p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
              scenario.callout.type === 'danger'
                ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#912018]'
                : scenario.callout.type === 'warning'
                ? 'bg-[#FFFAEB] border-[#FEDF89] text-[#B54708]'
                : 'bg-[#ECFDF3] border-[#A6F4C5] text-[#027A48]'
            }`}
          >
            {scenario.callout.type === 'danger' ? (
              <ShieldAlert className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
            ) : scenario.callout.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-[#F79009] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold">{scenario.callout.title}</div>
              <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                {scenario.callout.detail}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Right Risk Gauge (Reserved area, never clips or covers text) */}
        <div className="mt-4 bg-white rounded-xl border border-[#E3E8F0] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* SVG Semicircle Gauge */}
            <div className="relative w-16 h-10 shrink-0 flex items-end justify-center">
              <svg viewBox="0 0 100 55" className="w-16 h-9 overflow-visible" aria-hidden="true">
                {/* Background Semicircle Arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#E3E8F0"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Score Arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke={levelStyles.needleColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (scenario.score / 100) * 125.6}
                  className="transition-all duration-700 ease-out"
                />
                {/* Needle Indicator */}
                <circle cx="50" cy="50" r="4" fill="#0A1226" />
                <line
                  x1="50"
                  y1="50"
                  x2={needleX}
                  y2={needleY}
                  stroke="#0A1226"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#0A1226] font-mono leading-none">
                  {scenario.score}
                </span>
                <span className="text-xs text-[#667085] font-mono">/ 100</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelStyles.badgeBg} ${levelStyles.badgeText} ${levelStyles.badgeBorder}`}
                >
                  {scenario.level} Risk
                </span>
              </div>
              <div className="text-xs font-semibold text-[#0A1226] mt-1">
                {scenario.decision}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#667085] text-right">
            <span>Model: Explainable AP v2.4</span>
            <div className="text-[#0A1226] font-semibold">Deterministic Rule Synthesis</div>
          </div>
        </div>
      </div>

      {/* Scenario Control Chips (Bottom Bar) */}
      <div className="mt-4 pt-3 border-t border-[#E3E8F0]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
            Test Fraud Scenarios ({isPaused ? 'Paused — Auto-resumes in 15s' : 'Auto-cycling every 7s'})
          </span>
        </div>

        {/* Scrollable on small screens */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2347F5] text-white shadow-xs'
                    : 'bg-[#F7F9FC] text-[#475467] hover:bg-[#EEF2F8] border border-[#E3E8F0]'
                }`}
              >
                {sc.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

