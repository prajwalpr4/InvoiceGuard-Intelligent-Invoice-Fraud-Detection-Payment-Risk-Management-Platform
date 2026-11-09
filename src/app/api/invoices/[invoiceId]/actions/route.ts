import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await context.params;
    const body = await request.json();

    if (!body.action || !body.reason) {
      return NextResponse.json(
        { error: 'Action and audit reason are mandatory' },
        { status: 400 }
      );
    }

    const updatedInvoice = await InvoiceGuardRepository.recordApprovalDecision(
      invoiceId,
      body.action,
      body.reason,
      body.userId || 'cd3d8a1b-2c4a-45d7-9cfe-550c793e3062'
    );

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record decision' },
      { status: 400 }
    );
  }
}

