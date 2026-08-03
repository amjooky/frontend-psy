"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Video, Clock, Check, X, AlertCircle } from 'lucide-react';

export default function PsyAppointments() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ['psy-appointments-full'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      // Handle both paginated {data: {data: [], meta: {}}} and plain array responses
      const result = res.data?.data?.data ?? res.data?.data ?? [];
      return Array.isArray(result) ? result : [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/appointments/${id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-appointments-full'] });
      queryClient.invalidateQueries({ queryKey: ['psy-appointments'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return api.post(`/appointments/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-appointments-full'] });
      queryClient.invalidateQueries({ queryKey: ['psy-appointments'] });
    },
  });

  const filtered = Array.isArray(appointments)
    ? appointments.filter((a: any) => filterStatus === 'ALL' || a.status === filterStatus)
    : [];

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400 font-light">Manage patient appointments and pending consultation bookings.</p>
          <div className="flex gap-2 bg-slate-900/50 p-1 border border-slate-900 rounded-xl">
            {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-slate-900/30 animate-pulse border border-slate-900/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl">
            <AlertCircle className="w-10 h-10 text-red-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-semibold text-sm">Failed to load appointments</h4>
            <p className="text-slate-600 text-xs mt-1">Check your connection or try refreshing.</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((appt: any) => (
              <div
                key={appt.id}
                className="p-6 rounded-2xl bg-slate-900/20 border border-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-blue-400 shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">
                      {appt.patient?.isAnonymous 
                        ? (appt.patient?.anonymousName || 'Anonymous Patient') 
                        : `${appt.patient?.firstName} ${appt.patient?.lastName}`}
                    </h4>
                    <p className="text-xs text-slate-500 font-light mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {appt.startAt 
                          ? new Date(appt.startAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.startAt 
                          ? new Date(appt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'} ({appt.startAt && appt.endAt ? Math.round((new Date(appt.endAt).getTime() - new Date(appt.startAt).getTime()) / 60000) : 60} mins)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    appt.status === 'CONFIRMED' ? 'bg-emerald-950 border border-emerald-900/50 text-emerald-400' :
                    appt.status === 'PENDING' ? 'bg-amber-950 border border-amber-900/50 text-amber-400' :
                    'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}>
                    {appt.status}
                  </span>

                  {appt.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptMutation.mutate(appt.id)}
                        disabled={acceptMutation.isPending}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        title="Accept Consultation"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate({ id: appt.id, reason: 'Rejected by psychologist' })}
                        disabled={cancelMutation.isPending}
                        className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all"
                        title="Reject Consultation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => cancelMutation.mutate({ id: appt.id, reason: 'Cancelled by therapist' })}
                      disabled={cancelMutation.isPending}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 text-red-400 hover:text-red-300 text-xs font-semibold transition-all"
                    >
                      Cancel Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl">
            <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-semibold text-sm">No Appointments Found</h4>
            <p className="text-slate-600 text-xs mt-1">There are no appointments matching the selected filter status.</p>
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
