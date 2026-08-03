"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Award, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';

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
      <div className="space-y-6 max-w-4xl">

        {/* Upload Form */}
        <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Add a Certificate</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Certificate Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Master in Clinical Psychology"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Issuing Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Université de Tunis"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Issue Date <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => uploadMutation.mutate()}
              disabled={!title.trim() || !issuer.trim() || uploadMutation.isPending}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              {uploadMutation.isPending ? 'Saving...' : 'Add Certificate'}
            </button>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900/40 rounded-xl px-4 py-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Certificate added successfully!
            </div>
          )}

          {uploadMutation.isError && (
            <p className="text-red-400 text-xs">
              Failed to add certificate. Please check all required fields.
            </p>
          )}
        </div>

        {/* Certificate List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/30 animate-pulse border border-slate-900/40" />
            ))}
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid gap-3">
            {certificates.map((cert: any) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">{cert.title || cert.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {cert.issuer && <span className="mr-2">{cert.issuer}</span>}
                      {cert.issuedAt && <span>· {new Date(cert.issuedAt).getFullYear()}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    cert.status === 'VERIFIED' ? 'bg-emerald-950 border-emerald-900 text-emerald-400' :
                    cert.status === 'PENDING'  ? 'bg-amber-950  border-amber-900  text-amber-400'   :
                    'bg-rose-950 border-rose-900 text-rose-400'
                  }`}>
                    {cert.status}
                  </span>

                  <button
                    onClick={() => deleteMutation.mutate(cert.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-900 rounded-3xl">
            <Award className="w-10 h-10 text-slate-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-semibold text-sm">No Certificates Added</h4>
            <p className="text-slate-600 text-xs mt-1">Add your credentials and practice licenses above.</p>
          </div>
        )}
      </div>
    </PsySidebarLayout>
  );
}
