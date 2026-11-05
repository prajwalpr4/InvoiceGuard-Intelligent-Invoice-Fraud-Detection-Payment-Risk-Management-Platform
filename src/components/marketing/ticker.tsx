'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Landmark,
  Coins,
  Building2,
  Scale,
  Receipt,
  TrendingUp,
} from 'lucide-react';

const fraudPatterns = [
  { label: 'Duplicate Invoices', icon: FileSpreadsheet },
  { label: 'Bank Detail Changes', icon: Landmark },
  { label: 'Invoice Splitting', icon: Coins },
  { label: 'Shell Vendors', icon: Building2 },
  { label: 'PO Mismatches', icon: Scale },
  { label: 'Tax Inconsistencies', icon: Receipt },
  { label: 'Unusual Amounts', icon: TrendingUp },
];

export function FraudTicker() {
  return (
    <div className="relative w-full py-4 bg-[#F7F9FC] border-y border-[#E3E8F0] overflow-hidden select-none">
      {/* Edge Fade Masks */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F7F9FC] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F7F9FC] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Marquee Track */}
      <div className="fl-marquee-track flex items-center gap-8">
        {[...fraudPatterns, ...fraudPatterns, ...fraudPatterns].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#0A1226] shrink-0"
            >
              <div className="w-6 h-6 rounded-md bg-white border border-[#E3E8F0] text-[#2347F5] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{item.label}</span>
              <span className="text-[#E3E8F0] ml-4 font-normal">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

