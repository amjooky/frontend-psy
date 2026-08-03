"use client";

import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SecuritySetupCard from '@/components/security/SecuritySetupCard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function PatientSecurityPage() {
  const { data: patient } = useQuery({
    queryKey: ['patient-profile-data'],
    queryFn: async () => {
      const res = await api.get('/patients/me');
      return res.data?.data || res.data || {};
    },
  });

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security & Credentials</h2>
          <p className="text-slate-400 text-sm font-light mt-1.5">
            Manage authentication passwords, multi-factor authentication (2FA), and active session security.
          </p>
        </div>

        <SecuritySetupCard userEmail={patient?.user?.email} />
      </div>
    </SidebarLayout>
  );
}
