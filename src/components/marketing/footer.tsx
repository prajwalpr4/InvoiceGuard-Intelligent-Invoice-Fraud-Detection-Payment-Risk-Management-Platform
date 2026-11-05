import React from 'react';
import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#475467] pt-16 pb-12 border-t border-[#E3E8F0]" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#E3E8F0]">
          {/* Brand Column (cols 1-2) */}
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-[#475467] max-w-sm leading-relaxed">
              Intelligent invoice fraud detection and payment risk management SaaS. Continuous anomaly scanning,
              maker-checker controls, and tamper-resistant audit logs.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#027A48]">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] inline-block" />
              <span className="font-semibold">RLS Isolation & Encryption Enforced</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-bold text-[#0A1226] uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#overview" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#security" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-bold text-[#0A1226] uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs font-bold text-[#0A1226] uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  User Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-[#475467] hover:text-[#2347F5] transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <div>
            © {currentYear} InvoiceGuard Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#0A1226] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#0A1226] transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-[#0A1226] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
