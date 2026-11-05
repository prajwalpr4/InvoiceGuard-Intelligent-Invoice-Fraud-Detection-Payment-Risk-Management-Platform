import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { NewInvoiceClient } from './new-invoice-client';

export const metadata = {
  title: 'Upload & Register Invoice',
};

export default async function NewInvoicePage() {
  const vendors = await InvoiceGuardRepository.getVendors();
  const purchaseOrders = await InvoiceGuardRepository.getPurchaseOrders();
  const session = await getCurrentUserSession();

  return (
    <NewInvoiceClient
      vendors={vendors}
      purchaseOrders={purchaseOrders}
      currentUserId={session.id}
    />
  );
}

