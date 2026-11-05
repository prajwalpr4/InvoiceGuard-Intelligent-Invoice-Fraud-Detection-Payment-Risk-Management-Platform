import Link from 'next/link';
import { ShieldAlert, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function PendingAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; company?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || 'your email address';
  const company = params.company || 'your organization';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Invoice<span className="text-blue-700">Guard</span>
            </span>
          </Link>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm text-center">
          <CardContent className="p-8">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Clock className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Registration Under Review
            </h2>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Your access request for <strong className="text-slate-900">{company}</strong> with email{' '}
              <strong className="text-slate-900">{email}</strong> has been logged.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Security Governance Requirement
              </div>
              <p>
                In accordance with enterprise segregation of duties, new users cannot self-assign executive roles
                (Admin or Approver). An existing organization administrator must verify your identity and assign
                your workspace permissions.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium">
                  Return to Sign In
                </Button>
              </Link>

              <Link href="/app/dashboard" className="block">
                <Button variant="outline" className="w-full border-slate-200 text-slate-700">
                  Try Demo Workspace Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
