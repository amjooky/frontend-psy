"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './useAuth';
import { Notification } from './useNotifications';

/**
 * This hook connects to the /chat socket namespace using the
 * current user's ID and listens for real-time 'notification' events.
 *
 * When a new notification arrives from the server:
 *  1. Prepends it to the React Query ['notifications'] cache (instant UI update)
 *  2. Overwrites the ['notifications-unread-count'] cache with the fresh server value
 *
 * Mount this hook once in the layout (e.g. AppProviders).
 * It is safe to call in multiple places — it uses a shared socket singleton.
 */
export function useNotificationSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket(user.id);
    socketRef.current = socket;

    const handleNotification = (payload: {
      notification: Notification;
      unreadCounts: { total: number; byType: Record<string, number> };
    }) => {
      // 1. Prepend the new notification to the list (instant, no refetch)
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => {
        // Avoid duplicates
        if (old.some((n) => n.id === payload.notification.id)) return old;
        return [payload.notification, ...old];
      });

      // 2. Update unread counts with the fresh value from the server
      queryClient.setQueryData(['notifications-unread-count'], payload.unreadCounts);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user?.id, queryClient]);

  // Clean up socket on logout (user becomes null)
  useEffect(() => {
    if (!user?.id && socketRef.current) {
      disconnectSocket();
      socketRef.current = null;
    }
  }, [user?.id]);
}
