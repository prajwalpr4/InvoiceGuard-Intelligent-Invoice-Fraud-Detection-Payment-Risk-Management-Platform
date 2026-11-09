import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/auth/session';
import { InvoiceGuardRepository } from '@/lib/data/repository';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppTopNav } from '@/components/layout/top-nav';

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  if (!session) {
    redirect('/login');
  }

  // Calculate actual unread notifications count from repository
  const notifications = await InvoiceGuardRepository.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <AppSidebar
        userRole={session.role}
        userName={session.name}
        userEmail={session.email}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopNav
          organizationName={session.organization.name}
          currency={session.organization.currency}
          userRole={session.role}
          userName={session.name}
          userEmail={session.email}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
