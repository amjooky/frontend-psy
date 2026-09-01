"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import SecuritySetupCard from '@/components/security/SecuritySetupCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Save, User, Shield, CheckCircle2, Loader, Settings } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function PsyProfileSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [pricePerSession, setPricePerSession] = useState<string>('80');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['psy-profile-settings'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      const data = res.data?.data || res.data || {};
      setBio(data.biography || '');
      setSpecialties(data.specialties?.map((s: any) => s.specialty).join(', ') || '');
      setPricePerSession(formatPrice(data.pricePerSession, 80, 0));
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const specialtiesArray = specialties.split(',').map((s) => s.trim()).filter(Boolean);
      const price = Number(pricePerSession);
      return api.patch('/psychologists/me/profile', {
        biography: bio,
        pricePerSession: String(isNaN(price) ? 0 : price),
      }).then(() => {
        return api.put('/psychologists/me/specialties', { specialties: specialtiesArray });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-profile-settings'] });
      queryClient.invalidateQueries({ queryKey: ['psy-overview-stats'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <PsySidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-[#7C3AED]" />
        </div>
      </PsySidebarLayout>
    );
  }

  return (
    <PsySidebarLayout>
      <div className="space-y-8 max-w-5xl font-outfit">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-[#7C3AED]" />
              Profil & Tarifs
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Gérez votre biographie clinique, vos spécialités, vos tarifs et votre sécurité.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'security'
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Sécurité
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-[#1B2559]">Informations professionnelles</h3>

              {saveSuccess && (
                <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  Profil mis à jour avec succès !
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Biographie professionnelle
                </label>
                <textarea
                  rows={5}
                  placeholder="Présentez votre approche clinique, votre expertise et votre expérience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none resize-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Spécialités (séparées par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="ex. TCC, Anxiété, Dépression, Thérapie de couple"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Tarif par séance (TND)
                </label>
                <input
                  type="number"
                  min={0}
                  value={pricePerSession}
                  onChange={(e) => setPricePerSession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-200 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-purple-500/10"
                >
                  {saveMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer les modifications
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 h-fit shadow-sm">
              <h3 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#7C3AED]" />
                Aperçu compte
              </h3>

              <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                <p>
                  Email : <span className="font-bold text-[#1B2559]">{profile?.user?.email || '—'}</span>
                </p>
                <p>
                  Statut :{' '}
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      profile?.status === 'ACTIVE'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : profile?.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {profile?.status === 'PENDING_VERIFICATION' ? 'En attente' : profile?.status || '—'}
                  </span>
                </p>

                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <h4 className="font-bold text-[#1B2559]">Sécurité & Connexion</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Modifiez votre mot de passe, activez la 2FA et gérez vos sessions actives.
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
          <SecuritySetupCard 
            userEmail={profile?.user?.email} 
            initial2FaEnabled={profile?.user?.isTwoFactorEnabled} 
          />
        )}
      </div>
    </PsySidebarLayout>
  );
}
