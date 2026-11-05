import { InvoiceGuardRepository } from '@/lib/data/repository';
import { VendorsClient } from './vendors-client';

export const metadata = {
  title: 'Vendors — Master Directory & Banking Verification',
};

export default async function VendorsPage() {
  const vendors = await InvoiceGuardRepository.getVendors();

  return <VendorsClient initialVendors={vendors} />;
}

