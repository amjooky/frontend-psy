"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  BellOff,
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Star,
  Shield,
  X,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Notification, useNotifications } from '@/hooks/useNotifications';

// ─── Icon per notification type ─────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const base = "w-8 h-8 rounded-xl flex items-center justify-center shrink-0";
  
  if (type.startsWith('APPOINTMENT')) return (
    <span className={`${base} bg-blue-50 text-blue-500`}><Calendar className="w-4 h-4" /></span>
  );
  if (type === 'NEW_MESSAGE') return (
    <span className={`${base} bg-teal-50 text-[#2EC4B6]`}><MessageSquare className="w-4 h-4" /></span>
  );
  if (type.startsWith('PAYMENT') || type === 'REFUND_REQUEST') return (
    <span className={`${base} bg-emerald-50 text-emerald-500`}><CreditCard className="w-4 h-4" /></span>
  );
  if (type === 'REVIEW_RECEIVED') return (
    <span className={`${base} bg-amber-50 text-amber-500`}><Star className="w-4 h-4" /></span>
  );
  if (type === 'DOCUMENT_UPLOADED') return (
    <span className={`${base} bg-violet-50 text-violet-500`}><FileText className="w-4 h-4" /></span>
  );
  if (type === 'ACCOUNT_VERIFIED') return (
    <span className={`${base} bg-green-50 text-green-500`}><Shield className="w-4 h-4" /></span>
  );
  return (
    <span className={`${base} bg-slate-50 text-slate-400`}><Bell className="w-4 h-4" /></span>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}

// ─── Component ──────────────────────────────────────────────────

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
  accentColor?: string; // e.g. '#2EC4B6' | '#7C3AED' | '#1B2559'
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  isMarkingAllRead = false,
  accentColor = '#2EC4B6',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { getRoute, deleteNotification, clearAll } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      onMarkRead(n.id);
    }
    setOpen(false);
    const targetRoute = getRoute(n);
    router.push(targetRoute);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ ['--tw-ring-color' as any]: accentColor }}
      >
        <Bell className="w-5 h-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-md animate-pulse"
            style={{ backgroundColor: accentColor }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-sm text-[#1B2559]">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5"
                  style={{ backgroundColor: accentColor }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  disabled={isMarkingAllRead}
                  className="text-[11px] font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: accentColor }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <BellOff className="w-8 h-8 opacity-40" />
                <p className="text-xs font-medium">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-slate-50 group cursor-pointer relative ${
                    !n.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <NotifIcon type={n.type} />

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-semibold leading-tight truncate ${!n.isRead ? 'text-[#1B2559]' : 'text-slate-600'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: accentColor }}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ouvrir <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Single Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    title="Supprimer"
                    className="absolute right-2 top-3 p-1 rounded.lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
              </span>
              <button
                onClick={() => clearAll()}
                className="text-[11px] font-medium text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
