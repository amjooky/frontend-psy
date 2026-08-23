"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Calendar,
  Video,
  Clock,
  Check,
  X,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  CalendarClock,
  ArrowUpRight,
  Filter,
  User,
  Shield,
  Phone,
  Mail,
  Loader,
} from 'lucide-react';

export default function PsyAppointments() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cancelModalAppt, setCancelModalAppt] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['psy-appointments-full'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      const result = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
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
      setCancelModalAppt(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['psy-appointments-full'] });
      queryClient.invalidateQueries({ queryKey: ['psy-appointments'] });
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a: any) => a.status === 'PENDING').length;
    const confirmed = appointments.filter((a: any) => a.status === 'CONFIRMED').length;
    const completed = appointments.filter((a: any) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a: any) => a.status === 'CANCELLED').length;
    return { total, pending, confirmed, completed, cancelled };
  }, [appointments]);

  // Filter & Search
  const filtered = useMemo(() => {
    return appointments.filter((appt: any) => {
      const matchesStatus = filterStatus === 'ALL' || appt.status === filterStatus;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const patientName = appt.patient?.isAnonymous
        ? (appt.patient?.anonymousName || 'patient anonyme').toLowerCase()
        : `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.toLowerCase();
      const email = (appt.patient?.user?.email || '').toLowerCase();
      const id = (appt.id || '').toLowerCase();

      return patientName.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [appointments, filterStatus, searchQuery]);

  const formatDateFrench = (dateStr: string) => {
    if (!dateStr) return 'Date non spécifiée';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurationMins = (startAt: string, endAt: string) => {
    if (!startAt || !endAt) return 60;
    const diff = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000);
    return diff > 0 ? diff : 60;
  };

  return (
    <PsySidebarLayout>
      <div className="space-y-8 max-w-6xl font-outfit">
        {/* HEADER / INTRO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559]">Gestion des Rendez-vous</h2>
            <p className="text-sm text-slate-500 mt-1">
              Consultez vos consultations à venir, acceptez les nouvelles demandes et lancez vos séances vidéo.
            </p>
          </div>
          <Link
            href="/dashboard/psychologist/availability"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7C3AED] text-xs font-bold transition-all shrink-0 self-start md:self-auto"
          >
            <Clock className="w-4 h-4" />
            Modifier mes disponibilités
          </Link>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setFilterStatus('ALL')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white border-[#7C3AED] shadow-sm ring-1 ring-[#7C3AED]/20'
                : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1B2559] mt-2">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-1">Toutes réservations confondues</p>
          </div>

          <div
            onClick={() => setFilterStatus('PENDING')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'PENDING'
                ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/20'
                : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">En attente</span>
              <div className={`w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ${stats.pending > 0 ? 'animate-pulse' : ''}`}>
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</div>
            <p className="text-[11px] text-slate-400 mt-1">À accepter ou refuser</p>
          </div>

          <div
            onClick={() => setFilterStatus('CONFIRMED')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'CONFIRMED'
                ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Confirmés</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{stats.confirmed}</div>
            <p className="text-[11px] text-slate-400 mt-1">Séances prêtes à démarrer</p>
          </div>

          <div
            onClick={() => setFilterStatus('CANCELLED')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'CANCELLED'
                ? 'bg-white border-rose-500 shadow-sm ring-1 ring-rose-500/20'
                : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Annulés</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <CalendarX2Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2">{stats.cancelled}</div>
            <p className="text-[11px] text-slate-400 mt-1">Non honorés ou rejetés</p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par patient ou ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1B2559] placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
            />
          </div>

          {/* STATUS TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
            {[
              { id: 'ALL', label: 'Tous', count: stats.total },
              { id: 'PENDING', label: 'En attente', count: stats.pending, color: 'text-amber-600' },
              { id: 'CONFIRMED', label: 'Confirmés', count: stats.confirmed, color: 'text-emerald-600' },
              { id: 'COMPLETED', label: 'Terminés', count: stats.completed },
              { id: 'CANCELLED', label: 'Annulés', count: stats.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterStatus === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* APPOINTMENTS LIST */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="w-36 h-4 bg-slate-100 rounded" />
                    <div className="w-48 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-28 h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white border border-dashed border-red-200 rounded-3xl p-8">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#1B2559]">Échec du chargement des rendez-vous</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion et rechargez la page.
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((appt: any) => {
              const isAnonymous = Boolean(appt.patient?.isAnonymous);
              const patientName = isAnonymous
                ? (appt.patient?.anonymousName || 'Patient Anonyme')
                : `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.trim() || 'Patient';
              const patientInitial = isAnonymous ? 'A' : (appt.patient?.firstName?.[0] || 'P').toUpperCase();
              const durationMins = getDurationMins(appt.startAt, appt.endAt);

              return (
                <div
                  key={appt.id}
                  className="p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left info: Patient & Timing */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] font-bold text-base shrink-0">
                      {isAnonymous ? <Shield className="w-5 h-5 text-[#7C3AED]" /> : patientInitial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[#1B2559] text-base truncate">
                          {patientName}
                        </h4>
                        {isAnonymous && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] text-[10px] font-bold tracking-wider uppercase border border-purple-100">
                            Anonyme
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : appt.status === 'PENDING'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : appt.status === 'COMPLETED'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          {appt.status === 'CONFIRMED'
                            ? 'Confirmé'
                            : appt.status === 'PENDING'
                            ? 'En attente'
                            : appt.status === 'COMPLETED'
                            ? 'Terminé'
                            : 'Annulé'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold capitalize">
                          <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                          {formatDateFrench(appt.startAt)}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(appt.startAt)} - {formatTime(appt.endAt)} ({durationMins} min)
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Video className="w-3.5 h-3.5 text-blue-500" />
                          Consultation Vidéo HD
                        </span>
                        {appt.price && (
                          <span className="font-bold text-[#1B2559]">
                            {Number(appt.price).toFixed(0)} {appt.currency || 'TND'}
                          </span>
                        )}
                      </div>

                      {appt.notes && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                          <span className="font-semibold text-slate-700">Note du patient:</span> {appt.notes}
                        </p>
                      )}

                      {appt.cancellationReason && appt.status === 'CANCELLED' && (
                        <p className="mt-2 text-xs text-rose-600 bg-rose-50/50 p-2 rounded-lg border border-rose-100 max-w-xl">
                          <span className="font-semibold">Motif d'annulation:</span> {appt.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right actions: Join session / Accept / Refuse / Cancel */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                    {appt.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptMutation.mutate(appt.id)}
                          disabled={acceptMutation.isPending}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          {acceptMutation.isPending ? 'Confirmation...' : 'Accepter'}
                        </button>
                        <button
                          onClick={() => setCancelModalAppt(appt)}
                          className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <X className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    )}

                    {appt.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/psychologist/session/${appt.id}`}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-500/20"
                        >
                          <Video className="w-4 h-4" />
                          Rejoindre la séance
                        </Link>
                        <button
                          onClick={() => setCancelModalAppt(appt)}
                          className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium transition-all"
                          title="Annuler le rendez-vous"
                        >
                          Annuler
                        </button>
                      </div>
                    )}

                    {appt.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Séance effectuée
                      </span>
                    )}

                    {appt.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        Annulé
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] mx-auto mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-[#1B2559]">Aucun rendez-vous trouvé</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Aucune consultation ne correspond à votre recherche.'
                : 'Aucune consultation n\'est enregistrée pour ce statut.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all"
                >
                  Effacer la recherche
                </button>
              )}
              <Link
                href="/dashboard/psychologist/availability"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white transition-all"
              >
                Gérer mes plages horaires
              </Link>
            </div>
          </div>
        )}

        {/* CANCEL MODAL */}
        {cancelModalAppt && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => { setCancelModalAppt(null); setCancelReason(''); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#1B2559]">
                {cancelModalAppt.status === 'PENDING' ? 'Refuser la consultation' : 'Annuler la consultation'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Veuillez indiquer un motif. Le patient recevra une notification explicative.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif d'annulation <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Imprévu médical, indisponibilité exceptionnelle..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1B2559] placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setCancelModalAppt(null); setCancelReason(''); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => cancelMutation.mutate({ id: cancelModalAppt.id, reason: cancelReason || 'Annulé par le psychologue' })}
                  disabled={cancelMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {cancelMutation.isPending ? 'En cours...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}

function CalendarX2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="m14 14-4 4" />
      <path d="m10 14 4 4" />
    </svg>
  );
}
