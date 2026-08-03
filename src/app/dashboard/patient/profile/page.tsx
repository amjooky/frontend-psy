"use client";

import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SecuritySetupCard from '@/components/security/SecuritySetupCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Save, Loader, Shield, CheckCircle2 } from 'lucide-react';

export default function PatientProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Africa/Tunis');
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch own profile
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-profile-data'],
    queryFn: async () => {
      const res = await api.get('/patients/me');
      const data = res.data?.data || res.data || {};
      if (data) {
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phoneNumber || '');
        setTimezone(data.timezone || 'Africa/Tunis');
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch('/patients/me', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile-data'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await saveMutation.mutateAsync({
        firstName,
        lastName,
        phoneNumber: phone,
        timezone,
      });
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-[#2EC4B6]" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight flex items-center gap-2.5">
              <User className="w-7 h-7 text-[#2EC4B6]" />
              Mon Compte & Paramètres
            </h2>
            <p className="text-slate-400 text-sm font-light mt-1">
              Gérez vos informations personnelles, votre fuseau horaire et votre sécurité.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#2EC4B6] text-white shadow-md shadow-teal-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profil Personnel
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'security'
                  ? 'bg-[#2EC4B6] text-white shadow-md shadow-teal-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Sécurité & 2FA
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PROFILE FORM */}
            <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-[#1B2559]">
                Informations Personnelles
              </h3>

              {saveSuccess && (
                <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  Profil mis à jour avec succès !
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Téléphone de contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fuseau horaire</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6] outline-none text-xs text-slate-700 transition-colors"
                  >
                    <option value="Africa/Tunis">Tunis (GMT+1)</option>
                    <option value="Europe/Paris">Paris (GMT+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] disabled:bg-teal-200 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-teal-500/10 transition-all"
                >
                  {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer les modifications
                </button>
              </div>
            </div>

            {/* PRIVACY & QUICK SECURITY */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 h-fit shadow-sm">
              <h3 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#7C3AED]" />
                Aperçu Sécurité
              </h3>

              <div className="space-y-4 text-xs font-light text-slate-500 leading-relaxed">
                <p>Email associé : <span className="font-bold text-[#1B2559]">{patient?.user?.email}</span></p>
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <h4 className="font-bold text-[#1B2559]">
                    Sécurité & Connexion
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal font-light">
                    Modifiez votre mot de passe, activez l&apos;authentification à deux facteurs (2FA) et gérez vos sessions.
                  </p>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition-all shadow-md shadow-purple-500/10"
                  >
                    Gérer la sécurité
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SecuritySetupCard userEmail={patient?.user?.email} />
        )}
      </div>
    </SidebarLayout>
  );
}
