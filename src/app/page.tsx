import { Metadata } from 'next';
import './marketing.css';
import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { ProblemSection } from '@/components/marketing/problem-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { SecuritySection } from '@/components/marketing/security-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'InvoiceGuard — Intelligent Invoice Fraud Detection & Payment Risk Management',
  description:
    'Protect corporate working capital with automated invoice verification, multi-field OCR, 8-point fraud detection, 3-way matching, and maker-checker remittance controls.',
};

export default function LandingPage() {
  return (
    <div className="ig-public min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Enterprise Navigation */}
      <Navbar />

      {/* Main Marketing Content */}
      <main id="main-content" className="flex-1">
        {/* Hero Section with Interactive Mockup */}
        <Hero />

        {/* Problem Section (AP Vulnerability Gap) */}
        <ProblemSection />

        {/* 8 Enterprise Capabilities Bento Grid */}
        <FeaturesSection />

        {/* 6-Step Verification Pipeline */}
        <HowItWorks />

        {/* Enterprise Security Architecture */}
        <SecuritySection />

        {/* High-Impact Final CTA */}
        <CtaSection />
      </main>

      {/* Enterprise Footer */}
      <Footer />
    </div>
  );
}
