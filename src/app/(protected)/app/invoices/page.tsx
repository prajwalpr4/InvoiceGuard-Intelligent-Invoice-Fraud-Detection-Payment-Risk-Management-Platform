import { InvoiceGuardRepository } from '@/lib/data/repository';
import { InvoicesClient } from './invoices-client';

export const metadata = {
  title: 'Invoices — Accounts Payable & Fraud Registry',
};

export default async function InvoicesPage() {
  const invoices = await InvoiceGuardRepository.getInvoices();
  const vendors = await InvoiceGuardRepository.getVendors();

  return <InvoicesClient initialInvoices={invoices} vendors={vendors} />;
}

