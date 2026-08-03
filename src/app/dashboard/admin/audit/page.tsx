"use client";

import React, { useState } from 'react';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Shield, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function AdminAudit() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data?.data?.data || [];
    },
  });

  return (
    <AdminSidebarLayout>
      <div className="space-y-6 max-w-5xl font-outfit">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <p className="text-sm text-slate-500 font-medium">Immutable system audit logs detailing actions performed by accounts and background processes.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : Array.isArray(logs) && logs.length > 0 ? (
          <div className="grid gap-3">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs text-slate-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-blue-600 shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#1B2559] uppercase tracking-wider">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-sans">IP: <span className="font-mono text-slate-700">{log.ipAddress || 'unknown'}</span> · Performed by User ID: <span className="font-mono text-slate-700">{log.userId || 'System'}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 w-full md:w-auto max-w-md truncate">
                  <span className="text-slate-400 select-none">data: </span>
                  <span className="text-blue-600 font-mono">{JSON.stringify(log.details)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h4 className="text-[#1B2559] font-bold text-sm">No Audit Logs Recorded</h4>
          </div>
        )}
      </div>
    </AdminSidebarLayout>
  );
}
