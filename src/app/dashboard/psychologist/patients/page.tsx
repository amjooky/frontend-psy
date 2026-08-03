"use client";

import React, { useMemo, useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Users, Calendar, Clock, Video, CheckCircle2,
  XCircle, Search, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  sessionFormat: string;
  patient: {
    firstName?: string;
    lastName?: string;
    isAnonymous?: boolean;
    anonymousName?: string;
    user?: { email: string };
  };
}

interface PatientGroup {
  name: string;
  email: string;
  isAnonymous: boolean;
  appointments: Appointment[];
  lastSeen: Date;
  totalSessions: number;
  completedSessions: number;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    CONFIRMED: 'bg-blue-50 border-blue-200 text-blue-700',
    CANCELLED: 'bg-rose-50 border-rose-200 text-rose-700',
    PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${map[status] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
      {status}
    </span>
  );
}

// ─── Patient Row ──────────────────────────────────────────────────────────────
function PatientRow({ group }: { group: PatientGroup }) {
  const [expanded, setExpanded] = useState(false);
  const initial = group.name[0]?.toUpperCase() || 'P';

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-all ${expanded ? 'border-purple-200 shadow-md' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-base shrink-0">
            {group.isAnonymous ? '?' : initial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-[#1B2559] text-sm">{group.name}</h4>
              {group.isAnonymous && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 uppercase">Anonyme</span>
              )}
            </div>
            {!group.isAnonymous && (
              <p className="text-xs text-slate-400 mt-0.5">{group.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Stats */}
          <div className="hidden sm:flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-[#1B2559]">{group.totalSessions}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Séances</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600">{group.completedSessions}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Complétées</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {group.lastSeen.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dernière séance</p>
            </div>
          </div>

          <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            expanded ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded session history */}
      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {group.appointments.map((appt) => {
            const start = new Date(appt.startAt);
            const end = new Date(appt.endAt);
            const duration = Math.round((end.getTime() - start.getTime()) / 60000);
            return (
              <div key={appt.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2559]">
                      {start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-slate-300">·</span>
                      {duration} min
                      <span className="text-slate-300">·</span>
                      {appt.sessionFormat || 'Vidéo'}
                    </p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PsyPatientHistory() {
  const [search, setSearch] = useState('');

  const { data: appointments, isLoading, isError } = useQuery<Appointment[]>({
    queryKey: ['psy-all-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments', { params: { limit: 500 } });
      const result = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
      return Array.isArray(result) ? result : [];
    },
  });

  // Group appointments by patient
  const patientGroups = useMemo<PatientGroup[]>(() => {
    if (!appointments?.length) return [];

    const map = new Map<string, PatientGroup>();

    for (const appt of appointments) {
      const pat = appt.patient;
      const name = pat?.isAnonymous
        ? (pat.anonymousName || 'Patient Anonyme')
        : `${pat?.firstName || ''} ${pat?.lastName || ''}`.trim() || 'Patient';
      const email = pat?.user?.email || '';
      // Use name+email as a unique key (or just name for anonymous)
      const key = pat?.isAnonymous ? `anon-${name}` : email || name;

      if (!map.has(key)) {
        map.set(key, {
          name,
          email,
          isAnonymous: !!pat?.isAnonymous,
          appointments: [],
          lastSeen: new Date(appt.startAt),
          totalSessions: 0,
          completedSessions: 0,
        });
      }

      const group = map.get(key)!;
      group.appointments.push(appt);
      group.totalSessions++;
      if (appt.status === 'COMPLETED' || appt.status === 'CONFIRMED') group.completedSessions++;
      const apptDate = new Date(appt.startAt);
      if (apptDate > group.lastSeen) group.lastSeen = apptDate;
    }

    // Sort each patient's sessions newest first
    map.forEach((g) => g.appointments.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()));

    // Sort patients by last session newest first
    return Array.from(map.values()).sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }, [appointments]);

  const filtered = patientGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPatients = patientGroups.length;
  const totalSessions = patientGroups.reduce((s, g) => s + g.totalSessions, 0);

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-5xl">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Patients suivis', value: totalPatients, icon: <Users className="w-5 h-5 text-purple-500" /> },
            { label: 'Séances totales', value: totalSessions, icon: <Calendar className="w-5 h-5 text-blue-500" /> },
            {
              label: 'Séances complétées',
              value: patientGroups.reduce((s, g) => s + g.completedSessions, 0),
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B2559]">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white">
            <XCircle className="w-10 h-10 text-red-300 mx-auto mb-4" />
            <h4 className="text-[#1B2559] font-bold text-sm">Erreur de chargement</h4>
            <p className="text-slate-400 text-xs mt-1">Vérifiez votre connexion et réessayez.</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-xs text-slate-400 font-semibold">
              {filtered.length} patient{filtered.length !== 1 ? 's' : ''} — cliquez pour voir l'historique des séances
            </p>
            <div className="space-y-3">
              {filtered.map((group) => (
                <PatientRow key={group.email || group.name} group={group} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="text-[#1B2559] font-bold text-sm">
              {search ? 'Aucun patient trouvé' : 'Aucun historique disponible'}
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              {search ? 'Essayez avec un autre nom ou email.' : 'Les séances passées apparaîtront ici.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-xs text-purple-600 hover:underline">
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
