"use client";

import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { LifeBuoy, Send, Loader, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch own support tickets
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await api.get('/support/tickets');
      // getMyTickets returns plain array, wrapped in { success, data: [] } by interceptor
      const result = res.data?.data?.data ?? res.data?.data ?? [];
      return Array.isArray(result) ? result : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { subject: string; body: string }) => {
      const res = await api.post('/support/tickets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSubject('');
      setBody('');
    },
  });

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) return;
    try {
      setSubmitting(true);
      await createMutation.mutateAsync({ subject, body });
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="w-7 h-7 text-[#2EC4B6]" />
            Centre d&apos;Assistance & Support
          </h2>
          <p className="text-slate-400 text-sm font-light mt-1">
            Une question ou une difficulté technique ? Ouvrez un ticket pour échanger directement avec notre équipe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CREATE TICKET FORM */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
              Nouveau Ticket de Support
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sujet de votre demande</label>
                <input
                  type="text"
                  placeholder="Résumé du problème ou de la question..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description détaillée</label>
                <textarea
                  rows={5}
                  placeholder="Expliquez en détail votre situation afin que nous puissions vous aider..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !body.trim() || submitting}
                  className="px-6 py-3 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] disabled:bg-teal-200 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-teal-500/10 transition-all"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  Envoyer la demande
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TICKET ARCHIVE */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-[#1B2559]">Historique de vos Tickets</h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-[#2EC4B6]" />
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-light">Impossible de charger vos tickets.</p>
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-[#1B2559] text-xs truncate">{t.subject}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-light">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <p className="text-slate-400 text-xs font-light">Aucun ticket ouvert pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
