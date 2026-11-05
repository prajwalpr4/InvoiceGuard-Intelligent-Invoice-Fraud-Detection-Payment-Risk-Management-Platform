import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const vendors = await InvoiceGuardRepository.getVendors();
    return NextResponse.json({ vendors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.tax_id) {
      return NextResponse.json(
        { error: 'Vendor name and GSTIN/Tax ID are required' },
        { status: 400 }
      );
    }

    const vendor = await InvoiceGuardRepository.createVendor({
      vendor_code: body.vendor_code || `VND-${Math.floor(1000 + Math.random() * 9000)}`,
      name: body.name,
      legal_name: body.legal_name,
      tax_id: body.tax_id,
      pan_number: body.pan_number,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      bank_name: body.bank_name,
      account_number: body.account_number,
      ifsc_code: body.ifsc_code,
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

