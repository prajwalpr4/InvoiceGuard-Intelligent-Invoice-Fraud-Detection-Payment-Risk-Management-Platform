'use client';

import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  UserCheck,
  Database,
  FileKey2,
} from 'lucide-react';

interface RoleTab {
  id: string;
  name: string;
  badge: string;
  capabilities: string[];
  restriction: string;
}

const roleTabs: RoleTab[] = [
  {
    id: 'finance',
    name: 'Finance Staff',
    badge: 'AP Operations',
    capabilities: [
      'Ingest and upload vendor invoices (PDF & scans)',
      'Review and correct automated OCR extractions',
      'Create and update supplier profiles',
      'Initiate voucher payment requests',
    ],
    restriction: 'Cannot approve own invoices or self-release disbursements',
  },
  {
    id: 'approver',
    name: 'Approver',
    badge: 'Sign-off Authority',
    capabilities: [
      'Review flagged anomaly evidence and risk scores',
      'Sign off on vouchers within assigned monetary thresholds',
      'Release maker-checker holds with recorded rationale',
      'Request additional documentation from suppliers',
    ],
    restriction: 'Cannot modify master vendor bank coordinates',
  },
  {
    id: 'admin',
    name: 'Administrator',
    badge: 'Governance & CFO',
    capabilities: [
      'Configure organizational approval matrices and limits',
      'Assign and govern user seat roles',
      'Manage company-wide fraud rules and thresholds',
      'Oversee aggregate AP risk exposure analytics',
    ],
    restriction: 'Cannot bypass dual-authorization maker-checker remittance rules',
  },
  {
    id: 'auditor',
    name: 'Auditor',
    badge: 'Compliance & Review',
    capabilities: [
      'Inspect complete append-only compliance audit ledger',
      'Verify cryptographic SHA-256 document fingerprints',
      'Review side-by-side OCR and approval diff histories',
      'Export immutable audit reports for statutory reporting',
    ],
    restriction: 'Strictly read-only — cannot alter transactions or release payments',
  },
];

export function SecuritySection() {
  const [activeTab, setActiveTab] = useState(0);

  const securityPoints = [
    'Supabase authentication with secure session tokens',
    'Role-based access control (Admin, Finance Staff, Approver, Auditor)',
    'Organization-level data isolation via PostgreSQL Row-Level Security (RLS)',
    'Private document storage with short-lived presigned URLs',
    'Maker-checker segregation of duties for approvals and bank changes',
    'Append-only compliance audit history with before/after state diffs',
  ];

  return (
    <section id="security" className="scroll-mt-24 py-20 md:py-28 bg-white border-t border-[#E3E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context (cols 1-6) */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7FE] text-[#2347F5] text-xs font-semibold mb-6">
              <Lock className="w-3.5 h-3.5" />
              <span>Governance & Security Architecture</span>
            </div>

            <h2 className="fl-h2 text-[#0A1226]">
              Built for controlled finance workflows.
            </h2>

            <p className="mt-4 text-base text-[#475467] leading-relaxed">
              Financial data requires rigorous safeguards. InvoiceGuard enforces strict database-level tenant isolation,
              cryptographic document verification, and maker-checker segregation across all user roles.
            </p>

            <div className="mt-8 space-y-3.5">
              {securityPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF3] text-[#12B76A] flex items-center justify-center shrink-0 mt-0.5 border border-[#A6F4C5]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-[#0A1226] leading-snug">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: ROLE EXPLORER (cols 7-12) */}
          <div className="lg:col-span-6 bg-[#F7F9FC] rounded-[28px] border border-[#E3E8F0] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F0] mb-5">
              <div>
                <h3 className="text-base font-bold text-[#0A1226]">
                  Role Explorer
                </h3>
                <p className="text-xs text-[#667085]">
                  Select a role to inspect its operational scope and governance boundaries
                </p>
              </div>
              <UserCheck className="w-5 h-5 text-[#2347F5]" />
            </div>

            {/* Tab Buttons (Accessible Tablist) */}
            <div
              role="tablist"
              aria-label="Role capabilities"
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white rounded-xl border border-[#E3E8F0] mb-6"
            >
              {roleTabs.map((tab, idx) => {
                const isSelected = idx === activeTab;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`role-tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls={`role-panel-${tab.id}`}
                    onClick={() => setActiveTab(idx)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#2347F5] text-white shadow-xs'
                        : 'text-[#475467] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            <div
              role="tabpanel"
              id={`role-panel-${roleTabs[activeTab].id}`}
              aria-labelledby={`role-tab-${roleTabs[activeTab].id}`}
              className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs min-h-[260px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[#0A1226]">
                    {roleTabs[activeTab].name}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#2347F5] border border-[#C7D7FE] font-semibold">
                    {roleTabs[activeTab].badge}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-[#475467]">
                  {roleTabs[activeTab].capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicit "Cannot Do" Restriction Line */}
              <div className="mt-6 pt-4 border-t border-[#E3E8F0] flex items-start gap-2 text-xs bg-[#FEF3F2] p-3 rounded-xl border border-[#FECDCA]">
                <AlertOctagon className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                <span className="text-[#912018] font-medium leading-relaxed">
                  <strong>Governance Limitation:</strong> {roleTabs[activeTab].restriction}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
