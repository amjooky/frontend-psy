"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { User, Award, Mail, Lock, Eye, EyeOff, AlertCircle, Loader, Shield } from 'lucide-react';
import api from '@/lib/api';

const registerSchema = zod.object({
  email: zod.string().email('Veuillez saisir une adresse email valide'),
  password: zod.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
  firstName: zod.string().min(2, 'Le prénom est requis'),
  lastName: zod.string().min(2, 'Le nom est requis'),
  licenseNumber: zod.string().optional(),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'PSYCHOLOGIST'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);

      const endpoint = role === 'PATIENT' ? '/auth/register/patient' : '/auth/register/psychologist';
      await api.post(endpoint, values);

      router.push('/login?registered=true');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'L\'inscription a échoué. Vérifiez vos coordonnées.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative font-outfit">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-150 rounded-3xl p-8 relative z-10 shadow-xl">
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6 group">
            <Image
              src="/logo.png"
              alt="MonPsy Logo"
              width={400}
              height={100}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight">Créer un compte</h2>
          <p className="text-slate-500 text-sm font-light mt-2">Rejoignez MonPsy pour un accompagnement psychologique de qualité</p>
        </div>

        {/* ROLE SELECTION */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${role === 'PATIENT'
                ? 'bg-white border border-slate-150 text-[#1B2559] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <User className="w-4.5 h-4.5 text-[#2EC4B6]" />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('PSYCHOLOGIST')}
            className={`py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${role === 'PSYCHOLOGIST'
                ? 'bg-white border border-slate-150 text-[#1B2559] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Award className="w-4.5 h-4.5 text-[#7C3AED]" />
            Psychologue
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* NAME ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                {...register('firstName')}
                placeholder="Jean"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
              />
              {errors.firstName && <p className="text-xs text-rose-500 mt-1.5">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                {...register('lastName')}
                placeholder="Dupont"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
              />
              {errors.lastName && <p className="text-xs text-rose-500 mt-1.5">{errors.lastName.message}</p>}
            </div>
          </div>

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

          {/* LICENSE NUMBER (Psychologists only) */}
          {role === 'PSYCHOLOGIST' && (
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Numéro de licence professionnelle</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  {...register('licenseNumber')}
                  placeholder="LIC-XXXXX"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] transition-all text-sm placeholder:text-slate-400 text-slate-800 outline-none"
                />
              </div>
              {errors.licenseNumber && <p className="text-xs text-rose-500 mt-1.5">{errors.licenseNumber.message}</p>}
            </div>
          )}

          {/* PASSWORD */}
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Mot de passe</label>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 mt-8 shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all text-sm"
          >
            {submitting ? <Loader className="w-5 h-5 animate-spin" /> : null}
            {role === 'PSYCHOLOGIST' ? 'Soumettre l\'inscription' : 'S\'inscrire'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 font-light">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-[#2EC4B6] hover:underline font-normal">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
