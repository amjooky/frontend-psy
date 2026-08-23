"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader, KeyRound, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

const schema = zod.object({
  email: zod.string().min(3, 'Veuillez saisir votre adresse email ou votre pseudo'),
});

type FormValues = zod.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);
      haptic.medium();

      await api.post('/auth/forgot-password', { email: values.email.trim() });
      haptic.success();
      setSubmitted(true);
    } catch (err: any) {
      haptic.warning();
      setErrorMessage(err.response?.data?.message || 'Impossible d\'envoyer le lien de réinitialisation. Vérifiez vos coordonnées.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 relative font-outfit">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 relative z-10 shadow-xl space-y-6">
        {/* LOGO */}
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center mb-4 group">
            <Image
              src="/logo.png"
              alt="MonPsy Logo"
              width={140}
              height={44}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl font-extrabold text-[#1B2559] tracking-tight">Récupération de compte</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Recevez un lien sécurisé pour réinitialiser votre mot de passe
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-900">Email de réinitialisation envoyé !</h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Si un compte correspond à cette adresse, vous recevrez un lien valable 1 heure pour choisir un nouveau mot de passe.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">
                Votre adresse email ou pseudo
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  {...register('email')}
                  placeholder="vous@email.com ou votre pseudo"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white focus:ring-2 focus:ring-teal-400/20 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 outline-none font-medium"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-98"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {submitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Sécurité et confidentialité garanties par MonPsy</span>
        </div>
      </div>
    </div>
  );
}
