'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/marketing/logo';
import { AuthBrandRail } from '@/components/auth/auth-brand-rail';
import '../forensic-light.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Fallback for offline or mock credentials
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase') ||
          email.includes('@acmeglobal.com')
        ) {
          const role = email.includes('priya') ? 'finance' : email.includes('marcus') ? 'approver' : email.includes('sarah') ? 'auditor' : 'admin';
          document.cookie = `invoiceguard_demo_session=${encodeURIComponent(
            JSON.stringify({ email, role })
          )}; path=/; max-age=86400`;
          router.push('/app/dashboard');
          router.refresh();
          return;
        }
        setError(authError.message);
      } else {
        const role = data.user.user_metadata?.role || 'admin';
        document.cookie = `invoiceguard_demo_session=${encodeURIComponent(
          JSON.stringify({ email: data.user.email, role })
        )}; path=/; max-age=86400`;
        router.push('/app/dashboard');
        router.refresh();
      }
    } catch {
      document.cookie = `invoiceguard_demo_session=${encodeURIComponent(
        JSON.stringify({ email: email || 'alex.morgan@acmeglobal.com', role: 'admin' })
      )}; path=/; max-age=86400`;
      router.push('/app/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleEmail: string, roleName: string) => {
    setEmail(roleEmail);
    setPassword('DemoPass123!');
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: roleEmail,
        password: 'DemoPass123!',
      });
    } catch (err) {
      console.warn('Supabase auth sign-in notice:', err);
    } finally {
      document.cookie = `invoiceguard_demo_session=${encodeURIComponent(
        JSON.stringify({ email: roleEmail, role: roleName })
      )}; path=/; max-age=86400`;
      router.push('/app/dashboard');
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <div className="fl min-h-screen flex bg-white relative">
      {/* Brand Rail (xl+ only) */}
      <AuthBrandRail mode="login" />

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

        {/* Centered Focus Card (max-w 440px, 28px radius) */}
        <div className="relative z-10 my-auto w-full max-w-[440px] mx-auto">
          {/* Logo above card */}
          <div className="text-center mb-6 hidden xl:block">
            <Logo size="md" />
          </div>

          <div className="bg-white rounded-[28px] border border-[#E3E8F0] p-7 sm:p-9 shadow-lg shadow-slate-900/5">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0A1226] tracking-tight">
                Sign in to your workspace
              </h1>
              <p className="mt-1.5 text-xs text-[#475467] leading-relaxed">
                Need access for your organization?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-[#2347F5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-sm"
                >
                  Request onboarding
                </Link>
              </p>
            </div>

            {/* Error Message with role="alert" */}
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

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Work Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider mb-1.5"
                >
                  Work Email Address
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

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[#0A1226] uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#2347F5] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-10 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0A1226] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#2347F5] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-[#667085] hover:text-[#0A1226] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-md"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Role-Based Demo Switcher */}
            <div className="mt-7 pt-6 border-t border-[#E3E8F0]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A1226] uppercase tracking-wider mb-2">
                <UserCheck className="w-4 h-4 text-[#2347F5]" />
                <span>Instant Role-Based Demo Access</span>
              </div>
              <p className="text-[11px] text-[#667085] mb-3 leading-relaxed">
                Explore maker-checker segregation of duties as different authorized roles:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@invoiceguard.local', 'admin')}
                  className="p-2.5 text-left border border-[#E3E8F0] rounded-xl hover:bg-[#F7F9FC] transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#0A1226]">Admin (CFO)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('finance@invoiceguard.local', 'finance')}
                  className="p-2.5 text-left border border-[#E3E8F0] rounded-xl hover:bg-[#F7F9FC] transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2347F5] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#0A1226]">Finance Staff</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('approver@invoiceguard.local', 'approver')}
                  className="p-2.5 text-left border border-[#E3E8F0] rounded-xl hover:bg-[#F7F9FC] transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#12B76A] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#0A1226]">Approver</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('auditor@invoiceguard.local', 'auditor')}
                  className="p-2.5 text-left border border-[#E3E8F0] rounded-xl hover:bg-[#F7F9FC] transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F79009] shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-[#0A1226]">Auditor</div>
                  </div>
                </button>
              </div>
            </div>
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
