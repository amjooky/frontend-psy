"use client";

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ShieldCheck,
  Key,
  Smartphone,
  LogOut,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SecuritySetupCardProps {
  userEmail?: string;
  initial2FaEnabled?: boolean;
}

export default function SecuritySetupCard({ userEmail, initial2FaEnabled }: SecuritySetupCardProps) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA state
  const [is2FaEnabled, setIs2FaEnabled] = useState(initial2FaEnabled ?? false);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [disableTotpCode, setDisableTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [tfaSuccess, setTfaSuccess] = useState<string | null>(null);
  const [tfaError, setTfaError] = useState<string | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);

  React.useEffect(() => {
    if (initial2FaEnabled !== undefined) {
      setIs2FaEnabled(initial2FaEnabled);
    } else if (typeof window !== 'undefined') {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.isTwoFactorEnabled !== undefined) {
          setIs2FaEnabled(!!storedUser.isTwoFactorEnabled);
        }
      } catch {}
    }
  }, [initial2FaEnabled]);

  // Logout All state
  const [logoutSuccess, setLogoutSuccess] = useState<string | null>(null);

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas.');
      }
      if (newPassword.length < 8) {
        throw new Error('Le mot de passe doit comporter au moins 8 caractères.');
      }
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setPasswordSuccess('Mot de passe modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setTimeout(() => setPasswordSuccess(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Échec de la modification du mot de passe.';
      setPasswordError(Array.isArray(msg) ? msg.join(', ') : msg);
      setPasswordSuccess(null);
      setTimeout(() => setPasswordError(null), 5000);
    },
  });

  // Setup 2FA
  const setup2FaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get('/auth/2fa/setup');
      return res.data?.data || res.data;
    },
    onSuccess: (data: any) => {
      setTotpSecret(data.secret || data.otpauthUrl);
      setQrCodeUrl(data.qrCodeUrl || data.qrCode);
      setTfaError(null);
    },
    onError: (err: any) => {
      setTfaError(err.response?.data?.message || 'Échec de la génération des paramètres 2FA.');
    },
  });

  // Enable 2FA Mutation
  const enable2FaMutation = useMutation({
    mutationFn: async () => {
      if (!totpCode || totpCode.length < 6) {
        throw new Error('Veuillez entrer un code à 6 chiffres valide');
      }
      const res = await api.post('/auth/2fa/enable', {
        secret: totpSecret,
        code: totpCode,
      });
      return res.data;
    },
    onSuccess: () => {
      setIs2FaEnabled(true);
      setTotpSecret(null);
      setQrCodeUrl(null);
      setTotpCode('');
      setTfaSuccess('L\'authentification à deux facteurs est maintenant activée !');
      setTfaError(null);
      if (typeof window !== 'undefined') {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.isTwoFactorEnabled = true;
          localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      }
      setTimeout(() => setTfaSuccess(null), 4000);
    },
    onError: (err: any) => {
      setTfaError(err.response?.data?.message || err.message || 'Échec de l\'activation de la 2FA.');
      setTimeout(() => setTfaError(null), 5000);
    },
  });

  // Disable 2FA Mutation
  const disable2FaMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/2fa/disable', { code: disableTotpCode });
      return res.data;
    },
    onSuccess: () => {
      setIs2FaEnabled(false);
      setShowDisableModal(false);
      setDisableTotpCode('');
      setTfaSuccess('Authentification à deux facteurs désactivée.');
      setTfaError(null);
      if (typeof window !== 'undefined') {
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.isTwoFactorEnabled = false;
          localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      }
      setTimeout(() => setTfaSuccess(null), 4000);
    },
    onError: (err: any) => {
      setTfaError(err.response?.data?.message || 'Échec de la désactivation de la 2FA.');
      setTimeout(() => setTfaError(null), 5000);
    },
  });

  // Logout All Devices Mutation
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/logout/all');
      return res.data;
    },
    onSuccess: () => {
      setLogoutSuccess('Déconnexion réussie de toutes les autres sessions actives.');
      setTimeout(() => setLogoutSuccess(null), 4000);
    },
  });

  const handleCopySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* CHANGE PASSWORD */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 text-[#2EC4B6] flex items-center justify-center font-bold shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2559]">Changer le mot de passe</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Mettez à jour régulièrement votre mot de passe pour garantir la sécurité de vos données.</p>
            </div>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2.5 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2.5 text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-3 pr-10 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="Min 8 caractères"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-3 pr-10 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Confirmer le nouveau</label>
            <input
              type="password"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-3 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => changePasswordMutation.mutate()}
            disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
            className="px-6 py-3 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] disabled:bg-teal-200 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-teal-500/10"
          >
            {changePasswordMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Mettre à jour le mot de passe
          </button>
        </div>
      </div>

      {/* TWO-FACTOR AUTHENTICATION */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2559]">Authentification à deux facteurs (2FA)</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Ajoutez une protection supplémentaire avec Google Authenticator ou Authy.</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              is2FaEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {is2FaEnabled ? 'Activé' : 'Désactivé'}
          </span>
        </div>

        {tfaSuccess && (
          <div className="flex items-center gap-2.5 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{tfaSuccess}</span>
          </div>
        )}

        {tfaError && (
          <div className="flex items-center gap-2.5 text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{tfaError}</span>
          </div>
        )}

        {!is2FaEnabled && !totpSecret && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="text-xs font-light text-slate-600">
              <p className="text-[#1B2559] font-bold">La protection 2FA est actuellement désactivée.</p>
              <p className="mt-0.5 text-slate-400">L&apos;activation demande un code de vérification à chaque connexion.</p>
            </div>
            <button
              onClick={() => setup2FaMutation.mutate()}
              disabled={setup2FaMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-200 text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow-md shadow-purple-500/10"
            >
              {setup2FaMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Configurer la 2FA
            </button>
          </div>
        )}

        {/* 2FA SETUP MODAL / STEP */}
        {totpSecret && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
            <h4 className="text-xs font-bold text-[#1B2559] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center">1</span>
              Scannez le QR Code ou copiez la clé
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-2xl w-fit mx-auto md:mx-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain" />
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                  QR Code non affiché. Utilisez la clé ci-dessous.
                </div>
              )}

              <div className="space-y-4 text-xs font-light text-slate-500">
                <p>Scannez ce code QR avec votre application d&apos;authentification (Google Authenticator, Authy ou 1Password).</p>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Clé Secrète</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 rounded-xl bg-white border border-slate-200 text-[#7C3AED] text-xs font-mono break-all">
                      {totpSecret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-500 transition-colors"
                      title="Copier la clé"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-[#1B2559] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center">2</span>
                Saisissez le code à 6 chiffres
              </h4>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full sm:w-48 text-center tracking-[0.4em] font-mono text-base bg-white border border-slate-200 text-slate-800 rounded-xl p-3 focus:border-[#7C3AED] focus:outline-none"
                />

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => enable2FaMutation.mutate()}
                    disabled={totpCode.length < 6 || enable2FaMutation.isPending}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-200 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                  >
                    {enable2FaMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirmer & Activer la 2FA
                  </button>

                  <button
                    onClick={() => {
                      setTotpSecret(null);
                      setQrCodeUrl(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DISABLE 2FA OPTION */}
        {is2FaEnabled && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-light text-slate-600">
              <p className="font-bold text-emerald-800">La 2FA est actuellement active sur votre compte.</p>
              <p className="text-slate-500 mt-0.5">Votre compte est protégé par l&apos;authentification à deux facteurs.</p>
            </div>
            <button
              onClick={() => setShowDisableModal(!showDisableModal)}
              className="px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all shrink-0"
            >
              Désactiver la 2FA
            </button>
          </div>
        )}

        {showDisableModal && (
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
            <p className="text-xs font-bold text-rose-800">Confirmation de désactivation</p>
            <p className="text-xs text-slate-600">Entrez le code de votre application d&apos;authentification pour désactiver la 2FA :</p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={disableTotpCode}
                onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-40 text-center tracking-[0.3em] font-mono text-sm bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 focus:border-rose-500 focus:outline-none"
              />
              <button
                onClick={() => disable2FaMutation.mutate()}
                disabled={disableTotpCode.length < 6 || disable2FaMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-300 text-white text-xs font-bold flex items-center gap-2"
              >
                {disable2FaMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirmer la désactivation'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SESSION MANAGEMENT */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center font-bold shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2559]">Sessions & Appareils Actifs</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Révoquez les accès sur tous les navigateurs et appareils connectés.</p>
            </div>
          </div>
        </div>

        {logoutSuccess && (
          <div className="flex items-center gap-2.5 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{logoutSuccess}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-light text-slate-500">
            <p className="text-[#1B2559] font-bold">Se déconnecter de tous les autres appareils</p>
            <p className="mt-0.5 text-slate-400">Cette action invalidera toutes les sessions sauf la session actuelle.</p>
          </div>
          <button
            onClick={() => logoutAllMutation.mutate()}
            disabled={logoutAllMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
          >
            {logoutAllMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Déconnexion globale
          </button>
        </div>
      </div>
    </div>
  );
}
