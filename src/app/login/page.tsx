"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Lock, User, Eye, EyeOff, AlertCircle, Loader, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

const loginSchema = zod.object({
  email: zod.string().min(3, 'Veuillez saisir votre pseudo ou votre adresse email'),
  password: zod.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  twoFactorCode: zod.string().optional(),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);
      haptic.medium();

      const response = await api.post('/auth/login', values);

      if (response.data?.data?.requireTwoFactor) {
        setRequire2FA(true);
        setSubmitting(false);
        return;
      }

      const { accessToken, refreshToken, user } = response.data?.data || response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      haptic.success();

      if (user.role === 'PATIENT') {
        router.push('/dashboard/patient');
      } else if (user.role === 'PSYCHOLOGIST') {
        router.push('/dashboard/psychologist');
      } else {
        router.push('/dashboard/admin');
      }
    } catch (err: any) {
      haptic.warning();
      setErrorMessage(err.response?.data?.message || 'Identifiants invalides. Vérifiez votre pseudo ou mot de passe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 relative font-outfit">
      {/* Background glow decoration */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 relative z-10 shadow-xl">
        {/* LOGO & TITLE */}
        <div className="text-center mb-6">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2559] tracking-tight">Bon retour</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Accédez à votre espace thérapeutique sécurisé</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* EMAIL OR PSEUDO */}
          <div>
            <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Pseudo ou Adresse Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register('email')}
                placeholder="ex: Serein_2026 ou vous@email.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white focus:ring-2 focus:ring-teal-400/20 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 outline-none font-medium"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 text-xs sm:text-sm font-bold">Mot de passe</label>
              <Link href="/forgot-password" className="text-xs text-[#2EC4B6] hover:underline font-semibold">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
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
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* 2FA CODE (IF ENABLED) */}
          {require2FA && (
            <div>
              <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Code à 6 chiffres (2FA)</label>
              <input
                type="text"
                {...register('twoFactorCode')}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] font-mono text-center tracking-widest text-base"
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-900/10 transition-all active:scale-98"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-[#2EC4B6] hover:underline font-bold">
              Créer un espace privé en 1 clic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
