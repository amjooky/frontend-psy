"use client";

import React, { useState, useEffect } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { Calendar, Video, Clock, DollarSign, Users, Award, AlertCircle, ArrowUpRight, TrendingUp, ShieldCheck, CheckCircle2, UploadCloud, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { PsychologistKycStepper } from '@/components/psychologist/PsychologistKycStepper';
import { formatPrice, formatRating } from '@/lib/format';

export default function PsychologistOverview() {
  const queryClient = useQueryClient();
  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [dismissedKyc, setDismissedKyc] = useState<boolean>(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['psy-overview-stats'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      return res.data?.data || res.data;
    },
  });

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['psy-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments', { params: { limit: 5 } });
      const result = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      return Array.isArray(result) ? result : [];
    },
  });

  // Prompt KYC Stepper automatically if profile is incomplete or no certificates uploaded
  useEffect(() => {
    if (stats && !statsLoading && !dismissedKyc) {
      const certsCount = stats.certificates?.length || 0;
      if (!stats.isProfileComplete || certsCount === 0) {
        setShowKycModal(true);
      }
    }
  }, [stats, statsLoading, dismissedKyc]);

  const activeApptsCount = Array.isArray(appointments)
    ? appointments.filter((a: any) => a.status === 'CONFIRMED').length
    : 0;

  const isKycPending = stats?.status === 'PENDING_VERIFICATION';
  const hasCerts = (stats?.certificates?.length || 0) > 0;

  return (
    <PsySidebarLayout>
      <div className="space-y-8 max-w-6xl font-outfit">
        {/* KYC STEPPER MODAL OVERLAY */}
        {showKycModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-full max-w-4xl">
              <PsychologistKycStepper
                initialProfile={stats}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['psy-overview-stats'] });
                  setShowKycModal(false);
                }}
                onClose={() => {
                  setShowKycModal(false);
                  setDismissedKyc(true);
                }}
              />
            </div>
          </div>
        )}

        {/* WELCOME BANNER */}
        <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] shadow-md text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-purple-200 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Espace Thérapeute MonPsy
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Clinical Dashboard</h2>
              <p className="text-purple-100 text-sm font-medium mt-2 leading-relaxed">
                Welcome to your digital practice. Manage consultations, adjust schedule availability, review patient logs, and monitor performance.
              </p>
            </div>

            {/* Quick Trigger to open KYC modal */}
            {(!stats?.isProfileComplete || !hasCerts || isKycPending) && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setShowKycModal(true)}
                  className="px-5 py-3 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {hasCerts ? 'Gérer mon dossier KYC' : 'Compléter mon KYC (Diplômes)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KYC ONBOARDING STATUS BANNER */}
        {(!stats?.isProfileComplete || !hasCerts) ? (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  Dossier KYC Non Finalisé : Déposez vos Diplômes
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Action Requise</span>
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Pour activer la prise de rendez-vous avec les patients et apparaître sur l'annuaire public, veuillez téléverser vos justificatifs officiels (Master, Diplôme d'État, inscription au tableau de l'Ordre).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowKycModal(true)}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Lancer l'assistant KYC
            </button>
          </div>
        ) : isKycPending ? (
          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 flex items-start gap-4 text-blue-900">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Dossier KYC Transmis : Examen en Cours</h4>
              <p className="text-xs font-medium mt-1 leading-relaxed text-slate-600">
                Vos diplômes et certificats officiels sont actuellement en cours d'examen par le conseil médical MonPsy.
                Vous recevrez une notification d'activation dès que votre profil sera vérifié. Vous pouvez modifier ou ajouter des documents complémentaires à tout moment.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowKycModal(true)}
                  className="text-xs text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Voir mes justificatifs soumis
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* METRICS STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Sessions', value: activeApptsCount, icon: <Video className="w-5 h-5 text-blue-600" />, iconBg: 'bg-blue-50 border-blue-100' },
            { label: 'Profile Status', value: stats?.status || 'PENDING', icon: <Award className="w-5 h-5 text-purple-600" />, iconBg: 'bg-purple-50 border-purple-100' },
            { label: 'Hourly Rate', value: `${formatPrice(stats?.pricePerSession, 80, 0)} ${stats?.currency || 'TND'}`, icon: <DollarSign className="w-5 h-5 text-teal-600" />, iconBg: 'bg-teal-50 border-teal-100' },
            { label: 'Rating Score', value: formatRating(stats?.rating, 5.0), icon: <TrendingUp className="w-5 h-5 text-amber-600" />, iconBg: 'bg-amber-50 border-amber-100' }
          ].map((m, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{m.label}</span>
                <h4 className="text-2xl font-bold text-[#1B2559] mt-2">{m.value}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl ${m.iconBg} border flex items-center justify-center`}>
                {m.icon}
              </div>
            </div>
          ))}
        </div>

        {/* SCHEDULE OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Schedule</h3>
                <Link href="/dashboard/psychologist/appointments" className="text-xs text-purple-600 hover:text-purple-750 font-bold">View all</Link>
              </div>

              {apptsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : Array.isArray(appointments) && appointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {appointments.map((appt: any) => (
                    <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                          <Video className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1B2559] text-sm">
                            Session with {appt.patient.isAnonymous ? (appt.patient.anonymousName || 'Anonymous Patient') : `${appt.patient.firstName} ${appt.patient.lastName}`}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(appt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({appt.sessionFormat})
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href={`/dashboard/psychologist/session/${appt.id}`}
                        className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-purple-600/10 text-center"
                      >
                        Launch Room
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No sessions booked for today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Setup</h3>
            <div className="space-y-3">
              <Link 
                href="/dashboard/psychologist/availability"
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-200 flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <h4 className="font-bold text-[#1B2559] text-sm">Working Hours</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Configure weekly available schedule slots</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/psychologist/certificates"
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-200 flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <h4 className="font-bold text-[#1B2559] text-sm">Verifications</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Upload licensing and practice certificates</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PsySidebarLayout>
  );
}
