"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  Activity,
  LifeBuoy,
  LogOut,
  Settings,
  Loader,
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, ADMIN_MODULE_TYPES } from '@/hooks/useNotifications';
import NotificationBell from '@/components/ui/NotificationBell';
import { MobileAdminBottomNav } from './MobileAdminBottomNav';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function AdminSidebarLayout({ children }: SidebarLayoutProps) {
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
    if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#1B2559]" />
      </div>
    );
  }

  const links = [
    { href: '/dashboard/admin', label: 'Console Admin', icon: <Activity className="w-5 h-5" /> },
    { href: '/dashboard/admin/users', label: 'Contrôle Utilisateurs', icon: <Users className="w-5 h-5" /> },
    { href: '/dashboard/admin/payments', label: 'Paiements & Flux', icon: <DollarSign className="w-5 h-5" /> },
    { href: '/dashboard/admin/reviews', label: 'Modération Avis', icon: <MessageSquareQuote className="w-5 h-5" /> },
    { href: '/dashboard/admin/tickets', label: 'Tickets Support', icon: <LifeBuoy className="w-5 h-5" /> },
    { href: '/dashboard/admin/audit', label: "Logs d'Audit", icon: <Settings className="w-5 h-5" /> },
  ];

  const currentTitle = links.find((l) => l.href === pathname)?.label || "Console Administration";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-outfit pb-24 md:pb-0">
      {/* DESKTOP LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0">
        <div className="flex flex-col">
          <div className="h-20 px-6 border-b border-slate-200 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="MonPsy Logo" width={110} height={35} priority style={{ width: 'auto', height: 'auto' }} className="object-contain" />
            </Link>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
              ADMIN
            </span>
          </div>

          <nav className="p-4 space-y-1.5">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              const badge = badgeFor(link.href, ADMIN_MODULE_TYPES);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-slate-100 border border-slate-200 text-[#1B2559] font-bold shadow-sm'
                      : 'text-slate-500 hover:text-[#1B2559] hover:bg-slate-50'
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span className="flex-1 truncate">{link.label}</span>
                  {badge > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-[#1B2559] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
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
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#1B2559] truncate flex items-center gap-1">
                <span>Admin</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              </div>
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

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="MonPsy Logo" width={90} height={28} priority style={{ width: 'auto', height: 'auto' }} className="object-contain" />
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            isMarkingAllRead={isMarkingAllRead}
            accentColor="#1B2559"
          />
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex h-20 border-b border-slate-200 px-8 items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <h1 className="text-xl font-bold text-[#1B2559]">
            {currentTitle}
          </h1>

          <div className="flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              isMarkingAllRead={isMarkingAllRead}
              accentColor="#1B2559"
            />
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileAdminBottomNav />
    </div>
  );
}
