"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX2, Loader, Trash2, ArrowLeft, Plus, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/haptics';

export default function AvailabilityExceptionsPage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ['psy-availability-exceptions'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/availability-exceptions');
      return res.data?.data || res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      haptic.medium();
      return api.post('/psychologists/me/availability-exceptions', {
        date,
        reason: reason.trim() || undefined,
      });
    },
    onSuccess: () => {
      haptic.success();
      setDate('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['psy-availability-exceptions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      haptic.warning();
      return api.delete(`/psychologists/me/availability-exceptions/${id}`);
    },
    onSuccess: () => {
      haptic.success();
      queryClient.invalidateQueries({ queryKey: ['psy-availability-exceptions'] });
    },
  });

  return (
    <PsySidebarLayout>
      <div className="space-y-6 sm:space-y-8 max-w-4xl font-outfit pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/psychologist/availability"
              className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B2559] tracking-tight">Congés & Exceptions</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Bloquez des dates ponctuelles sans modifier votre grille hebdomadaire
              </p>
            </div>
          </div>
        </div>

        {/* ADD EXCEPTION CARD */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CalendarX2 className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="font-bold text-[#1B2559] text-base">Bloquer une nouvelle date</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto]">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date d'indisponibilité</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#7C3AED] focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Motif (Optionnel)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Congés annuels, Formation médicale, Férié..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#7C3AED] focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => createMutation.mutate()}
                disabled={!date || createMutation.isPending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:bg-purple-200 transition-all shadow-md shadow-purple-500/20 active:scale-95"
              >
                {createMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Bloquer la date</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIST OF BLOCKED DATES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1B2559] text-sm uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Dates d'indisponibilité programmées ({exceptions.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex min-h-[160px] items-center justify-center bg-white rounded-3xl border border-slate-100 p-8">
              <Loader className="w-6 h-6 animate-spin text-[#7C3AED]" />
            </div>
          ) : exceptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto border border-purple-100">
                <CalendarX2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1B2559] text-sm">Aucune date bloquée</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Votre planning hebdomadaire s'applique sans interruption.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {exceptions.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-200 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <CalendarX2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2559] text-sm sm:text-base">
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.reason || 'Indisponible toute la journée'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all active:scale-95 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PsySidebarLayout>
  );
}
