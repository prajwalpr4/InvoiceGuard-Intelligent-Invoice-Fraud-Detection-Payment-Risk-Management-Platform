import { InvoiceGuardRepository } from '@/lib/data/repository';
import { AnalyticsClient } from './analytics-client';

export const metadata = {
  title: 'Analytics & Financial Reporting',
};

export default async function AnalyticsPage() {
  const analytics = await InvoiceGuardRepository.getDashboardAnalytics();
  const summary = await InvoiceGuardRepository.getDashboardSummary();

  return <AnalyticsClient analytics={analytics} summary={summary} />;
}

