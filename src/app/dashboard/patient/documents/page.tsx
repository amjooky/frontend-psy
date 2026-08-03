"use client";

import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Trash2, Upload, Loader, Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch user uploaded documents from /documents
  const { data: docs, isLoading, isError } = useQuery({
    queryKey: ['documents-list'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data?.data || res.data || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await api.post('/documents/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-list'] });
      setFile(null);
      setSuccessMsg('Document téléversé avec succès !');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Échec du téléversement du document.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      setTimeout(() => setErrorMsg(null), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-list'] });
      setSuccessMsg('Document supprimé avec succès.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Échec de la suppression du document.');
      setTimeout(() => setErrorMsg(null), 4000);
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      await uploadMutation.mutateAsync(fd);
    } catch {
      // Handled in onError
    } finally {
      setUploading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559] tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#2EC4B6]" />
              Mes Documents Medicals
            </h2>
            <p className="text-slate-400 text-sm font-light mt-1">
              Partagez vos bilans, questionnaires et comptes-rendus en toute sécurité avec vos praticiens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                setErrorMsg(null);
                setFile(e.target.files?.[0] || null);
              }}
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              {file ? file.name : 'Choisir un fichier'}
            </label>
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-[#2EC4B6] hover:bg-[#28b3a6] disabled:bg-teal-200 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-teal-500/10"
              >
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Envoi...' : 'Téléverser'}
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center gap-2.5 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : docs && Array.isArray(docs) && docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map((doc: any) => (
              <div
                key={doc.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between h-44 hover:border-teal-200 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center border border-teal-100 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <h4 className="font-bold text-[#1B2559] text-xs truncate group-hover:text-[#2EC4B6] transition-colors">
                      {doc.filename || doc.originalName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-light mt-1">
                      {doc.sizeBytes ? (doc.sizeBytes / 1024 / 1024).toFixed(2) : '0.00'} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <span className="text-[10px] text-slate-400 font-light">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-[#1B2559] transition-colors"
                      title="Télécharger le document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Supprimer le document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#2EC4B6] mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-[#1B2559] font-bold text-base">Aucun document téléversé</h4>
            <p className="text-slate-400 text-xs font-light mt-1 max-w-sm mx-auto">
              Ajoutez vos documents médicaux pour les mettre à disposition de votre thérapeute avant vos consultations.
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
