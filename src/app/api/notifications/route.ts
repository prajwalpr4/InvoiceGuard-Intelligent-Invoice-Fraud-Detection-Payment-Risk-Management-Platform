import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGuardRepository } from '@/lib/data/repository';

export async function GET() {
  try {
    const notifications = await InvoiceGuardRepository.getNotifications();
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'mark_all_read') {
      await InvoiceGuardRepository.markAllNotificationsRead();
      return NextResponse.json({ success: true });
    }
    if (body.id) {
      const notif = await InvoiceGuardRepository.markNotificationRead(body.id);
      return NextResponse.json({ notification: notif });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

