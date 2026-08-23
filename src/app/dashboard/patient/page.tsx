"use client";

import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Calendar, Video, Clock, MessageCircle, AlertCircle, ArrowUpRight, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { DailyMoodTracker } from '@/components/patient/DailyMoodTracker';
import { EmergencyCrisisDrawer } from '@/components/patient/EmergencyCrisisDrawer';
import { haptic } from '@/lib/haptics';

export default function PatientOverview() {
  // Fetch overview stats and next session details from backend api
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['patient-stats'],
    queryFn: async () => {
      const res = await api.get('/patients/me');
      return res.data;
    },
  });

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments', { params: { limit: 3 } });
      return res.data?.data?.data || [];
    },
  });

  const upcomingSession = Array.isArray(appointments)
    ? appointments.find((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING')
    : null;

  return (
    <SidebarLayout>
      <div className="space-y-6 sm:space-y-8 max-w-6xl font-outfit">
        {/* 1. WELCOME BANNER WITH CRISIS SOS TRIGGER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-[#1B2559] via-[#243373] to-[#121A40] relative overflow-hidden shadow-md">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Espace Thérapeutique Sécurisé
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Prenez soin de votre esprit</h2>
              <p className="text-blue-100/85 text-xs sm:text-sm font-medium mt-2 leading-relaxed">
                Consultez vos spécialistes en toute confidentialité, suivez votre bien-être et retrouvez vos prochaines séances.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link 
                  href="/psychologists"
                  onClick={() => haptic.medium()}
                  className="px-5 py-2.5 rounded-2xl bg-[#2EC4B6] hover:bg-[#26ad9f] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Prendre rendez-vous
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/patient/chat"
                  onClick={() => haptic.light()}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm"
                >
                  Mes messages
                </Link>
              </div>
            </div>

            {/* Emergency Hotline Trigger Button */}
            <div className="shrink-0 pt-2 md:pt-0">
              <EmergencyCrisisDrawer />
            </div>
          </div>
        </div>

        {/* 2. DAILY MOOD TRACKER & EMOTIONAL WELLBEING */}
        <DailyMoodTracker />

        {/* 3. UPCOMING SESSION TRACKER & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                Prochaine Consultation
              </h3>
              {upcomingSession ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center shrink-0 border border-teal-100 shadow-sm">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2559] text-base">
                        Séance avec Dr. {upcomingSession.psychologist.firstName} {upcomingSession.psychologist.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(upcomingSession.startAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })} ({upcomingSession.sessionFormat})
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/patient/session/${upcomingSession.id}`}
                    onClick={() => haptic.success()}
                    className="px-5 py-3 rounded-2xl bg-[#1B2559] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    Rejoindre la salle
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Aucune séance planifiée pour le moment.</p>
                  <Link
                    href="/psychologists"
                    className="inline-block mt-3 text-xs text-teal-600 font-bold hover:underline"
                  >
                    Trouver un praticien disponible
                  </Link>
                </div>
              )}
            </div>

            {/* 4. RECENT COMPLETED APPOINTMENTS LIST */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Historique des Séances</h3>
              {apptsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-16 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {appointments.map((appt: any) => (
                    <div key={appt.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-[#1B2559] text-sm">
                          Dr. {appt.psychologist.firstName} {appt.psychologist.lastName}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date(appt.startAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-xs font-medium">Aucun historique de séance disponible.</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. SUMMARY STATS & QUICK LINKS */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mon Suivi Thérapeutique</h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="text-3xl font-extrabold text-[#1B2559]">{appointments?.length || 0}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Séance{appointments?.length > 1 ? 's' : ''} au total</div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/patient/documents"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-100 transition-all"
                >
                  <span>Mes ordonnances & documents</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
