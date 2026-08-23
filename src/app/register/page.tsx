"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  User,
  Award,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  Shield,
  ShieldCheck,
  Sparkles,
  Key,
  Copy,
  Check,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { haptic } from '@/lib/haptics';

const patientSchema = zod.object({
  pseudo: zod.string().min(3, 'Le pseudo doit comporter au moins 3 caractères').max(50),
  password: zod.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
  email: zod.string().email('Format d\'email invalide').optional().or(zod.literal('')),
});

const psySchema = zod.object({
  firstName: zod.string().min(2, 'Le prénom est requis'),
  lastName: zod.string().min(2, 'Le nom est requis'),
  email: zod.string().email('Veuillez saisir une adresse email valide'),
  licenseNumber: zod.string().min(3, 'Le numéro de licence est requis'),
  password: zod.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'PSYCHOLOGIST'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showOptionalEmail, setShowOptionalEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryModal, setRecoveryModal] = useState<{ open: boolean; key: string }>({ open: false, key: '' });
  const [copiedKey, setCopiedKey] = useState(false);

  const {
    register: registerPatient,
    handleSubmit: handleSubmitPatient,
    formState: { errors: patientErrors },
  } = useForm({
    resolver: zodResolver(patientSchema),
  });

  const {
    register: registerPsy,
    handleSubmit: handleSubmitPsy,
    formState: { errors: psyErrors },
  } = useForm({
    resolver: zodResolver(psySchema),
  });

  const onPatientSubmit = async (values: any) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);
      haptic.medium();

      const payload = {
        pseudo: values.pseudo.trim(),
        password: values.password,
        email: values.email?.trim() || undefined,
      };

      const res = await api.post('/auth/register/patient', payload);
      const data = res.data?.data || res.data;

      // Auto login patient
      try {
        const loginRes = await api.post('/auth/login', {
          email: values.pseudo.trim(),
          password: values.password,
        });
        const { accessToken, refreshToken, user } = loginRes.data?.data || loginRes.data;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch {}

      if (data?.recoveryKey) {
        haptic.success();
        setRecoveryModal({ open: true, key: data.recoveryKey });
      } else {
        router.push('/dashboard/patient');
      }
    } catch (err: any) {
      haptic.warning();
      setErrorMessage(err.response?.data?.message || 'L\'inscription a échoué. Ce pseudo est peut-être déjà utilisé.');
    } finally {
      setSubmitting(false);
    }
  };

  const onPsySubmit = async (values: any) => {
    try {
      setErrorMessage(null);
      setSubmitting(true);
      haptic.medium();

      await api.post('/auth/register/psychologist', values);
      haptic.success();
      router.push('/login?registered=true');
    } catch (err: any) {
      haptic.warning();
      setErrorMessage(err.response?.data?.message || 'L\'inscription a échoué. Vérifiez vos informations.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryModal.key);
    setCopiedKey(true);
    haptic.success();
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 sm:p-6 relative font-outfit">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] pointer-events-none" />

      {/* RECOVERY KEY POPUP MODAL */}
      {recoveryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#2EC4B6] border border-teal-100 flex items-center justify-center mx-auto shadow-sm">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1B2559]">Votre Clé de Récupération Secrète</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Puisque vous avez choisi une inscription anonyme, conservez cette clé. Elle vous permettra de restaurer votre compte en cas d'oubli de mot de passe.
              </p>
            </div>

            {/* Key Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <span className="font-mono text-base sm:text-lg font-bold text-[#1B2559] tracking-wider">
                {recoveryModal.key}
              </span>
              <button
                onClick={copyRecoveryKey}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copiedKey ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <button
              onClick={() => router.push('/dashboard/patient')}
              className="w-full py-3.5 rounded-2xl bg-[#1B2559] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder à mon espace privé</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 relative z-10 shadow-xl">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2559] tracking-tight">Espace Confidentiel</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            {role === 'PATIENT'
              ? 'Rejoignez MonPsy en 1 clic sans coordonnée personnelle requise'
              : 'Espace d\'exercice professionnel certifié pour praticiens'}
          </p>
        </div>

        {/* ROLE SELECTION PILL */}
        <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setRole('PATIENT');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'PATIENT'
                ? 'bg-white border border-slate-200 text-[#1B2559] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-[#2EC4B6]" />
            Espace Patient (Anonyme)
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.light();
              setRole('PSYCHOLOGIST');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'PSYCHOLOGIST'
                ? 'bg-white border border-slate-200 text-[#1B2559] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-[#7C3AED]" />
            Praticien
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* PATIENT ZERO-FRICTION ANONYMOUS FORM */}
        {role === 'PATIENT' ? (
          <form onSubmit={handleSubmitPatient(onPatientSubmit)} className="space-y-4">
            {/* ANONYMITY BADGE */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center gap-3 text-teal-800 text-xs">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <span>
                <strong>Confidentialité totale :</strong> Choisissez simplement un pseudo pour échanger avec vos praticiens en toute discrétion.
              </span>
            </div>

            {/* PSEUDO */}
            <div>
              <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Votre Pseudo / Nom d'emprunt</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  {...registerPatient('pseudo')}
                  placeholder="ex: Serein_2026 ou Alex"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:bg-white focus:ring-2 focus:ring-teal-400/20 transition-all text-xs sm:text-sm placeholder:text-slate-400 text-slate-800 outline-none font-medium"
                />
              </div>
              {patientErrors.pseudo && <p className="text-xs text-rose-500 mt-1">{patientErrors.pseudo.message as string}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-slate-700 text-xs sm:text-sm font-bold mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...registerPatient('password')}
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
              {patientErrors.password && <p className="text-xs text-rose-500 mt-1">{patientErrors.password.message as string}</p>}
            </div>

            {/* OPTIONAL EMAIL ACCORDION */}
            <div className="pt-1">
              {!showOptionalEmail ? (
                <button
                  type="button"
                  onClick={() => setShowOptionalEmail(true)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>+ Ajouter un email de secours (Optionnel)</span>
                </button>
              ) : (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-700 text-xs font-semibold">Email de récupération (Optionnel)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      {...registerPatient('email')}
                      placeholder="vous@email.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#2EC4B6]"
                    />
                  </div>
                  {patientErrors.email && <p className="text-xs text-rose-500 mt-1">{patientErrors.email.message as string}</p>}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#2EC4B6] hover:bg-[#25b5a7] disabled:bg-teal-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-500/20 transition-all active:scale-98"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {submitting ? 'Création en cours...' : 'Créer mon espace privé (1 clic)'}
            </button>
          </form>
        ) : (
          /* PSYCHOLOGIST PROFESSIONAL FORM */
          <form onSubmit={handleSubmitPsy(onPsySubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Prénom</label>
                <input
                  type="text"
                  {...registerPsy('firstName')}
                  placeholder="Dr. Jean"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#7C3AED]"
                />
                {psyErrors.firstName && <p className="text-xs text-rose-500 mt-1">{psyErrors.firstName.message as string}</p>}
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Nom</label>
                <input
                  type="text"
                  {...registerPsy('lastName')}
                  placeholder="Dupont"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#7C3AED]"
                />
                {psyErrors.lastName && <p className="text-xs text-rose-500 mt-1">{psyErrors.lastName.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1">Email Professionnel</label>
              <input
                type="email"
                {...registerPsy('email')}
                placeholder="dr.dupont@cabinet.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#7C3AED]"
              />
              {psyErrors.email && <p className="text-xs text-rose-500 mt-1">{psyErrors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1">Numéro d'exercice / Licence</label>
              <input
                type="text"
                {...registerPsy('licenseNumber')}
                placeholder="LIC-2026-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#7C3AED]"
              />
              {psyErrors.licenseNumber && <p className="text-xs text-rose-500 mt-1">{psyErrors.licenseNumber.message as string}</p>}
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1">Mot de passe</label>
              <input
                type="password"
                {...registerPsy('password')}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#7C3AED]"
              />
              {psyErrors.password && <p className="text-xs text-rose-500 mt-1">{psyErrors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-500/20 transition-all active:scale-98"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Validation...' : 'Soumettre mon dossier praticien'}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-[#2EC4B6] hover:underline font-bold">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
