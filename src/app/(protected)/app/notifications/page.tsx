import { InvoiceGuardRepository } from '@/lib/data/repository';
import { NotificationsClient } from './notifications-client';

export const metadata = {
  title: 'Notifications & Risk Telemetry Alerts',
};

export default async function NotificationsPage() {
  const notifications = await InvoiceGuardRepository.getNotifications();
  // Automatically mark all notifications as read upon visiting notification center
  await InvoiceGuardRepository.markAllNotificationsRead();

  return <NotificationsClient initialNotifications={notifications.map((n) => ({ ...n, is_read: true }))} />;
}

