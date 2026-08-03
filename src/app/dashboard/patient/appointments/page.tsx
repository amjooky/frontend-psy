"use client";

import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Calendar, Video, Clock, MessageSquare, AlertCircle, FileText, CheckCircle, Loader } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch appointments list
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments-list'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data?.data?.data || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => {
      const res = await api.post(`/appointments/${payload.id}/cancel`, {
        reason: payload.reason,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments-list'] });
      setCancellingId(null);
      setReason('');
    },
  });

  const handleCancel = (id: string) => {
    if (!reason) return;
    cancelMutation.mutate({ id, reason });
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#2EC4B6]" />
            Mes Rendez-vous
          </h2>
          <p className="text-slate-400 text-sm font-light mt-1">
            Gérez et suivez vos séances de consultation à venir et passées.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((appt: any) => (
              <div
                key={appt.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-200 hover:shadow-md transition-all shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center shrink-0 border border-teal-100">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2559] text-base">
                      Consultation avec Dr. {appt.psychologist.firstName} {appt.psychologist.lastName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <p className="text-xs text-slate-500 font-light flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(appt.startAt).toLocaleString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        appt.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {appt.status === 'CONFIRMED' && (
                    <a
                      href={`/dashboard/patient/session/${appt.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] text-white text-xs font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-teal-500/10 flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Rejoindre la séance
                    </a>
                  )}

                  {appt.status === 'PENDING' && (
                    <a
                      href={`/dashboard/patient/payment?appointmentId=${appt.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-purple-500/10"
                    >
                      Payer la séance
                    </a>
                  )}

                  {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                    <>
                      {cancellingId === appt.id ? (
                        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <input
                            type="text"
                            placeholder="Motif de l'annulation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 w-full md:w-44 focus:border-rose-500 outline-none placeholder:text-slate-400"
                          />
                          <button
                            onClick={() => handleCancel(appt.id)}
                            disabled={!reason || cancelMutation.isPending}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 disabled:bg-rose-300"
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
                          onClick={() => setCancellingId(appt.id)}
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-all"
                        >
                          Annuler la réservation
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#2EC4B6] mx-auto mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="text-[#1B2559] font-bold text-base">Aucun rendez-vous réservé</h4>
            <p className="text-slate-400 text-xs font-light mt-1 max-w-sm mx-auto">
              Parcourez l&apos;annuaire des praticiens et réservez votre première séance de consultation.
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
