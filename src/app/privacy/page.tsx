import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 py-4 px-6 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <span>Invoice<span className="text-blue-700">Guard</span></span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Effective Date: January 1, 2026 • Version 2.0</p>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Overview & Commitment</h2>
            <p>
              InvoiceGuard (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides an intelligent invoice verification and payment risk management SaaS platform. We process vendor billing records, bank coordinates, and commercial transaction metadata exclusively on behalf of our client organizations. We never monetize or broker corporate financial data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
            <p>
              To execute OCR extraction, fraud anomaly detection, and approval workflows, we ingest:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>User Account Details:</strong> Business email, full name, employee role, and audit session timestamps.</li>
              <li><strong>Invoice & Billing Metadata:</strong> Supplier legal name, GSTIN, PAN, bank account numbers, IFSC codes, line-item pricing, and purchase order references.</li>
              <li><strong>Document Media:</strong> PDF, PNG, and JPG invoice attachments stored in encrypted object buckets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Data Security & Storage Controls</h2>
            <p>
              All customer database records are isolated at the organization level using PostgreSQL Row Level Security (RLS). Documents are stored in private buckets accessible only via short-lived cryptographic signed URLs. Bank account numbers are masked in general listings and revealed only to authorized accounts managers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Contact Our Data Protection Officer</h2>
            <p>
              For security disclosures or privacy inquiries, contact our Data Protection Office at{' '}
              <a href="mailto:privacy@invoiceguard.io" className="text-blue-700 underline">
                privacy@invoiceguard.io
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

