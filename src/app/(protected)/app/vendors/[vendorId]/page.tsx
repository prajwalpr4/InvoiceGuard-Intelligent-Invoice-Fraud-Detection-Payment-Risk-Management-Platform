import { notFound } from 'next/navigation';
import { InvoiceGuardRepository } from '@/lib/data/repository';
import { getCurrentUserSession } from '@/lib/auth/session';
import { VendorDetailClient } from './vendor-detail-client';

export const metadata = {
  title: 'Vendor Master Profile & Bank Accounts',
};

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const vendor = await InvoiceGuardRepository.getVendorById(vendorId);

  if (!vendor) {
    notFound();
  }

  const session = await getCurrentUserSession();

  return (
    <VendorDetailClient
      vendor={vendor}
      currentUserId={session.id}
    />
  );
}

