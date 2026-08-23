"use client";

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SidebarLayout from '@/components/layout/SidebarLayout';
import {
  CreditCard,
  Loader,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  User,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

type Provider = 'MOCK' | 'STRIPE' | 'PAYMEE';

const PROVIDERS: {
  id: Provider;
  label: string;
  desc: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'MOCK',
    label: 'Confirmation immédiate (Simulateur)',
    desc: 'Validation instantanée de votre séance sans carte bancaire requise (Développement & Test)',
    badge: 'INSTANTANÉ',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'STRIPE',
    label: 'Carte Bancaire Internationale (Stripe)',
    desc: 'Visa, MasterCard, American Express — paiement international sécurisé',
    badge: 'VISA / MASTERCARD',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'PAYMEE',
    label: 'Paiement Local Tunisien (Paymee)',
    desc: 'Carte bancaire tunisienne, e-Dinar — règlement en Dinars Tunisiens (TND)',
    badge: 'LOCAL TND',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
  },
];

function PaymentWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId') as string;
  const [provider, setProvider] = useState<Provider>('MOCK');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch appointment data
  const { data: appt, isLoading } = useQuery({
    queryKey: ['payment-appointment', appointmentId],
    queryFn: async () => {
      const res = await api.get(`/appointments`);
      const apptList = res.data?.data?.data || [];
      return apptList.find((a: any) => a.id === appointmentId);
    },
    enabled: !!appointmentId,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/initiate', {
        appointmentId,
        provider,
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: (data) => {
      haptic.success();
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push('/dashboard/patient/appointments?paid=true');
      }
    },
    onError: (err: any) => {
      haptic.warning();
      const status = err?.response?.status;
      if (status === 409) {
        setErrorMsg('Cette consultation a déjà été réglée avec succès.');
      } else if (status === 400) {
        setErrorMsg(err?.response?.data?.message || 'Données invalides. Veuillez réessayer.');
      } else if (status === 403) {
        setErrorMsg('Vous n\'êtes pas autorisé à effectuer ce paiement.');
      } else {
        setErrorMsg('Une erreur est survenue lors de l\'initialisation du paiement.');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400 font-outfit">
        <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
        <p className="text-sm font-medium">Chargement des détails de votre consultation...</p>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 rounded-3xl bg-white border border-slate-100 text-center space-y-6 shadow-sm font-outfit">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#1B2559]">Consultation introuvable</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Impossible de récupérer les détails du rendez-vous. Veuillez vérifier vos réservations confirmées.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/patient/appointments')}
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
        >
          Retour à mes rendez-vous
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const formattedDate = new Date(appt.startAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl font-outfit pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-[#2EC4B6] border border-teal-100 uppercase">
            Étape 2 sur 2
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2559] tracking-tight">Finaliser votre réservation</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Sélectionnez votre mode de règlement sécurisé pour confirmer définitivement votre consultation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: PAYMENT METHODS & SECURITY */}
        <div className="lg:col-span-2 space-y-6">
          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PAYMENT METHODS SELECTOR */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#1B2559] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2EC4B6]" />
              Choisissez votre mode de paiement
            </h3>

            <div className="space-y-3">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      haptic.light();
                      setProvider(p.id);
                    }}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-4 transition-all relative ${
                      isSelected
                        ? 'bg-teal-50/40 border-teal-400 ring-2 ring-teal-400/20 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${p.iconBg} ${p.iconColor}`}>
                      {p.id === 'MOCK' ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#1B2559] text-sm sm:text-base">{p.label}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{p.desc}</p>
                    </div>

                    <div className="absolute right-4 top-5">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#2EC4B6] border-[#2EC4B6] text-white shadow-sm'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECURITY BADGES */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#1B2559] text-sm">Garantie & Confidentialité Médicale</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Toutes les transactions sont chiffrées selon les normes bancaires SSL 256-bits. Aucune coordonnée bancaire n'est conservée. Vous recevrez automatiquement une facture acquittée après confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONSULTATION ORDER SUMMARY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-md flex flex-col justify-between space-y-6 sticky top-24">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1B2559]">Récapitulatif de la séance</h3>
              <span className="text-xs text-slate-400 font-medium">Détails de votre consultation</span>
            </div>

            {/* Doctor Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200">
                {appt.psychologist?.firstName?.[0] || 'D'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1B2559] truncate">
                  Dr. {appt.psychologist?.firstName} {appt.psychologist?.lastName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">Psychologue clinicien certifié</div>
              </div>
            </div>

            {/* Appointment Details list */}
            <div className="space-y-3 text-xs sm:text-sm font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Date & Heure
                </span>
                <span className="font-bold text-[#1B2559] text-right">{formattedDate}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-500">
                  <Video className="w-4 h-4 text-teal-600" />
                  Format
                </span>
                <span className="font-bold text-[#1B2559] uppercase">{appt.sessionFormat || 'VIDÉO'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Durée
                </span>
                <span className="font-bold text-[#1B2559]">60 minutes</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Montant total</span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1B2559]">
                  {Number(appt.price).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5 uppercase">{appt.currency || 'TND'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setErrorMsg(null);
                payMutation.mutate();
              }}
              disabled={payMutation.isPending}
              className="w-full py-4 rounded-2xl bg-[#1B2559] hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-98"
            >
              {payMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                <>
                  {provider === 'MOCK' ? <Zap className="w-4 h-4 text-teal-300" /> : <Lock className="w-4 h-4" />}
                  {provider === 'MOCK' ? 'Confirmer la réservation (Simulation)' : 'Procéder au paiement'}
                </>
              )}
            </button>

            {provider === 'MOCK' && (
              <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium">
                Mode démonstration : votre séance sera validée immédiatement sans débit bancaire réel.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentWizard() {
  return (
    <SidebarLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400 font-outfit">
          <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
          <p className="text-sm font-medium">Chargement...</p>
        </div>
      }>
        <PaymentWizardContent />
      </Suspense>
    </SidebarLayout>
  );
}
