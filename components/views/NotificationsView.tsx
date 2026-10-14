'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '@/lib/types';
import { NavSection } from '../Sidebar';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkRead: (id?: string, markAll?: boolean) => Promise<void>;
  onNavigate: (section: NavSection) => void;
  onRefresh: () => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onNavigate,
  onRefresh,
}: NotificationsViewProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'critical') return n.priority === 'critical' || n.priority === 'high';
    return true;
  });

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await onMarkRead(notif.id);
    }
    if (notif.referenceType === 'property') onNavigate('property-approvals');
    else if (notif.referenceType === 'inquiry') onNavigate('inquiries');
    else if (notif.referenceType === 'booking') onNavigate('bookings');
    else if (notif.referenceType === 'payment') onNavigate('payments');
    else if (notif.referenceType === 'commission') onNavigate('commissions');
    else if (notif.referenceType === 'support') onNavigate('support');
    else if (notif.type === 'security_alert') onNavigate('audit-logs');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'unread' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'critical' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Critical / High Priority
          </button>
        </div>

        <button
          onClick={async () => {
            await onMarkRead(undefined, true);
            onRefresh();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shrink-0"
        >
          <CheckCheck className="w-4 h-4 text-blue-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications in this filter view.
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                !item.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  item.priority === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : item.priority === 'high'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.priority === 'critical' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : item.priority === 'high' ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1 tabular-nums">
                    {new Date(item.createdAt).toLocaleString()} · Type: {item.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-slate-400 hover:text-blue-600 text-xs font-medium">
                <span>View Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
