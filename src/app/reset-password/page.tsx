"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

const schema = zod
  .object({
    newPassword: zod.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
    confirmPassword: zod.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormValues = zod.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setErrorMessage('Jeton de réinitialisation manquant. Veuillez cliquer sur le lien reçu par email.');
      return;
    }

    try {
      setErrorMessage(null);
      setSubmitting(true);
      haptic.medium();

      await api.post('/auth/reset-password', {
        token,
        newPassword: values.newPassword,
      });

      haptic.success();
      setSuccess(true);
    } catch (err: any) {
      haptic.warning();
      setErrorMessage(err.response?.data?.message || 'Le lien de réinitialisation est invalide ou a expiré.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
        <h2 className="text-2xl font-extrabold text-[#1B2559] tracking-tight">Nouveau mot de passe</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
          Définissez un nouveau mot de passe sécurisé pour votre compte
        </p>
      </div>

      {success ? (
        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-900">Mot de passe réinitialisé !</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4" />
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
            <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white focus:ring-2 focus:ring-teal-400/20 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white focus:ring-2 focus:ring-teal-400/20 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 outline-none font-medium"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-98"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {submitting ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span>Chiffrement SSL & Protection des comptes</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 relative font-outfit">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex justify-center p-8">
          <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
