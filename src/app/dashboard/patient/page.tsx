"use client";

import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Calendar, Video, Clock, MessageCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

export default function PatientOverview() {
  // Fetch overview stats and next session details from backend api
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['patient-stats'],
    queryFn: async () => {
      const res = await api.get('/patients/me');
      return res.data;
    },
  });

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments', { params: { limit: 3 } });
      return res.data?.data?.data || [];
    },
  });

  const upcomingSession = Array.isArray(appointments)
    ? appointments.find((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING')
    : null;

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-6xl font-outfit">
        {/* 1. WELCOME CARD */}
        <div className="p-8 rounded-3xl bg-gradient-to-tr from-[#1B2559] via-[#2A3982] to-[#121A40] relative overflow-hidden shadow-md">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-glow opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How is your mind today?</h2>
            <p className="text-blue-100/90 text-sm font-medium mt-3 leading-relaxed">
              Welcome back to your workspace. Book sessions, consult with specialists privately, or check your upcoming schedule.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link 
                href="/psychologists"
                className="px-6 py-3 rounded-xl bg-[#2EC4B6] hover:bg-[#2EC4B6]/95 text-white text-sm font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-teal-500/10"
              >
                Schedule new session
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. UPCOMING SESSION TRACKER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Upcoming Consultation</h3>
              {upcomingSession ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#2EC4B6] flex items-center justify-center shrink-0 border border-teal-100">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B2559] text-base">
                        Session with Dr. {upcomingSession.psychologist.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(upcomingSession.startAt).toLocaleString()} ({upcomingSession.sessionFormat})
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/patient/session/${upcomingSession.id}`}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-sm"
                  >
                    Join Consultation Room
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No upcoming sessions scheduled.</p>
                </div>
              )}
            </div>

            {/* 3. RECENT COMPLETED APPOINTMENTS LIST */}
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Recent Activities</h3>
              {apptsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {appointments.map((appt: any) => (
                    <div key={appt.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-[#1B2559] text-sm">
                          Dr. {appt.psychologist.firstName} {appt.psychologist.lastName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">{new Date(appt.startAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-500 text-sm font-medium">No recent sessions found.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Therapy Summary</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="text-3xl font-bold text-[#1B2559]">{appointments?.length || 0}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Total Booked Sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
