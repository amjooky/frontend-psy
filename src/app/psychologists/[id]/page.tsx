"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { 
  ShieldCheck, 
  Star, 
  Video, 
  Phone, 
  MessageSquare, 
  MapPin, 
  CalendarCheck,
  ChevronLeft,
  Loader
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function PsychologistProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { user } = useAuth();

  const { data: psy, isLoading: profileLoading } = useQuery({
    queryKey: ['psychologist-profile', id],
    queryFn: async () => {
      const res = await api.get(`/psychologists/${id}`);
      return res.data?.data;
    },
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['psychologist-slots', id, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const res = await api.get(`/psychologists/${id}/availability`, {
        params: { date: selectedDate },
      });
      return res.data?.data || res.data || [];
    },
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: async (payload: { startAt: string; sessionFormat: string; notes?: string }) => {
      const res = await api.post('/appointments/book', {
        psychologistId: id,
        ...payload,
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      const appointmentId = data.data?.id || data.id;
      router.push(`/dashboard/patient/payment?appointmentId=${appointmentId}`);
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/messaging/conversations', {
        psychologistId: id,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      router.push('/dashboard/patient/chat');
    },
  });

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) return;

    // Slots from the API are in the psychologist's local timezone (HH:mm).
    // We must NOT append 'Z' (UTC). Instead build a local ISO string without
    // timezone info — the backend resolves it against the psychologist's own timezone.
    // Format: "YYYY-MM-DDTHH:mm:00"  (no Z, no offset)
    const startAtStr = `${selectedDate}T${selectedSlot}:00`;

    bookMutation.mutate({
      startAt: startAtStr,
      sessionFormat: 'VIDEO',
      notes: notes || undefined,
    });
  };

  if (profileLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
        </div>
      </SidebarLayout>
    );
  }

  if (!psy) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <p className="text-slate-400">Détails du psychologue introuvables.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl">
        <Link href="/psychologists" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1B2559] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Retour à l&apos;annuaire
        </Link>

        {/* PROFILE HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row gap-6 items-start shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 text-[#2EC4B6] font-extrabold flex items-center justify-center text-3xl border border-teal-100 shrink-0">
                {psy.firstName?.replace(/^Dr\.?\s*/i, '')?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-[#1B2559] flex items-center gap-2">
                    Dr. {psy.firstName?.replace(/^Dr\.?\s*/i, '')} {psy.lastName}
                    <ShieldCheck className="w-5 h-5 text-[#2EC4B6]" />
                  </h2>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {(() => {
                      if (!psy.rating) return '5.0';
                      const val = typeof psy.rating === 'object'
                        ? (typeof psy.rating.toNumber === 'function' ? psy.rating.toNumber() : parseFloat(psy.rating.toString()))
                        : parseFloat(psy.rating);
                      return isNaN(val) ? '5.0' : val.toFixed(1);
                    })()} ({psy.reviewCount || 0} avis)
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-light flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {psy.timezone}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {psy.sessionFormats?.map((f: string) => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
                      {f === 'VIDEO' && <Video className="w-3.5 h-3.5" />}
                      {f === 'AUDIO' && <Phone className="w-3.5 h-3.5" />}
                      {f}
                    </span>
                  ))}
                </div>

                {user?.role === 'PATIENT' && (
                  <button
                    onClick={() => startChatMutation.mutate()}
                    disabled={startChatMutation.isPending}
                    className="mt-4 px-5 py-2.5 rounded-xl border border-purple-200 hover:border-purple-300 bg-purple-50 text-[#7C3AED] text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-purple-650/5 hover:-translate-y-0.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {startChatMutation.isPending ? 'Ouverture...' : 'Contacter par message'}
                  </button>
                )}
              </div>
            </div>

            {/* BIO */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-[#1B2559]">À propos du praticien</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed whitespace-pre-line">
                {psy.biography || 'Aucune biographie disponible pour le moment.'}
              </p>
            </div>
          </div>

          {/* BOOKING SCHEDULER */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between h-fit space-y-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-[#1B2559] mb-1">Réserver une consultation</h3>
              <p className="text-slate-400 text-xs font-light mb-6">Sélectionnez une date et un créneau ci-dessous.</p>
              
              <div className="space-y-4">
                {/* DATE SELECT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Choisir une Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot('');
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-sm text-slate-700"
                  />
                </div>

                {/* SLOTS LIST */}
                {selectedDate && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Créneaux Disponibles</label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader className="w-5 h-5 animate-spin text-slate-400" />
                      </div>
                    ) : Array.isArray(slots) && slots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s: any) => (
                          <button
                            key={s.startTime}
                            disabled={!s.isAvailable}
                            onClick={() => setSelectedSlot(s.startTime)}
                            className={`py-2 px-1 rounded-lg text-xs font-semibold text-center transition-all ${
                              !s.isAvailable 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                                : selectedSlot === s.startTime
                                  ? 'bg-[#7C3AED] text-white'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                             }`}
                          >
                            {s.startTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">Aucun créneau ouvert pour cette date.</p>
                    )}
                  </div>
                )}

                {/* NOTES */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes de consultation (Optionnel)</label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez brièvement le sujet de votre consultation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Coût total</span>
                <span className="font-bold text-[#1B2559] text-base">
                  {(() => {
                    if (!psy.pricePerSession) return '0.00';
                    const val = typeof psy.pricePerSession === 'object'
                      ? (typeof psy.pricePerSession.toNumber === 'function' ? psy.pricePerSession.toNumber() : parseFloat(psy.pricePerSession.toString()))
                      : parseFloat(psy.pricePerSession);
                    return isNaN(val) ? '0.00' : val.toFixed(2);
                  })()} {psy.currency || 'TND'}
                </span>
              </div>
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || bookMutation.isPending}
                className="w-full py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-200 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-100"
              >
                {bookMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                Confirmer & Payer
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
