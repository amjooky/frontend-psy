"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  DollarSign,
  LifeBuoy,
  MessageSquareQuote,
  Settings,
  MoreHorizontal,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, ADMIN_MODULE_TYPES } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileAdminBottomNav() {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();
  const { badgeFor } = useNotifications();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainTabs = [
    { href: '/dashboard/admin', label: 'Console', icon: Activity },
    { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/dashboard/admin/payments', label: 'Paiements', icon: DollarSign },
    { href: '/dashboard/admin/tickets', label: 'Support', icon: LifeBuoy },
    { href: '#more', label: 'Plus', icon: MoreHorizontal, isAction: true },
  ];

  const moreLinks = [
    { href: '/dashboard/admin/reviews', label: 'Modération Avis', icon: MessageSquareQuote },
    { href: '/dashboard/admin/audit', label: "Logs d'Audit", icon: Settings },
  ];

  const usersBadge = badgeFor('/dashboard/admin/users', ADMIN_MODULE_TYPES);
  const ticketsBadge = badgeFor('/dashboard/admin/tickets', ADMIN_MODULE_TYPES);
  const reviewsBadge = badgeFor('/dashboard/admin/reviews', ADMIN_MODULE_TYPES);

  return (
    <>
      {/* MORE SHEET MODAL */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-slate-200 p-6 md:hidden max-h-[85vh] overflow-y-auto font-outfit shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user?.firstName?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1B2559] flex items-center gap-1.5">
                      <span>Administrateur</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs text-slate-400">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-6">
                {moreLinks.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  const badge = item.href.includes('reviews') ? reviewsBadge : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        active
                          ? 'bg-slate-100 border-slate-300 text-[#1B2559] font-bold'
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${active ? 'bg-[#1B2559] text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      {badge > 0 && (
                        <span className="min-w-[18px] h-4.5 rounded-full bg-[#1B2559] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => { setMoreOpen(false); logoutUser(); }}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-all border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 font-outfit">
        <div className="flex items-center justify-around px-2 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isAction = tab.isAction;
            const active = !isAction && (pathname === tab.href || (tab.href !== '/dashboard/admin' && pathname.startsWith(tab.href)));
            const badge = tab.href.includes('users') ? usersBadge : tab.href.includes('tickets') ? ticketsBadge : 0;

            if (isAction) {
              return (
                <button
                  key={tab.label}
                  onClick={() => setMoreOpen(true)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${
                    moreOpen ? 'text-[#1B2559]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className="relative p-1 rounded-xl">
                    <Icon className="w-5 h-5" />
                    {(reviewsBadge) > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#1B2559]" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium tracking-tight mt-0.5">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative ${
                  active ? 'text-[#1B2559]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-slate-100 text-[#1B2559]' : ''}`}>
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#1B2559] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'font-bold text-[#1B2559]' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
