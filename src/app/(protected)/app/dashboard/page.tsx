import { InvoiceGuardRepository } from '@/lib/data/repository';
import { DashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Dashboard — Fraud Radar & AP Analytics',
};

export default async function DashboardPage() {
  const summary = await InvoiceGuardRepository.getDashboardSummary();
  const analytics = await InvoiceGuardRepository.getDashboardAnalytics();
  const recentInvoices = await InvoiceGuardRepository.getInvoices();

  return (
    <DashboardClient
      summary={summary}
      analytics={analytics}
      recentInvoices={recentInvoices.slice(0, 6)}
    />
  );
}

