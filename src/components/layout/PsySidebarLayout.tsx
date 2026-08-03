"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Clock,
  TrendingUp,
  Award,
  Loader,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, PSY_MODULE_TYPES } from '@/hooks/useNotifications';
import NotificationBell from '@/components/ui/NotificationBell';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function PsySidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logoutUser } = useAuth();

  const {
    notifications,
    unreadCount,
    badgeFor,
    markRead,
    markAllRead,
    isMarkingAllRead,
  } = useNotifications();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PSYCHOLOGIST')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'PSYCHOLOGIST') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const links = [
    { href: '/dashboard/psychologist', label: "Vue d'ensemble", icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/appointments', label: 'Rendez-vous', icon: <Calendar className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/patients', label: 'Historique patients', icon: <Users className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/availability', label: 'Disponibilités', icon: <Clock className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/chat', label: 'Messagerie', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/certificates', label: 'Diplômes & Certifs', icon: <Award className="w-5 h-5" /> },
    { href: '/dashboard/psychologist/profile', label: 'Profil & Tarifs', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-outfit">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col">
          <div className="h-20 px-6 border-b border-slate-200 flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="MonPsy Logo" width={110} height={35} priority style={{ width: 'auto', height: 'auto' }} className="object-contain" />
            </Link>
          </div>

          <nav className="p-4 space-y-1.5">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              const badge = badgeFor(link.href, PSY_MODULE_TYPES);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-purple-50 border border-purple-100 text-[#7C3AED] shadow-sm'
                      : 'text-slate-500 hover:text-[#1B2559] hover:bg-slate-50'
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span className="flex-1 truncate">{link.label}</span>
                  {badge > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User card + logout */}
        <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-[#7C3AED] font-bold flex items-center justify-center text-xs">
              {user?.firstName?.[0] || 'D'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[#1B2559] truncate">Dr. {user?.lastName || 'Thérapeute'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT SHELL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-200 px-6 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <h1 className="text-lg font-bold text-[#1B2559] md:text-xl">
            {links.find((l) => l.href === pathname)?.label || "Vue d'ensemble"}
          </h1>

          <div className="flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              isMarkingAllRead={isMarkingAllRead}
              accentColor="#7C3AED"
            />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
