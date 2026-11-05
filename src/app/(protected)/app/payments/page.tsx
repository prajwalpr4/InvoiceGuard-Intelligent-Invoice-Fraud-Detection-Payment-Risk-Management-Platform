import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { PaymentsClient } from './payments-client';

export const metadata = {
  title: 'Payments — Disbursement Ledger & Reconciliation',
};

export default async function PaymentsPage() {
  const payments = await InvoiceGuardRepository.getPayments();
  const invoices = await InvoiceGuardRepository.getInvoices();
  // Invoices eligible for payment
  const readyInvoices = invoices.filter(
    (i) => i.workflow_status === 'ready_for_payment' || i.workflow_status === 'partially_paid'
  );
  const session = await getCurrentUserSession();

  return (
    <PaymentsClient
      initialPayments={payments}
      readyInvoices={readyInvoices}
      userRole={session.role}
      currentUserId={session.id}
    />
  );
}

