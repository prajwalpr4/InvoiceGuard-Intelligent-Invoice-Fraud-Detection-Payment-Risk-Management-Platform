import { InvoiceGuardRepository } from '@/lib/data/repository';
import { UsersClient } from './users-client';

export const metadata = {
  title: 'User Management & Role Governance',
};

export default async function UsersPage() {
  const members = await InvoiceGuardRepository.getOrganizationMembers();

  return <UsersClient initialMembers={members} />;
}

