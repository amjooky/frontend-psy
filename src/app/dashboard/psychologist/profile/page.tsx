"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import SecuritySetupCard from '@/components/security/SecuritySetupCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Settings, Save, AlertCircle, User, Shield, CheckCircle2 } from 'lucide-react';

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
      const parsed = Number(data.pricePerSession);
      setPricePerSession(data.pricePerSession != null && !isNaN(parsed) ? String(parsed) : '80');
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

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Psychologist Profile & Security</h2>
            <p className="text-slate-400 text-sm font-light mt-1.5">
              Manage your clinical biography, pricing, credentials, and authentication security.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Security Setup
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-900 space-y-6">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-3.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Professional Bio</label>
              <textarea
                rows={4}
                placeholder="Tell patients about your clinical approach, expertise, and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Specialties (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. CBT, Anxiety, Depression, Relationship Counseling"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Price per Session (TND)</label>
              <input
                type="number"
                min={0}
                value={pricePerSession}
                onChange={(e) => setPricePerSession(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all w-full md:w-auto"
            >
              <Save className="w-4 h-4" />
              Save Profile Settings
            </button>
          </div>
        ) : (
          <SecuritySetupCard userEmail={profile?.user?.email} />
        )}
      </div>
    </PsySidebarLayout>
  );
}

