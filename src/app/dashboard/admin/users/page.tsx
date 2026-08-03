"use client";

import React, { useState } from 'react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Users, Award, Check, ShieldAlert, Shield, Trash2,
  AlertCircle, Search, UserCheck, UserX, RefreshCw,
} from 'lucide-react';

// ─── Confirmation modal ────────────────────────────────────────────────────
function ConfirmModal({
  open, title, description, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string;
  confirmLabel: string; confirmClass: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-sm w-full mx-4">
        <h3 className="font-bold text-[#1B2559] text-lg mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white text-sm font-bold transition-all ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
      active
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-rose-50 border-rose-200 text-rose-700'
    }`}>
      {active ? 'Active' : 'Banned'}
    </span>
  );
}

export default function AdminUserControl() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PSYCHOLOGISTS' | 'PATIENTS'>('PATIENTS');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<{
    type: 'ban' | 'activate' | 'delete';
    userId: string;
    name: string;
  } | null>(null);

  // ─── Fetch psychologists ───────────────────────────────────────
  const { data: psyData, isLoading: psyLoading } = useQuery({
    queryKey: ['admin-psychologists'],
    queryFn: async () => {
      const res = await api.get('/psychologists/admin/all');
      return Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data?.data?.data) ? res.data.data.data
        : [];
    },
    enabled: activeTab === 'PSYCHOLOGISTS',
  });

  // ─── Fetch all users (filter patients) ────────────────────────
  const { data: usersData, isLoading: patientsLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params: { limit: 200 } });
      const all = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data?.data?.data) ? res.data.data.data
        : [];
      return all;
    },
    enabled: activeTab === 'PATIENTS',
  });

  // ─── Mutations ─────────────────────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.post(`/psychologists/admin/${id}/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-psychologists'] }),
  });

  const suspendPsyMutation = useMutation({
    mutationFn: (id: string) => api.post(`/psychologists/admin/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-psychologists'] }),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/ban`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirm(null); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/activate`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirm(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirm(null); },
  });

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'ban') banMutation.mutate(confirm.userId);
    if (confirm.type === 'activate') activateMutation.mutate(confirm.userId);
    if (confirm.type === 'delete') deleteMutation.mutate(confirm.userId);
  };

  // ─── Derived data ──────────────────────────────────────────────
  const psychologists = (psyData || []);
  const patients = (usersData || []).filter((u: any) => u.role === 'PATIENT');

  const filteredPatients = patients.filter((p: any) => {
    const name = `${p.patient?.firstName || ''} ${p.patient?.lastName || ''} ${p.email || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const filteredPsy = psychologists.filter((p: any) => {
    const name = `${p.firstName || ''} ${p.lastName || ''} ${p.licenseNumber || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const isActionPending = banMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

  return (
    <AdminSidebarLayout>
      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={
          confirm?.type === 'delete' ? '⚠️ Delete Account' :
          confirm?.type === 'ban' ? 'Ban User' : 'Activate User'
        }
        description={
          confirm?.type === 'delete'
            ? `Permanently delete "${confirm?.name}"? This action cannot be undone and will remove all their data.`
            : confirm?.type === 'ban'
            ? `Ban "${confirm?.name}"? They will lose access to the platform immediately.`
            : `Restore access for "${confirm?.name}"?`
        }
        confirmLabel={
          confirm?.type === 'delete' ? 'Delete permanently' :
          confirm?.type === 'ban' ? 'Ban user' : 'Activate'
        }
        confirmClass={
          confirm?.type === 'delete' ? 'bg-red-600 hover:bg-red-500' :
          confirm?.type === 'ban' ? 'bg-orange-600 hover:bg-orange-500' :
          'bg-emerald-600 hover:bg-emerald-500'
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-6 max-w-6xl font-outfit">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <p className="text-sm text-slate-500 font-medium">
            Manage platform users — ban, activate, or permanently remove accounts.
          </p>

          {/* Tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 border border-slate-200 rounded-xl w-fit">
            {(['PATIENTS', 'PSYCHOLOGISTS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-[#1B2559] text-white shadow-sm' : 'text-slate-500 hover:text-[#1B2559]'
                }`}
              >
                {tab === 'PATIENTS' ? `Patients` : 'Psychologists'}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'PATIENTS' ? 'Search patients...' : 'Search psychologists...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
        </div>

        {/* ─── Patients tab ─────────────────────────────────────────── */}
        {activeTab === 'PATIENTS' ? (
          patientsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
              ))}
            </div>
          ) : filteredPatients.length > 0 ? (
            <>
              <p className="text-xs text-slate-400 font-semibold">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid gap-3">
                {filteredPatients.map((pat: any) => {
                  const fullName = pat.patient?.firstName
                    ? `${pat.patient.firstName} ${pat.patient.lastName}`
                    : pat.email?.split('@')[0] || 'Patient';
                  return (
                    <div
                      key={pat.id}
                      className={`p-5 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        !pat.isActive ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100'
                      }`}
                    >
                      {/* Avatar + Info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                          pat.isActive
                            ? 'bg-purple-50 border border-purple-100 text-purple-600'
                            : 'bg-rose-100 border border-rose-200 text-rose-500'
                        }`}>
                          {fullName[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-[#1B2559] text-sm">{fullName}</h4>
                            <StatusBadge active={pat.isActive} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{pat.email}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Joined {new Date(pat.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {pat.isActive ? (
                          <button
                            onClick={() => setConfirm({ type: 'ban', userId: pat.id, name: fullName })}
                            className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-600 hover:text-white text-orange-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Ban
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirm({ type: 'activate', userId: pat.id, name: fullName })}
                            className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate
                          </button>
                        )}

                        <button
                          onClick={() => setConfirm({ type: 'delete', userId: pat.id, name: fullName })}
                          className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white text-red-500 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h4 className="text-[#1B2559] font-bold text-sm">No Patients Found</h4>
              {search && (
                <button onClick={() => setSearch('')} className="mt-3 text-xs text-purple-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )

        ) : (
          /* ─── Psychologists tab ───────────────────────────────── */
          psyLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
              ))}
            </div>
          ) : filteredPsy.length > 0 ? (
            <div className="grid gap-4">
              {filteredPsy.map((psy: any) => (
                <div
                  key={psy.id}
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2559] text-base">Dr. {psy.firstName} {psy.lastName}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap gap-2 items-center">
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
                          License: {psy.licenseNumber}
                        </span>
                        <span className="text-slate-400 italic font-light">
                          {psy.biography?.slice(0, 80) || 'No bio'}...
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                      psy.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      psy.status === 'PENDING_VERIFICATION' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {psy.status === 'PENDING_VERIFICATION' ? 'Pending' : psy.status}
                    </span>

                    {psy.status === 'PENDING_VERIFICATION' && (
                      <button
                        onClick={() => verifyMutation.mutate(psy.id)}
                        disabled={verifyMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-[#2EC4B6] hover:bg-[#2EC4B6]/80 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Verify
                      </button>
                    )}

                    {psy.status !== 'SUSPENDED' ? (
                      <button
                        onClick={() => suspendPsyMutation.mutate(psy.id)}
                        disabled={suspendPsyMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Suspend
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h4 className="text-[#1B2559] font-bold text-sm">No Psychologists Found</h4>
            </div>
          )
        )}
      </div>
    </AdminSidebarLayout>
  );
}
