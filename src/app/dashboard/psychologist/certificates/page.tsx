"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Award, Plus, Trash2, FileText, CheckCircle, ExternalLink, Loader } from 'lucide-react';

export default function PsyCertificates() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['psy-profile-certs'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      return res.data?.data || res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !issuer.trim()) return;
      const payload: any = { title: title.trim(), issuer: issuer.trim() };
      if (issuedAt) payload.issuedAt = issuedAt;
      return api.post('/psychologists/me/certificates', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-profile-certs'] });
      setTitle('');
      setIssuer('');
      setIssuedAt('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/psychologists/me/certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['psy-profile-certs'] });
    },
  });

  const certificates = Array.isArray(profile?.certificates) ? profile.certificates : [];

  return (
    <PsySidebarLayout>
      <div className="space-y-6 max-w-4xl font-outfit">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-[#1B2559] flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#7C3AED]" />
            Diplômes & Certificats
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Ajoutez vos titres et licences pour accélérer la vérification de votre profil.
          </p>
        </div>

        {/* Upload Form */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#1B2559]">Ajouter un certificat</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Titre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ex. Master en Psychologie Clinique"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Institution <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ex. Université de Tunis"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Date d&apos;obtention <span className="text-slate-400 font-normal normal-case">(optionnel)</span>
              </label>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => uploadMutation.mutate()}
              disabled={!title.trim() || !issuer.trim() || uploadMutation.isPending}
              className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0 shadow-md shadow-purple-500/10"
            >
              {uploadMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {uploadMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              Certificat ajouté avec succès !
            </div>
          )}

          {uploadMutation.isError && (
            <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              Impossible d&apos;ajouter le certificat. Vérifiez les champs requis.
            </p>
          )}
        </div>

        {/* Certificate List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid gap-3">
            {certificates.map((cert: any) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2559] text-sm">{cert.title || cert.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {cert.issuer && <span>{cert.issuer}</span>}
                      {cert.issuedAt && <span className="text-slate-400"> · {new Date(cert.issuedAt).getFullYear()}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                      cert.status === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : cert.status === 'PENDING'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {cert.status === 'VERIFIED' ? 'Vérifié' : cert.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                  </span>

                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-[#7C3AED] hover:bg-purple-50 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => deleteMutation.mutate(cert.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="text-[#1B2559] font-bold text-sm">Aucun certificat ajouté</h4>
            <p className="text-slate-500 text-xs mt-1.5">Ajoutez vos diplômes et licences ci-dessus.</p>
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
