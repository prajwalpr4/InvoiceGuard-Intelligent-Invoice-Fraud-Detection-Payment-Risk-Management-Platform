import { InvoiceGuardRepository } from '@/lib/data/repository';
import { AuditLogsClient } from './audit-logs-client';

export const metadata = {
  title: 'Audit Logs — Tamper-Resistant Compliance Ledger',
};

export default async function AuditLogsPage() {
  const logs = await InvoiceGuardRepository.getAuditLogs();

  return <AuditLogsClient initialLogs={logs} />;
}

