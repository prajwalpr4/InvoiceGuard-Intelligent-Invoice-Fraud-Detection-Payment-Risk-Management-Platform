'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './logo';

interface NavItem {
  label: string;
  href: string;
  id?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '#overview', id: 'overview' },
  { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Security', href: '#security', id: 'security' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sentinel-based scroll detection (Zero scroll lag, no expensive scroll listeners)
  useEffect(() => {
    const sentinel = document.getElementById('fl-scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Section highlight via IntersectionObserver
  useEffect(() => {
    const sectionIds = ['overview', 'how-it-works', 'features', 'security'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Body scroll locking when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle ESC key to dismiss mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Invisible scroll sentinel at top of page */}
      <div id="fl-scroll-sentinel" className="absolute top-0 left-0 w-full h-2 pointer-events-none" aria-hidden="true" />

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 h-16 flex items-center ${
          scrolled
            ? 'bg-white/90 backdrop-blur-[8px] border-b border-[#E3E8F0] shadow-xs'
            : 'bg-white/80 backdrop-blur-[4px] border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Nav Items */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475467]"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = item.id && activeSection === item.id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] rounded-md ${
                    isActive
                      ? 'text-[#2347F5] font-semibold'
                      : 'text-[#475467] hover:text-[#0A1226]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#0A1226] hover:text-[#2347F5] px-3.5 py-2 rounded-xl transition-colors hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-[#2347F5] hover:bg-[#1B38C9] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#0A1226] px-2.5 py-1.5 rounded-lg border border-[#E3E8F0] hover:bg-[#F7F9FC]"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="fl-mobile-nav"
              aria-label="Toggle navigation menu"
              className="p-2 text-[#0A1226] hover:text-[#2347F5] hover:bg-[#F7F9FC] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Drawer */}
        {mobileMenuOpen && (
          <div
            id="fl-mobile-nav"
            className="fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-[8px] md:hidden flex flex-col justify-between p-6 overflow-y-auto border-b border-[#E3E8F0]"
          >
            <nav className="flex flex-col space-y-3 pt-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-[#0A1226] hover:text-[#2347F5] hover:bg-[#F7F9FC] px-3 py-2.5 rounded-xl transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-6 border-t border-[#E3E8F0] flex flex-col gap-3 pb-8">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-[#0A1226] border border-[#E3E8F0] rounded-xl hover:bg-[#F7F9FC] transition-colors"
              >
                Sign In to Workspace
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-semibold text-white bg-[#2347F5] hover:bg-[#1B38C9] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
