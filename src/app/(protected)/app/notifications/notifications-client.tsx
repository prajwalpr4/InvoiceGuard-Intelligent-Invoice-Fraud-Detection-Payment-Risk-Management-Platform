'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/database';

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch (e) {
      console.error('Failed to mark all notifications as read', e);
    }
  };

  const markSingleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts on fraud interceptions, bank mismatches, and required approval signoffs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className="text-xs h-9 px-3.5 border-slate-200"
          >
            {filter === 'all' ? 'Show Unread Only' : 'Show All'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-xs h-9 px-3.5 text-blue-700 hover:text-blue-800"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="bg-white border-slate-200 shadow-sm p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900 text-sm">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">You are completely caught up. Incoming alerts will appear here.</p>
          </Card>
        ) : (
          filtered.map((notif) => (
          <Card
            key={notif.id}
            className={`bg-white border-slate-200 shadow-sm transition-all ${
              !notif.is_read ? 'border-l-4 border-l-blue-700 bg-blue-50/20' : ''
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.type === 'alert'
                      ? 'bg-red-50 text-red-600'
                      : notif.type === 'warning'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {notif.type === 'alert' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : notif.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">{notif.created_at}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markSingleRead(notif.id)}
                    className="text-xs h-8 px-2.5 text-slate-500 hover:text-slate-800"
                  >
                    Mark Read
                  </Button>
                )}
                {notif.link_url && (
                  <Link href={notif.link_url}>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-3 font-medium gap-1.5 border-slate-200 hover:bg-slate-50">
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}

