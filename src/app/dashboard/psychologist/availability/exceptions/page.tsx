"use client";

import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX2, Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    mutationFn: async () => api.post('/psychologists/me/availability-exceptions', { date, reason: reason || undefined }),
    onSuccess: () => {
      setDate('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['psy-availability-exceptions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/psychologists/me/availability-exceptions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['psy-availability-exceptions'] }),
  });

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-4xl font-outfit">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1B2559]">Dates d'indisponibilite</h2>
          <p className="mt-1 text-sm text-slate-500">Bloquez des dates specifiques sans modifier votre planning hebdomadaire.</p>

          <div className="mt-6 grid gap-3 md:grid-cols-[180px_1fr_auto]">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif optionnel" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <button
              onClick={() => createMutation.mutate()}
              disabled={!date || createMutation.isPending}
              className="rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : exceptions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CalendarX2 className="mx-auto mb-4 w-10 h-10 text-slate-300" />
            <h3 className="font-bold text-[#1B2559]">Aucune exception enregistree</h3>
          </div>
        ) : (
          <div className="grid gap-3">
            {exceptions.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="font-semibold text-[#1B2559]">{new Date(item.date).toLocaleDateString()}</h3>
                  <p className="text-sm text-slate-500">{item.reason || 'Indisponible toute la journee'}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
