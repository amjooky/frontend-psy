"use client";

import React from 'react';
import PsySidebarLayout from '@/components/layout/PsySidebarLayout';
import { PsychologistKycStepper } from '@/components/psychologist/PsychologistKycStepper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PsychologistOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['psy-onboarding-profile'],
    queryFn: async () => {
      const res = await api.get('/psychologists/me/profile');
      return res.data?.data || res.data;
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['psy-overview-stats'] });
    queryClient.invalidateQueries({ queryKey: ['psy-profile-certs'] });
    router.push('/dashboard/psychologist');
  };

  return (
    <PsySidebarLayout>
      <div className="py-4 space-y-6">
        <PsychologistKycStepper
          initialProfile={profile}
          onSuccess={handleSuccess}
          onClose={() => router.push('/dashboard/psychologist')}
        />
      </div>
    </PsySidebarLayout>
  );
}
