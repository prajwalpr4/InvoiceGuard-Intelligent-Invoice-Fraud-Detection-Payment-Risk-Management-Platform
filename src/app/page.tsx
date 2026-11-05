import { Metadata } from 'next';
import './forensic-light.css';
import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { FraudTicker } from '@/components/marketing/ticker';
import { ProblemSection } from '@/components/marketing/problem-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { FeaturesSection } from '@/components/marketing/features-section';
import { SecuritySection } from '@/components/marketing/security-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'InvoiceGuard — Accounts Payable Fraud Defense & Risk Management',
  description:
    'Detect invoice fraud before the payment leaves. Automated OCR extraction, 8-point fraud detection, 3-way matching, and maker-checker remittance governance.',
};

export default function LandingPage() {
  return (
    <div className="fl min-h-screen flex flex-col bg-white text-[#475467] selection:bg-[#EEF2FF] selection:text-[#2347F5]">
      {/* Sticky 64px Header */}
      <Navbar />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* Asymmetric Hero with Live Forensics Stage */}
        <Hero />

        {/* Fraud-Types Slim Marquee Ticker */}
        <FraudTicker />

        {/* The AP Vulnerability Gap (id="overview") */}
        <ProblemSection />

        {/* Sticky Storytelling Pipeline (id="how-it-works") */}
        <HowItWorks />

        {/* 12-Column Bento Grid (id="features") */}
        <FeaturesSection />

        {/* Roles Explorer & Architecture (id="security") */}
        <SecuritySection />

        {/* Final CTA Navy Panel */}
        <CtaSection />
      </main>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
