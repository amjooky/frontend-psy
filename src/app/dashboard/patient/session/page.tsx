"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { VideoOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SessionFallbackPage() {
  const router = useRouter();

  return (
    <SidebarLayout>
      <div className="max-w-md mx-auto mt-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-900 text-center space-y-6 backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <VideoOff className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Active Consultation Not Found</h2>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            To join a video consultation, you must select an active appointment from your scheduled calendar.
          </p>
        </div>
        <Link
          href="/dashboard/patient/appointments"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/10 transition-all text-sm group"
        >
          View Appointments
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </SidebarLayout>
  );
}
