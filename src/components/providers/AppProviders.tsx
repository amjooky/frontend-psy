"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './LanguageProvider';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Mounts the WebSocket notification listener for the current user.
 * Must be inside QueryClientProvider so it can update the cache.
 */
function NotificationSocketBridge() {
  useNotificationSocket();
  return null;
}

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <NotificationSocketBridge />
        {children}
      </LanguageProvider>
    </QueryClientProvider>
  );
};
