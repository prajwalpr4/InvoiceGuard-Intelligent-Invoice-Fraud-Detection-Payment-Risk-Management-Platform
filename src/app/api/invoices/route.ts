import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const risk = searchParams.get('risk') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;

    const invoices = await InvoiceGuardRepository.getInvoices({
      search,
      status,
      risk,
      vendorId,
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.invoice_number || !body.total_amount) {
      return NextResponse.json(
        { error: 'Invoice number and total amount are required' },
        { status: 400 }
      );
    }

    const invoice = await InvoiceGuardRepository.createInvoice({
      invoice_number: body.invoice_number,
      invoice_date: body.invoice_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date,
      vendor_id: body.vendor_id,
      po_id: body.po_id,
      subtotal: Number(body.subtotal) || 0,
      tax_amount: Number(body.tax_amount) || 0,
      total_amount: Number(body.total_amount) || 0,
      department: body.department,
      notes: body.notes,
      submitted_by_id: body.submitted_by_id || 'usr_finance_01',
      bank_details: body.bank_details,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

