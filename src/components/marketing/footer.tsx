import React from 'react';
import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Logo inverted size="md" showSubtitle={true} />
            <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise invoice verification and payment risk management SaaS. Continuous fraud detection,
              maker-checker dual authorization, and automated 3-way matching.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>All Systems Operational • RLS Enforced</span>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#overview" className="text-slate-400 hover:text-white transition-colors">
                  Vulnerability Gap
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  Verification Pipeline
                </a>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                  Interactive Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Col */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Compliance
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#security" className="text-slate-400 hover:text-white transition-colors">
                  Security Architecture
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-slate-500 text-xs font-mono">SOX & SOC-2 Aligned</span>
              </li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Access & Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                  User Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">
                  Request Access
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="text-slate-400 hover:text-white transition-colors">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} InvoiceGuard Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

