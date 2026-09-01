"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Calendar, Video, Clock, MessageSquare, AlertCircle, FileText, CheckCircle, Loader, Star, ArrowRight, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PostSessionReviewModal } from '@/components/patient/PostSessionReviewModal';
import { haptic } from '@/lib/haptics';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [reason, setReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewAppt, setReviewAppt] = useState<{ id: string; doctorName: string } | null>(null);

  // Fetch appointments list
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments-list'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      const result = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      return Array.isArray(result) ? result : [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => {
      haptic.warning();
      const res = await api.post(`/appointments/${payload.id}/cancel`, {
        reason: payload.reason,
      });
      return res.data;
    },
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['patient-appointments-list'] });
      setCancellingId(null);
      setReason('');
    },
  });

  const handleCancel = (id: string) => {
    if (!reason.trim()) return;
    cancelMutation.mutate({ id, reason: reason.trim() });
  };

  const now = new Date().getTime();

  const filteredAppointments = (Array.isArray(appointments) ? appointments : []).filter((appt: any) => {
    const startTime = new Date(appt.startAt).getTime();
    if (tab === 'upcoming') {
      return (appt.status === 'CONFIRMED' || appt.status === 'PENDING') && startTime >= now - 60 * 60 * 1000;
    }
    if (tab === 'past') {
      return appt.status === 'COMPLETED' || appt.status === 'CANCELLED' || startTime < now - 60 * 60 * 1000;
    }
    return true;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6 sm:space-y-8 max-w-6xl font-outfit pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2559] tracking-tight flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-[#2EC4B6]" />
              Mes Rendez-vous
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
              Consultez vos consultations programmées, rejoignez vos séances ou gérez votre planning
            </p>
          </div>

          <Link
            href="/psychologists"
            onClick={() => haptic.light()}
            className="px-5 py-2.5 rounded-2xl bg-[#2EC4B6] hover:bg-[#25b5a7] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20 active:scale-95 shrink-0"
          >
            <span>Prendre rendez-vous</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 w-fit">
          {[
            { id: 'upcoming', label: 'À venir' },
            { id: 'past', label: 'Passés & Terminés' },
            { id: 'all', label: 'Toutes les séances' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                haptic.light();
                setTab(t.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id
                  ? 'bg-white text-[#1B2559] shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List of Appointments */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-3xl bg-white border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map((appt: any) => {
              const docName = `Dr. ${appt.psychologist?.firstName || ''} ${appt.psychologist?.lastName || ''}`;
              return (
                <div
                  key={appt.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 hover:border-teal-200 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] border border-teal-100 flex items-center justify-center shrink-0 shadow-xs">
                      <Video className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-bold text-[#1B2559] text-base sm:text-lg">
                        Consultation avec {docName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {new Date(appt.startAt).toLocaleString('fr-FR', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{appt.sessionFormat || 'VIDÉO HD'}</span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : appt.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : appt.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {appt.status === 'CONFIRMED' && (() => {
                      const isExpired = appt.endAt && (Date.now() > new Date(appt.endAt).getTime() + 6 * 60 * 60 * 1000);
                      if (isExpired) {
                        return (
                          <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title="Cette séance de consultation a expiré et n'est plus accessible."
                            className="px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold transition-all flex items-center gap-2 cursor-not-allowed opacity-60 pointer-events-none select-none"
                          >
                            <Video className="w-4 h-4 text-slate-300" />
                            <span>Rejoindre la salle</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          href={`/dashboard/patient/session/${appt.id}`}
                          onClick={() => haptic.success()}
                          className="px-5 py-2.5 rounded-2xl bg-[#2EC4B6] hover:bg-[#25b5a7] text-white text-xs font-bold transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 active:scale-95"
                        >
                          <Video className="w-4 h-4" />
                          Rejoindre la salle
                        </Link>
                      );
                    })()}

                    {appt.status === 'PENDING' && (
                      <Link
                        href={`/dashboard/patient/payment?appointmentId=${appt.id}`}
                        onClick={() => haptic.medium()}
                        className="px-5 py-2.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        Payer et confirmer
                      </Link>
                    )}

                    {appt.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          haptic.light();
                          setReviewAppt({ id: appt.id, doctorName: docName });
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Évaluer la séance
                      </button>
                    )}

                    {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                      <>
                        {cancellingId === appt.id ? (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <input
                              type="text"
                              placeholder="Motif de l'annulation..."
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 w-full md:w-44 focus:border-rose-500 outline-none"
                            />
                            <button
                              onClick={() => handleCancel(appt.id)}
                              disabled={!reason.trim() || cancelMutation.isPending}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 disabled:bg-rose-300 transition-all"
                            >
                              {cancelMutation.isPending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium"
                            >
                              Fermer
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              haptic.light();
                              setCancellingId(appt.id);
                            }}
                            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-all"
                          >
                            Annuler
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#2EC4B6] mx-auto shadow-xs">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[#1B2559] font-bold text-base">Aucun rendez-vous dans cette catégorie</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                Retrouvez nos praticiens certifiés pour planifier votre prochaine séance en toute sérénité.
              </p>
            </div>
            <Link
              href="/psychologists"
              className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-bold hover:underline"
            >
              Parcourir les psychologues disponibles
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* REVIEW MODAL */}
        {reviewAppt && (
          <PostSessionReviewModal
            isOpen={!!reviewAppt}
            appointmentId={reviewAppt.id}
            doctorName={reviewAppt.doctorName}
            onClose={() => setReviewAppt(null)}
            onSubmitted={() => {
              queryClient.invalidateQueries({ queryKey: ['patient-appointments-list'] });
            }}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
