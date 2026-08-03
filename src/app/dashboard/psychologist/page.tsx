"use client";

import React, { useState } from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { Calendar, Video, Clock, DollarSign, Users, Award, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function PsychologistOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['psy-overview-stats'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      return res.data?.data || res.data;
    },
  });

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['psy-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments', { params: { limit: 5 } });
      return res.data?.data?.data || [];
    },
  });

  const activeApptsCount = Array.isArray(appointments)
    ? appointments.filter((a: any) => a.status === 'CONFIRMED').length
    : 0;

  return (
    <PsySidebarLayout>
      <div className="space-y-8 max-w-6xl font-outfit">
        {/* WELCOME BANNER */}
        <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] shadow-md text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Clinical Dashboard</h2>
            <p className="text-purple-100 text-sm font-medium mt-3 leading-relaxed">
              Welcome to your digital practice. Manage consultations, adjust schedule availability, review patient logs, and monitor performance.
            </p>
          </div>
        </div>

        {/* PENDING VERIFICATION ALERT */}
        {stats?.status === 'PENDING_VERIFICATION' && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4 text-amber-800">
            <AlertCircle className="w-6 h-6 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Verification Status: Pending Review</h4>
              <p className="text-xs font-medium mt-1.5 leading-relaxed text-slate-600">
                Your practitioner credentials are currently under administrative review. Patients will not be able to find you or book appointments with you until verification is complete. 
                Please ensure you have uploaded your license credentials in the <Link href="/dashboard/psychologist/certificates" className="text-purple-600 underline font-bold hover:text-purple-700">Certificates Portal</Link>.
              </p>
            </div>
          </div>
        )}

        {/* METRICS STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Sessions', value: activeApptsCount, icon: <Video className="w-5 h-5 text-blue-600" />, iconBg: 'bg-blue-50 border-blue-100' },
            { label: 'Profile Status', value: stats?.status || 'PENDING', icon: <Award className="w-5 h-5 text-purple-600" />, iconBg: 'bg-purple-50 border-purple-100' },
            { label: 'Hourly Rate', value: stats ? `${Number(stats.pricePerSession).toFixed(0)} ${stats.currency}` : '80 TND', icon: <DollarSign className="w-5 h-5 text-teal-600" />, iconBg: 'bg-teal-50 border-teal-100' },
            { label: 'Rating Score', value: stats?.rating ? Number(stats.rating).toFixed(1) : '5.0', icon: <TrendingUp className="w-5 h-5 text-amber-600" />, iconBg: 'bg-amber-50 border-amber-100' }
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

        {/* SCHEDULE OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Schedule</h3>
                <Link href="/dashboard/psychologist/appointments" className="text-xs text-purple-600 hover:text-purple-750 font-bold">View all</Link>
              </div>

              {apptsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : Array.isArray(appointments) && appointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {appointments.map((appt: any) => (
                    <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                          <Video className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1B2559] text-sm">
                            Session with {appt.patient.isAnonymous ? (appt.patient.anonymousName || 'Anonymous Patient') : `${appt.patient.firstName} ${appt.patient.lastName}`}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(appt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({appt.sessionFormat})
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href={`/dashboard/psychologist/session/${appt.id}`}
                        className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-purple-600/10 text-center"
                      >
                        Launch Room
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No sessions booked for today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Setup</h3>
            <div className="space-y-3">
              <Link 
                href="/dashboard/psychologist/availability"
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-200 flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <h4 className="font-bold text-[#1B2559] text-sm">Working Hours</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Configure weekly available schedule slots</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/psychologist/certificates"
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-200 flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <h4 className="font-bold text-[#1B2559] text-sm">Verifications</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Upload licensing and practice certificates</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PsySidebarLayout>
  );
}
