"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import api from '@/lib/api';

const loginSchema = zod.object({
  email: zod.string().email('Veuillez saisir une adresse email valide'),
  password: zod.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
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

      const response = await api.post('/auth/login', values);

      if (response.data?.data?.requireTwoFactor) {
        setRequire2FA(true);
        setSubmitting(false);
        return;
      }

      const { accessToken, refreshToken, user } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'PATIENT') {
        router.push('/dashboard/patient');
      } else if (user.role === 'PSYCHOLOGIST') {
        router.push('/dashboard/psychologist');
      } else {
        router.push('/dashboard/admin');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative font-outfit">
      {/* Background glow decoration */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-150 rounded-3xl p-8 relative z-10 shadow-xl">
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6 group">
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
          <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight">Bon retour</h2>
          <p className="text-slate-500 text-sm font-light mt-2">Connectez-vous pour accéder à votre espace sécurisé</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!require2FA ? (
            <>
              {/* EMAIL */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="vous@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1.5">{errors.email.message}</p>}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-700 text-sm font-medium">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-[#2EC4B6] hover:underline">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1.5">{errors.password.message}</p>}
              </div>
            </>
          ) : (
            /* 2FA CODE */
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Code de vérification 2FA</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  {...register('twoFactorCode')}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm text-center tracking-widest placeholder:tracking-normal placeholder:text-slate-400 outline-none"
                />
              </div>
              {errors.twoFactorCode && <p className="text-xs text-rose-500 mt-1.5">{errors.twoFactorCode.message}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 mt-8 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all text-sm"
          >
            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : null}
            {require2FA ? 'Vérifier et Se Connecter' : 'Se Connecter'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 font-light">
          Vous n&apos;avez pas de compte ?{' '}
          <Link href="/register" className="text-[#2EC4B6] hover:underline font-normal">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
}
