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
    const contentType = request.headers.get('content-type') || '';
    let invoiceData: any = {};
    let fileInfo: { buffer: Buffer; fileName: string; mimeType: string; fileSize: number } | undefined = undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        fileInfo = {
          buffer: Buffer.from(arrayBuffer),
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
        };
      }

      let bank_details = undefined;
      const bankDetailsRaw = formData.get('bank_details');
      if (bankDetailsRaw && typeof bankDetailsRaw === 'string') {
        try {
          bank_details = JSON.parse(bankDetailsRaw);
        } catch {}
      }

      invoiceData = {
        invoice_number: formData.get('invoice_number') as string,
        invoice_date: (formData.get('invoice_date') as string) || new Date().toISOString().split('T')[0],
        due_date: (formData.get('due_date') as string) || undefined,
        vendor_id: (formData.get('vendor_id') as string) || undefined,
        po_id: (formData.get('po_id') as string) || undefined,
        subtotal: Number(formData.get('subtotal')) || 0,
        tax_amount: Number(formData.get('tax_amount')) || 0,
        discount_amount: Number(formData.get('discount_amount')) || 0,
        total_amount: Number(formData.get('total_amount')) || 0,
        department: (formData.get('department') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
        submitted_by_id: (formData.get('submitted_by_id') as string) || '00000000-0000-0000-0000-000000000011',
        bank_details,
        extracted_text: (formData.get('extracted_text') as string) || undefined,
        file: fileInfo,
      };
    } else {
      const body = await request.json();
      invoiceData = {
        invoice_number: body.invoice_number,
        invoice_date: body.invoice_date || new Date().toISOString().split('T')[0],
        due_date: body.due_date,
        vendor_id: body.vendor_id,
        po_id: body.po_id,
        subtotal: Number(body.subtotal) || 0,
        tax_amount: Number(body.tax_amount) || 0,
        discount_amount: Number(body.discount_amount) || 0,
        total_amount: Number(body.total_amount) || 0,
        department: body.department,
        notes: body.notes,
        submitted_by_id: body.submitted_by_id || '00000000-0000-0000-0000-000000000011',
        bank_details: body.bank_details,
        extracted_text: body.extracted_text,
      };
    }

    if (!invoiceData.invoice_number || !invoiceData.total_amount) {
      return NextResponse.json(
        { error: 'Invoice number and total amount are required' },
        { status: 400 }
      );
    }

    const invoice = await InvoiceGuardRepository.createInvoice(invoiceData);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('API create invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
