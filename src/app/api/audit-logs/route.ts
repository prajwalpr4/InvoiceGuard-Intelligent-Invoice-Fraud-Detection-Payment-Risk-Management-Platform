import { NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const auditLogs = await InvoiceGuardRepository.getAuditLogs();
    return NextResponse.json({ auditLogs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

