import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Effective Date: January 1, 2026</p>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Software Subscription & License</h2>
            <p>
              By accessing InvoiceGuard, your organization agrees to these Terms of Service. InvoiceGuard grants your enterprise a non-exclusive, non-transferable subscription to utilize our invoice fraud detection, OCR normalization, and payment approval platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Segregation of Duties & User Authority</h2>
            <p>
              Your designated administrator is solely responsible for granting role authorizations (Admin, Finance Staff, Approver, Auditor). Organizations must adhere to maker-checker operational discipline. InvoiceGuard enforces software blocks preventing submitters from approving their own invoices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Risk Scoring & Independent Verification</h2>
            <p>
              InvoiceGuard provides automated risk scoring (0–100) and evidence-based fraud indicators. A low fraud score does NOT constitute an authorization to release payment without standard organizational approval. Users remain responsible for confirming vendor compliance before releasing bank disbursements.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

