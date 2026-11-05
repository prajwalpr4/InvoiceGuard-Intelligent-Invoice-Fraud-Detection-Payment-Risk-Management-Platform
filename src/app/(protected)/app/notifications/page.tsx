import { InvoiceGuardRepository } from '@/lib/data/repository';
import { NotificationsClient } from './notifications-client';

export const metadata = {
  title: 'Notifications & Risk Telemetry Alerts',
};

export default async function NotificationsPage() {
  const notifications = await InvoiceGuardRepository.getNotifications();

  return <NotificationsClient initialNotifications={notifications} />;
}

