"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  CalendarX2,
  ArrowRight,
  Info,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface Slot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const DAYS_CONFIG = [
  { key: 'MONDAY', label: 'Lundi', short: 'Lun' },
  { key: 'TUESDAY', label: 'Mardi', short: 'Mar' },
  { key: 'WEDNESDAY', label: 'Mercredi', short: 'Mer' },
  { key: 'THURSDAY', label: 'Jeudi', short: 'Jeu' },
  { key: 'FRIDAY', label: 'Vendredi', short: 'Ven' },
  { key: 'SATURDAY', label: 'Samedi', short: 'Sam' },
  { key: 'SUNDAY', label: 'Dimanche', short: 'Dim' },
];

export default function PsySchedule() {
  const queryClient = useQueryClient();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['psy-availability'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      const data = res.data?.data || res.data;
      const backendSlots: Slot[] = data?.availabilitySlots || [];
      setSlots(backendSlots);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedSlots: Slot[]) => {
      return api.put('/psychologists/me/availability', { slots: updatedSlots });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-availability'] });
      setHasChanges(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    },
  });

  const addSlotToDay = (dayKey: string) => {
    setSlots((prev) => [...prev, { dayOfWeek: dayKey, startTime: '09:00', endTime: '17:00' }]);
    setHasChanges(true);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
    setHasChanges(true);
  };

  const updateSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setHasChanges(true);
  };

  // Presets
  const applyStandardWeekPreset = () => {
    const newSlots: Slot[] = [
      { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00' },
    ];
    setSlots(newSlots);
    setHasChanges(true);
  };

  const applyLunchBreakPreset = () => {
    const newSlots: Slot[] = [
      { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'TUESDAY', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'WEDNESDAY', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'THURSDAY', startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '13:00' },
      { dayOfWeek: 'FRIDAY', startTime: '14:00', endTime: '18:00' },
    ];
    setSlots(newSlots);
    setHasChanges(true);
  };

  const clearAllSlots = () => {
    if (confirm('Voulez-vous vraiment effacer toutes vos plages horaires ?')) {
      setSlots([]);
      setHasChanges(true);
    }
  };

  // Group slots by day
  const slotsByDay = DAYS_CONFIG.map((d) => {
    const daySlots = slots
      .map((slot, originalIdx) => ({ ...slot, originalIdx }))
      .filter((s) => s.dayOfWeek === d.key);
    return {
      ...d,
      slots: daySlots,
      isActive: daySlots.length > 0,
    };
  });

  const sessionDuration = profileData?.sessionDurationMins || 60;

  return (
    <PsySidebarLayout>
      <div className="space-y-8 max-w-5xl font-outfit">
        {/* TOAST SUCCESS NOTIFICATION */}
        {showSuccessToast && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <div>
              <p className="text-xs font-bold">Disponibilités enregistrées avec succès !</p>
              <p className="text-[11px] text-emerald-100">Votre calendrier patient est immédiatement mis à jour.</p>
            </div>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559]">Disponibilités Hebdomadaires</h2>
            <p className="text-sm text-slate-500 mt-1">
              Définissez vos heures de consultation récurrentes. Les créneaux de {sessionDuration} min seront automatiquement générés pour vos patients.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => saveMutation.mutate(slots)}
              disabled={saveMutation.isPending}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                hasChanges
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/25 animate-pulse'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/20'
              }`}
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer le planning'}
            </button>
          </div>
        </div>

        {/* PRESETS & EXCEPTIONS QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Presets */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B2559] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                Modèles rapides
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Appliquez un planning type en 1 clic pour gagner du temps :
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={applyStandardWeekPreset}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-xs font-semibold text-slate-700 hover:text-[#7C3AED] transition-all"
              >
                Lun - Ven (09:00 - 17:00)
              </button>
              <button
                onClick={applyLunchBreakPreset}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-xs font-semibold text-slate-700 hover:text-[#7C3AED] transition-all"
              >
                Lun - Ven avec pause midi
              </button>
              <button
                onClick={clearAllSlots}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-all"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Exceptions Shortcut */}
          <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                <CalendarX2 className="w-4 h-4 text-[#7C3AED]" />
                Congés & Exceptions
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Bloquez des dates de congés ou jours fériés ponctuels sans toucher au planning hebdomadaire.
              </p>
            </div>

            <Link
              href="/dashboard/psychologist/availability/exceptions"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] group"
            >
              Gérer les dates d'indisponibilité
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* WEEKLY SCHEDULE CARDS */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {slotsByDay.map((day) => (
              <div
                key={day.key}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  day.isActive
                    ? 'border-slate-200/80 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Day Info */}
                  <div className="flex items-center gap-3.5 w-44 shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        day.isActive
                          ? 'bg-purple-50 border border-purple-100 text-[#7C3AED]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day.short}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2559] text-sm">{day.label}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          day.isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {day.isActive ? `${day.slots.length} créneau(x)` : 'Jour de repos'}
                      </span>
                    </div>
                  </div>

                  {/* Slots list for this day */}
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {day.slots.length > 0 ? (
                      day.slots.map((slot) => (
                        <div
                          key={slot.originalIdx}
                          className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs text-[#1B2559] font-medium"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(slot.originalIdx, 'startTime', e.target.value)}
                            className="bg-transparent border-0 font-bold text-[#1B2559] text-xs focus:ring-0 focus:outline-none cursor-pointer"
                          />
                          <span className="text-slate-400 text-xs font-normal">à</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(slot.originalIdx, 'endTime', e.target.value)}
                            className="bg-transparent border-0 font-bold text-[#1B2559] text-xs focus:ring-0 focus:outline-none cursor-pointer"
                          />
                          <button
                            onClick={() => removeSlot(slot.originalIdx)}
                            className="ml-1 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Supprimer ce créneau"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Aucune heure de consultation définie
                      </span>
                    )}
                  </div>

                  {/* Add slot button */}
                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => addSlotToDay(day.key)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-[#7C3AED] text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un créneau
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM SAVE BAR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-bold text-[#1B2559]">Conseil :</span> N'oubliez pas d'enregistrer vos modifications pour qu'elles apparaissent sur votre profil public.
            </p>
          </div>

          <button
            onClick={() => saveMutation.mutate(slots)}
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-500/20 shrink-0 w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer le planning'}
          </button>
        </div>
      </div>
    </PsySidebarLayout>
  );
}
