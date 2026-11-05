import { NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const goodsReceipts = await InvoiceGuardRepository.getGoodsReceipts();
    return NextResponse.json({ goodsReceipts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch goods receipts' },
      { status: 500 }
    );
  }
}

