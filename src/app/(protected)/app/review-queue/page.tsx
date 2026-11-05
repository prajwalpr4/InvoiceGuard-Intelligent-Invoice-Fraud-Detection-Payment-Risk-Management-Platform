import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { ReviewQueueClient } from './review-queue-client';

export const metadata = {
  title: 'Review Queue — Fraud Investigation Prioritization',
};

export default async function ReviewQueuePage() {
  const invoices = await InvoiceGuardRepository.getInvoices();
  // Filter for pending review or held invoices
  const pendingQueue = invoices.filter(
    (i) => i.workflow_status === 'pending_review' || i.workflow_status === 'on_hold'
  );
  const session = await getCurrentUserSession();

  return (
    <ReviewQueueClient
      invoices={pendingQueue}
      userRole={session.role}
      currentUserId={session.id}
    />
  );
}

