import Link from 'next/link';
import {
  ShieldAlert,
  FileCheck2,
  ScanText,
  Building2,
  Landmark,
  Scale,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Coins,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-700/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Invoice<span className="text-blue-700">Guard</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-blue-700 transition-colors">
              Overview
            </a>
            <a href="#features" className="hover:text-blue-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-700 transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-blue-700 transition-colors">
              Security
            </a>
            <Link href="/contact" className="hover:text-blue-700 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm text-sm">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold bg-blue-50 text-blue-800 border-blue-200 mb-6 gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              Intelligent Enterprise Accounts Payable Defense
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Detect Invoice Fraud Before It Becomes a{' '}
              <span className="text-blue-700 underline decoration-blue-200 underline-offset-8">Financial Loss.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              An intelligent invoice verification and payment risk management platform that helps businesses
              identify suspicious transactions, verify vendors, streamline approvals and maintain complete
              financial accountability.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 h-12 shadow-md shadow-blue-700/20">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/app/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 font-medium h-12 px-8 text-slate-700 hover:bg-slate-50">
                  Explore Live Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Maker-Checker Segregation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero data leakage
              </span>
            </div>
          </div>

          {/* Interactive Hero Showcase Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/50">
            <div className="bg-slate-900 rounded-xl p-4 sm:p-6 text-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
                  <span className="text-xs text-slate-400 font-mono ml-2">InvoiceGuard Protection Radar • Active</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  All 8 Analyzers Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Detection Telemetry</div>
                  <div className="text-base font-semibold mt-1 text-white">8 Modular Fraud Scanners</div>
                  <div className="text-xs text-slate-400 mt-0.5">SHA-256 Hashes • PO Variance • Z-Score</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Real-time Inspection
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Remittance Safeguards</div>
                  <div className="text-base font-semibold mt-1 text-blue-400">Maker-Checker Banking</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dual-authorization for master bank accounts</div>
                  <div className="mt-3 text-xs text-slate-300">
                    Automated payment holds on unverified credentials.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-xs text-slate-400 font-medium">Risk Scoring & Governance</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">0 — 100</span>
                    <span className="text-xs text-slate-400">Explainable Scoring</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    3-tier financial approval matrix with segregation of duties.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Overview Section */}
      <section id="overview" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-700 uppercase">The AP Vulnerability Gap</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Why Traditional Accounting Leaves Millions at Risk
            </p>
            <p className="mt-3 text-base text-slate-600">
              Finance departments process thousands of invoices monthly. Manual sampling and basic ERP checks
              fail to catch sophisticated fraud patterns before payments leave corporate accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Duplicate Invoice Payments',
                desc: 'Identical or subtly altered invoices submitted months apart or through different channels, leading to unrecovered double disbursements.',
                icon: FileSpreadsheet,
              },
              {
                title: 'Vendor Bank Manipulation',
                desc: 'Compromised supplier emails requesting sudden payment redirection to fraudulent bank accounts without maker-checker validation.',
                icon: Landmark,
              },
              {
                title: 'Threshold Manipulation & Splitting',
                desc: 'Invoices broken into ₹95,000–₹99,000 increments across days to intentionally slip beneath mandatory executive sign-off levels.',
                icon: Coins,
              },
              {
                title: 'Suspicious & Shell Vendors',
                desc: 'Recently formed entities sharing PAN, GSTIN, or banking credentials with existing vendors submitting unverified claims.',
                icon: Building2,
              },
              {
                title: 'Purchase Order Discrepancies',
                desc: 'Billed line items exceeding approved quantities or unexpected surcharge markups not reflected in original procurement agreements.',
                icon: Scale,
              },
              {
                title: 'Delayed Fraud Identification',
                desc: 'Discovering fraudulent payments months later during external audits, when recovery of lost company funds is virtually impossible.',
                icon: History,
              },
            ].map((problem, i) => (
              <Card key={i} className="bg-white border-slate-200 hover:border-slate-300 transition-all shadow-sm">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mb-4">
                    <problem.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{problem.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-700 uppercase">Engineered for Finance Teams</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Enterprise-Grade Capabilities from Ingestion to Settlement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Intelligent OCR Extraction',
                desc: 'Extract vendor details, invoice numbers, line items, taxes, and bank coordinates with confidence ratings and manual review.',
                icon: ScanText,
              },
              {
                title: 'Duplicate Interception',
                desc: 'File hash fingerprinting, invoice number matching, and date-amount cross-referencing prevent double payments instantly.',
                icon: Layers,
              },
              {
                title: 'Master Bank Safeguards',
                desc: 'Hard-stop holds whenever bank account on invoice differs from verified vendor master record. Maker-checker approval required.',
                icon: Landmark,
              },
              {
                title: 'Explainable Risk Scoring',
                desc: 'Transparent 0–100 scoring with plain-language explanations of triggered rules and exact guidance for financial reviewers.',
                icon: ShieldAlert,
              },
              {
                title: 'Three-Way Matching',
                desc: 'Automatic cross-validation between Purchase Orders (PO), Invoices, and Warehouse Goods Receipt Notes (GRN).',
                icon: FileCheck2,
              },
              {
                title: 'Segregation of Duties',
                desc: 'Multi-level approval matrices ensure invoice submitters cannot approve their own invoices, enforcing corporate governance.',
                icon: Scale,
              },
              {
                title: 'Tamper-Resistant Audit',
                desc: 'Every change, upload, approval, rejection, and payment record creates an immutable compliance trail with before/after state diffs.',
                icon: History,
              },
              {
                title: 'Financial Analytics',
                desc: 'Real-time charts and KPI metrics calculated live from database records, exposing duplicate risk and vendor risk distribution.',
                icon: FileSpreadsheet,
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-700 uppercase">The Verification Pipeline</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              6-Step Continuous Risk Lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Invoice',
                desc: 'Intake PDF, PNG, or JPG invoices via drag-and-drop, bulk ingestion, or vendor portal.',
              },
              {
                step: '02',
                title: 'Extract Information',
                desc: 'OCR engine extracts vendor, financial amounts, taxes, line items, and bank details with confidence metrics.',
              },
              {
                step: '03',
                title: 'Run Fraud Checks',
                desc: '8 modular detectors test for duplicate hashes, bank mismatches, threshold splitting, and PO variances.',
              },
              {
                step: '04',
                title: 'Generate Risk Score',
                desc: 'Centralized 0–100 score synthesized with automatic hard-stops for critical bank and duplicate breaches.',
              },
              {
                step: '05',
                title: 'Review and Approve',
                desc: 'Tiered approvers sign off in accordance with organizational limits, enforcing maker-checker segregation.',
              },
              {
                step: '06',
                title: 'Payment & Audit',
                desc: 'Log authorized payment disbursements against approved balances, maintaining a permanent compliance archive.',
              },
            ].map((step, i) => (
              <div key={i} className="relative p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-3xl font-extrabold text-blue-100 block mb-2 font-mono">{step.step}</span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50 mb-4">
                <Lock className="w-3 h-3 mr-1.5" />
                Enterprise Security Architecture
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Designed to Safeguard Sensitive Corporate Financial Data
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                InvoiceGuard treats all vendor financial records as mission-critical. We employ organization-level
                data isolation, server-enforced Row Level Security (RLS), and cryptographic document hashing to
                prevent unauthorized access or tampering.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Role-Based Access Control (Admin, Finance Staff, Approver, Auditor)',
                  'Private document storage with short-lived authenticated signed URLs',
                  'Maker-checker authorization for all vendor banking updates',
                  'Immutable audit trail recording every state transition and decision rationale',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Governance & Accountability</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Unlike informal approval channels such as email or chat, InvoiceGuard creates an unbroken chain of
                custody for every financial commitment.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Multi-Tenant Isolation</span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    PostgreSQL RLS Active
                  </Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Bank Change Controls</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Dual Verification
                  </Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Audit Immutability</span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    Append-Only Log
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Stop Payment Fraud Before Disbursements Leave Your Account.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Equip your accounts payable and finance teams with intelligent fraud detection, 3-way matching,
            and strict approval controls.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white hover:bg-slate-100 text-blue-950 font-semibold px-8 h-12 shadow-lg">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/app/dashboard">
              <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-800 h-12 px-8">
                Explore Demo Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
              InvoiceGuard
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent invoice fraud detection and payment risk management SaaS for modern enterprises.
            </p>
          </div>

          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Pipeline</a></li>
              <li><Link href="/app/dashboard" className="hover:text-white transition-colors">Demo Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Legal & Compliance</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="#security" className="hover:text-white transition-colors">Security Architecture</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Support</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">User Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Request Access</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© 2026 InvoiceGuard Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <Link href="/contact" className="hover:text-slate-400">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
