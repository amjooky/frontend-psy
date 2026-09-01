"use client";

import React, { useState } from 'react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Activity, DollarSign, Users, Award, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function AdminOverview() {
  const [activeTab, setActiveTab] = useState<'STATS' | 'VERIFICATIONS'>('STATS');

  // Fetch admin dashboard counters
  const { data: report, isLoading } = useQuery({
    queryKey: ['admin-dashboard-data'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data?.data;
    },
  });

  // Fetch psychologists awaiting verification
  const { data: psychologists, isLoading: psyLoading, refetch: refetchPsy } = useQuery({
    queryKey: ['admin-pending-psychologists'],
    queryFn: async () => {
      const res = await api.get('/psychologists/admin/all');
      // API returns { data: { data: [...], meta: {} } } — the array is at res.data.data
      const list = res.data?.data ?? [];
      return Array.isArray(list) ? list : (list.data ?? []);
    },
  });

  const pendingPsychologists = Array.isArray(psychologists)
    ? psychologists.filter((p: any) => p.status === 'PENDING_VERIFICATION')
    : [];

  const handleVerify = async (id: string, action: 'verify' | 'suspend') => {
    try {
      await api.post(`/psychologists/admin/${id}/${action}`);
      refetchPsy();
    } catch (err) {
      console.error('Verification action failed:', err);
    }
  };

  return (
    <AdminSidebarLayout>
      <div className="space-y-8 max-w-6xl font-outfit">
        {/* COUNTER CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Patients', value: report?.stats?.totalPatients || 0, icon: <Users className="w-5 h-5 text-blue-600" />, iconBg: 'bg-blue-50 border-blue-100' },
            { label: 'Verified Specialists', value: report?.stats?.totalPsychologists || 0, icon: <Award className="w-5 h-5 text-indigo-600" />, iconBg: 'bg-indigo-50 border-indigo-100' },
            { label: 'Active Consultation Sessions', value: report?.stats?.activeSessions || 0, icon: <Activity className="w-5 h-5 text-teal-600" />, iconBg: 'bg-teal-50 border-teal-100' },
            { label: 'Platform Revenue', value: `${formatPrice(report?.stats?.totalRevenue, 0, 0)} TND`, icon: <DollarSign className="w-5 h-5 text-purple-600" />, iconBg: 'bg-purple-50 border-purple-100' }
          ].map((m, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{m.label}</span>
                <h4 className="text-2xl font-bold text-[#1B2559] mt-2">{m.value}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl ${m.iconBg} border flex items-center justify-center`}>
                {m.icon}
              </div>
            </div>
          ))}
        </div>

        {/* WORKSPACE PANELS */}
        <div className="grid grid-cols-1 gap-8">
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1B2559] flex items-center gap-2.5">
              <ShieldAlert className="w-5.5 h-5.5 text-amber-500" />
              Specialists Pending Verification
            </h3>

            {psyLoading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : pendingPsychologists && pendingPsychologists.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingPsychologists.map((psy: any) => (
                  <div key={psy.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold text-base">
                        {psy.firstName?.[0] || 'D'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B2559] text-base">Dr. {psy.firstName} {psy.lastName}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">License: <span className="font-mono text-slate-700">{psy.licenseNumber || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVerify(psy.id, 'verify')}
                        className="px-4 py-2 rounded-xl bg-[#2EC4B6]/10 border border-[#2EC4B6]/20 text-[#2EC4B6] hover:bg-[#2EC4B6] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(psy.id, 'suspend')}
                        className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 italic">No specialists awaiting verification.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
