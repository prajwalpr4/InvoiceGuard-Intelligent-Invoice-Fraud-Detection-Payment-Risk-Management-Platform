import { notFound } from 'next/navigation';
import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { InvoiceDetailClient } from './invoice-detail-client';

export const metadata = {
  title: 'Invoice Details & Fraud Audit',
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await InvoiceGuardRepository.getInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }

  const session = await getCurrentUserSession();

  return (
    <InvoiceDetailClient
      invoice={invoice}
      userRole={session.role}
      currentUserId={session.id}
    />
  );
}

