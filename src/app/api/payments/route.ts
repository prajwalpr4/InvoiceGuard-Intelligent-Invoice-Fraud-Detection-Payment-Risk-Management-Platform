import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const payments = await InvoiceGuardRepository.getPayments();
    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.invoice_id || !body.amount || !body.payment_reference) {
      return NextResponse.json(
        { error: 'Invoice ID, payment amount, and reference are required' },
        { status: 400 }
      );
    }

    const payment = await InvoiceGuardRepository.recordPayment({
      invoice_id: body.invoice_id,
      amount: Number(body.amount),
      payment_method: body.payment_method || 'neft_rtgs',
      payment_reference: body.payment_reference,
      bank_account_used: body.bank_account_used,
      notes: body.notes,
      userId: body.userId || '52961957-4846-4436-a783-afa5d7818ac9',
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record payment' },
      { status: 400 }
    );
  }
}

