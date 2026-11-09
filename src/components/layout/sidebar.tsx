'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Building2,
  FileBox,
  Truck,
  ShieldAlert,
  Inbox,
  CheckCheck,
  CreditCard,
  BarChart3,
  Bell,
  ScrollText,
  Users2,
  Sliders,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/database';

interface SidebarProps {
  userRole: UserRole;
  userName: string;
  userEmail: string;
  unreadCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ userRole, userName, userEmail, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [effectiveUnreadCount, setEffectiveUnreadCount] = useState(unreadCount);

  useEffect(() => {
    setEffectiveUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (pathname === '/app/notifications') {
      setEffectiveUnreadCount(0);
    }
  }, [pathname]);

  // Navigation definition with role-based accessibility
  const navSections: NavSection[] = [
    {
      title: 'Core Operations',
      items: [
        {
          label: 'Dashboard',
          href: '/app/dashboard',
          icon: LayoutDashboard,
          roles: ['admin', 'finance', 'approver', 'auditor', 'vendor'],
        },
        {
          label: 'Invoices',
          href: '/app/invoices',
          icon: ReceiptText,
          roles: ['admin', 'finance', 'approver', 'auditor', 'vendor'],
        },
        {
          label: 'Vendors',
          href: '/app/vendors',
          icon: Building2,
          roles: ['admin', 'finance', 'approver', 'auditor'],
        },
        {
          label: 'Purchase Orders',
          href: '/app/purchase-orders',
          icon: FileBox,
          roles: ['admin', 'finance', 'approver', 'auditor'],
        },
        {
          label: 'Goods Receipts',
          href: '/app/goods-receipts',
          icon: Truck,
          roles: ['admin', 'finance', 'approver', 'auditor'],
        },
      ],
    },
    {
      title: 'Risk & Verification',
      items: [
        {
          label: 'Fraud Detection',
          href: '/app/fraud-detection',
          icon: ShieldAlert,
          roles: ['admin', 'finance', 'approver', 'auditor'],
          badge: '8 Active',
        },
        {
          label: 'Review Queue',
          href: '/app/review-queue',
          icon: Inbox,
          roles: ['admin', 'approver'],
        },
        {
          label: 'Approvals',
          href: '/app/approvals',
          icon: CheckCheck,
          roles: ['admin', 'approver'],
        },
        {
          label: 'Payments',
          href: '/app/payments',
          icon: CreditCard,
          roles: ['admin', 'finance', 'approver', 'auditor'],
        },
      ],
    },
    {
      title: 'Intelligence & Audit',
      items: [
        {
          label: 'Analytics',
          href: '/app/analytics',
          icon: BarChart3,
          roles: ['admin', 'approver', 'auditor'],
        },
        {
          label: 'Notifications',
          href: '/app/notifications',
          icon: Bell,
          roles: ['admin', 'finance', 'approver', 'auditor', 'vendor'],
          badge: effectiveUnreadCount > 0 ? `${effectiveUnreadCount} New` : undefined,
          badgeColor: 'bg-blue-100 text-blue-700',
        },
        {
          label: 'Audit Logs',
          href: '/app/audit-logs',
          icon: ScrollText,
          roles: ['admin', 'auditor'],
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          label: 'User Management',
          href: '/app/users',
          icon: Users2,
          roles: ['admin'],
        },
        {
          label: 'Fraud Rules',
          href: '/app/fraud-rules',
          icon: Sliders,
          roles: ['admin'],
        },
        {
          label: 'Settings',
          href: '/app/settings',
          icon: Settings,
          roles: ['admin'],
        },
      ],
    },
  ];

  const handleLogout = () => {
    // Clear demo cookie
    document.cookie = 'invoiceguard_demo_session=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const roleLabelMap: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'Administrator', color: 'bg-purple-100 text-purple-700' },
    finance: { label: 'Finance Staff', color: 'bg-blue-100 text-blue-700' },
    approver: { label: 'Approver / Mgr', color: 'bg-emerald-100 text-emerald-700' },
    auditor: { label: 'Compliance Auditor', color: 'bg-amber-100 text-amber-700' },
    vendor: { label: 'Vendor Partner', color: 'bg-slate-100 text-slate-700' },
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 flex items-center px-5 gap-3 bg-white">
        <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-700/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
            Invoice<span className="text-blue-700">Guard</span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
            Enterprise AP Defense
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section, idx) => {
          // Filter items based on logged-in role
          const visibleItems = section.items.filter((item) =>
            item.roles.includes(userRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>

              <div className="space-y-0.5 pt-1">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (item.href === '/app/notifications') {
                          setEffectiveUnreadCount(0);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : item.badgeColor || 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer Profile & Role Pill */}
      <div className="border-t border-slate-200 p-3 bg-white">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-900 truncate">{userName}</span>
            <span className="text-[10px] text-slate-500 truncate">{userEmail}</span>
            <div className="mt-1">
              <span
                className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                  roleLabelMap[userRole]?.color || 'bg-slate-100 text-slate-700'
                }`}
              >
                {roleLabelMap[userRole]?.label || userRole}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

