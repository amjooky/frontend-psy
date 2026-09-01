"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Clock, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

export function UpcomingSessionBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: appointments } = useQuery({
    queryKey: ['upcoming-session-alert'],
    queryFn: async () => {
      try {
        const res = await api.get('/appointments', { params: { limit: 5 } });
        const result = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const now = new Date().getTime();

  // Find any appointment starting within the next 30 minutes (or already in progress up to +45 mins)
  const imminentSession = Array.isArray(appointments)
    ? appointments.find((a: any) => {
        if (a.status !== 'CONFIRMED') return false;
        const startTime = new Date(a.startAt).getTime();
        const diffMinutes = (startTime - now) / (1000 * 60);
        return diffMinutes >= -45 && diffMinutes <= 30;
      })
    : null;

  if (!imminentSession || dismissed) return null;

  const startTime = new Date(imminentSession.startAt).getTime();
  const diffMinutes = Math.round((startTime - now) / (1000 * 60));
  const isStarted = diffMinutes <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 font-outfit"
      >
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1B2559] via-[#243373] to-[#121A40] text-white border border-teal-400/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle glowing animated background pulse */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 animate-bounce">
                <Video className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-300/30">
                    {isStarted ? 'EN COURS' : `DANS ${Math.max(1, diffMinutes)} MIN`}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mt-1">
                  Consultation avec Dr. {imminentSession.psychologist?.firstName} {imminentSession.psychologist?.lastName}
                </h4>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  {isStarted ? 'Votre praticien vous attend dans la salle.' : 'Préparez-vous et rejoignez l\'antichambre sécurisée.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                haptic.light();
                setDismissed(true);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-teal-300 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Vidéo HD Chiffrée
            </span>

            <Link
              href={`/dashboard/patient/session/${imminentSession.id}`}
              onClick={() => haptic.success()}
              className="px-4 py-2 rounded-xl bg-[#2EC4B6] hover:bg-[#25b5a7] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all active:scale-95"
            >
              <span>Rejoindre la salle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
