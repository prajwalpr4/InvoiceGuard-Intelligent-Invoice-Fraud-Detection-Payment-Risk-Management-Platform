'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Info,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/marketing/logo';
import { AuthBrandRail } from '@/components/auth/auth-brand-rail';
import '../forensic-light.css';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms of service and security policy.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      // Public self-signup creates user profile with restricted pending-access status
      // Invariant: Users cannot self-grant admin or approver roles
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            role: 'pending',
          },
        },
      });

      if (
        signUpError &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')
      ) {
        setError(signUpError.message);
      } else {
        router.push(
          `/pending-access?email=${encodeURIComponent(email)}&company=${encodeURIComponent(companyName)}`
        );
      }
    } catch {
      router.push(
        `/pending-access?email=${encodeURIComponent(email)}&company=${encodeURIComponent(companyName)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fl min-h-screen flex bg-white relative">
      {/* Brand Rail (xl+ only) */}
      <AuthBrandRail mode="signup" />

      {/* Main Focus Card Container */}
      <div className="flex-1 min-h-screen flex flex-col justify-between p-6 sm:p-10 relative overflow-y-auto">
        {/* Static Background Grid */}
        <div className="absolute inset-0 fl-grid-pattern opacity-40 pointer-events-none" aria-hidden="true" />

        {/* Top Navigation */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#475467] hover:text-[#2347F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-md px-2 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
          <div className="xl:hidden">
            <Logo size="sm" />
          </div>
        </div>

        {/* Centered Focus Card (max-w 480px, 28px radius) */}
        <div className="relative z-10 my-auto w-full max-w-[480px] mx-auto py-4">
          {/* Logo above card */}
          <div className="text-center mb-6 hidden xl:block">
            <Logo size="md" />
          </div>

          <div className="bg-white rounded-[28px] border border-[#E3E8F0] p-7 sm:p-9 shadow-lg shadow-slate-900/5">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0A1226] tracking-tight">
                Request organization access
              </h1>
              <p className="mt-1.5 text-xs text-[#475467] leading-relaxed">
                Already have an authorized seat?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#2347F5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-sm"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Access Governance Notice */}
            <div className="mb-5 p-3.5 rounded-xl bg-[#EEF2FF] border border-[#C7D7FE] text-xs text-[#2347F5] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#2347F5] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Governance Policy:</strong> To maintain strict maker-checker segregation of duties, new public accounts receive restricted pending status. An administrator must assign operational roles.
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 p-3.5 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#912018] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-[#F04438] shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Marcus Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Organization / Company */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                >
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    id="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    placeholder="Acme Global Industries"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                >
                  Corporate Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-3 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-3 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password Rule Helper */}
              <div className="text-[11px] text-[#667085] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-[#12B76A]' : 'bg-[#E3E8F0]'}`} />
                <span>Minimum 8 characters required</span>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#E3E8F0] text-[#2347F5] focus:ring-[#2347F5] cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-[#475467] leading-tight cursor-pointer select-none">
                  I accept the{' '}
                  <Link href="/terms" className="text-[#2347F5] font-semibold underline">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link href="/privacy" className="text-[#2347F5] font-semibold underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 bg-[#2347F5] hover:bg-[#1B38C9] text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Access Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Legal / Compliance */}
        <div className="relative z-10 w-full max-w-4xl mx-auto pt-6 text-xs text-[#667085] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Protected by PostgreSQL RLS & SOX Compliance</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#0A1226]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#0A1226]">Terms</Link>
            <Link href="/contact" className="hover:text-[#0A1226]">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
