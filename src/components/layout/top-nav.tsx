'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Building,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types/database';

interface TopNavProps {
  organizationName: string;
  currency: string;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  unreadCount?: number;
}

export function AppTopNav({
  organizationName,
  currency,
  userRole,
  userName,
  userEmail,
  unreadCount = 2,
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  // Breadcrumb generation from path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((seg, idx) => {
    const href = '/' + pathSegments.slice(0, idx + 1).join('/');
    const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { title, href, isLast: idx === pathSegments.length - 1 };
  });

  const handleLogout = () => {
    document.cookie = 'invoiceguard_demo_session=; path=/; max-age=0';
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app/dashboard" className="text-slate-400 hover:text-slate-600">
          Home
        </Link>
        {breadcrumb.slice(1).map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            {crumb.isLast ? (
              <span className="font-semibold text-slate-900">{crumb.title}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-slate-700">
                {crumb.title}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Center/Search Bar */}
      <div className="hidden lg:flex items-center w-80 max-w-sm">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Search invoice #, vendor, PO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
          />
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Organization Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
          <Building className="w-3.5 h-3.5 text-blue-700" />
          <span className="truncate max-w-[160px]">{organizationName}</span>
          <span className="text-[10px] text-slate-400 font-mono">({currency})</span>
        </div>

        {/* Notifications Icon with Badge */}
        <Link href="/app/notifications" className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
          )}
        </Link>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-500 capitalize leading-tight">
                {userRole}
              </span>
            </div>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
              role="menu"
            >
              <div className="px-3 py-2 bg-slate-50/70 rounded-lg mb-1 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[120px]">
                    {userName}
                  </p>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {userRole}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate leading-none">{userEmail}</p>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/app/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  role="menuitem"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Settings & Thresholds
                </Link>

                <Link
                  href="/app/audit-logs"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  role="menuitem"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Security Audit Log
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors text-left cursor-pointer"
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

