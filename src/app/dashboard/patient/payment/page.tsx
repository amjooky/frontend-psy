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
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

type Provider = 'STRIPE' | 'PAYMEE' | 'MOCK';

const PROVIDERS: { id: Provider; label: string; desc: string; badge: string; icon: React.ReactNode }[] = [
  {
    id: 'MOCK',
    label: 'Paiement simulé',
    desc: 'Confirme instantanément la réservation — aucune carte requise (développement)',
    badge: 'DÉMONSTRATION',
    icon: <Zap className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'STRIPE',
    label: 'Stripe Checkout',
    desc: 'Visa, MasterCard, Amex — paiement international sécurisé',
    badge: 'INTERNATIONAL',
    icon: <CreditCard className="w-5 h-5 text-blue-400" />,
  },
  {
    id: 'PAYMEE',
    label: 'Paymee',
    desc: 'Carte bancaire tunisienne — paiement local en TND',
    badge: 'LOCAL (TND)',
    icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
  },
];

function PaymentWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId') as string;
  const [provider, setProvider] = useState<Provider>('MOCK');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
      if (data?.paymentUrl) {
        // MOCK redirects directly, real providers go to external checkout
        window.location.href = data.paymentUrl;
      } else {
        router.push('/dashboard/patient/appointments?paid=true');
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) {
        setErrorMsg('Cette consultation a déjà été réglée.');
      } else if (status === 400) {
        setErrorMsg(err?.response?.data?.message || 'Données invalides. Veuillez réessayer.');
      } else if (status === 403) {
        setErrorMsg('Vous n\'êtes pas autorisé à effectuer ce paiement.');
      } else {
        setErrorMsg('Une erreur est survenue. Veuillez réessayer.');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-900 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <CreditCard className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Réservation introuvable</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Impossible de récupérer les détails du paiement. Veuillez sélectionner une réservation confirmée.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/patient/appointments')}
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/10 transition-all text-sm group"
        >
          Voir mes rendez-vous
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Paiement</h2>
        <p className="text-slate-400 text-sm font-light mt-1.5">Réglez votre séance de consultation en toute sécurité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* ERROR */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          {/* PAYMENT METHODS */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-900 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Mode de paiement
            </h3>

            <div className="flex flex-col gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                    provider === p.id
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    provider === p.id ? 'bg-blue-600/20' : 'bg-slate-900'
                  }`}>
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{p.label}</span>
                      <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{p.badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-light mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                  {provider === p.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SECURITY NOTICE */}
          <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-900 flex items-start gap-4">
            <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-300 text-sm">Paiement sécurisé</h4>
              <p className="text-xs text-slate-500 font-light mt-1 leading-relaxed">
                Les transactions sont chiffrées SSL. Aucune donnée bancaire n'est stockée sur les serveurs MonPsy.
              </p>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-900 flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-900 pb-4">Récapitulatif</h3>

            <div className="space-y-4 text-sm font-light text-slate-400">
              <div className="flex justify-between">
                <span>Praticien</span>
                <span className="font-semibold text-white">
                  Dr. {appt.psychologist?.firstName} {appt.psychologist?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format</span>
                <span className="font-semibold text-white uppercase">{appt.sessionFormat}</span>
              </div>
              <div className="flex justify-between">
                <span>Durée</span>
                <span className="font-semibold text-white">60 minutes</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 mt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-white text-base">
                {Number(appt.price).toFixed(2)} {appt.currency}
              </span>
            </div>
            <button
              onClick={() => { setErrorMsg(null); payMutation.mutate(); }}
              disabled={payMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 transition-all"
            >
              {payMutation.isPending
                ? <><Loader className="w-4 h-4 animate-spin" /> Traitement en cours...</>
                : <>{provider === 'MOCK' ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} {provider === 'MOCK' ? 'Confirmer (simulation)' : 'Payer maintenant'}</>
              }
            </button>
            {provider === 'MOCK' && (
              <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                Mode simulation — aucun débit réel. La réservation sera confirmée instantanément.
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
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }>
        <PaymentWizardContent />
      </Suspense>
    </SidebarLayout>
  );
}
