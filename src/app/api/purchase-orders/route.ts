import { NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const purchaseOrders = await InvoiceGuardRepository.getPurchaseOrders();
    return NextResponse.json({ purchaseOrders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

