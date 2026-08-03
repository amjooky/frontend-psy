import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import api from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  data?: any;
}

export interface UnreadCounts {
  total: number;
  byType: Record<string, number>;
}

// ─── Module → NotificationType mapping (per role) ───────────────

export const PATIENT_MODULE_TYPES: Record<string, string[]> = {
  '/dashboard/patient/appointments': [
    'APPOINTMENT_BOOKED',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_COMPLETED',
    'APPOINTMENT_MISSED',
    'APPOINTMENT_RESCHEDULED',
  ],
  '/dashboard/patient/chat': ['NEW_MESSAGE'],
  '/dashboard/patient/documents': ['DOCUMENT_UPLOADED'],
  '/dashboard/patient/support': ['SYSTEM'],
};

export const PSY_MODULE_TYPES: Record<string, string[]> = {
  '/dashboard/psychologist': ['REVIEW_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_REFUNDED'],
  '/dashboard/psychologist/appointments': [
    'APPOINTMENT_BOOKED',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_MISSED',
    'APPOINTMENT_COMPLETED',
  ],
  '/dashboard/psychologist/chat': ['NEW_MESSAGE'],
  '/dashboard/psychologist/certificates': ['ACCOUNT_VERIFIED'],
};

export const ADMIN_MODULE_TYPES: Record<string, string[]> = {
  '/dashboard/admin': ['SYSTEM', 'ACCOUNT_VERIFIED'],
  '/dashboard/admin/tickets': [],
};

// ─── Route Mapping Helper ───────────────────────────────────────

export function getNotificationRoute(notification: Notification, role?: string): string {
  const type = notification.type;
  const data = notification.data || {};

  if (role === 'PSYCHOLOGIST') {
    if (type.startsWith('APPOINTMENT')) {
      if (data.appointmentId) return `/dashboard/psychologist/session/${data.appointmentId}`;
      return '/dashboard/psychologist/appointments';
    }
    if (type === 'NEW_MESSAGE') return '/dashboard/psychologist/chat';
    if (type === 'REVIEW_RECEIVED' || type.startsWith('PAYMENT')) return '/dashboard/psychologist';
    if (type === 'ACCOUNT_VERIFIED') return '/dashboard/psychologist/certificates';
    return '/dashboard/psychologist';
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    if (type === 'ACCOUNT_VERIFIED') return '/dashboard/admin';
    return '/dashboard/admin';
  }

  // PATIENT (Default)
  if (type.startsWith('APPOINTMENT')) {
    if (data.appointmentId) return `/dashboard/patient/session/${data.appointmentId}`;
    return '/dashboard/patient/appointments';
  }
  if (type === 'NEW_MESSAGE') return '/dashboard/patient/chat';
  if (type === 'DOCUMENT_UPLOADED') return '/dashboard/patient/documents';
  if (type.startsWith('PAYMENT')) return '/dashboard/patient/appointments';
  if (type === 'SYSTEM') return '/dashboard/patient/support';

  return '/dashboard/patient';
}

// ─── Hook ──────────────────────────────────────────────────────

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all notifications (listed in dropdown)
  const {
    data: notifications = [],
    isLoading,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // Fetch lightweight unread counts (for sidebar badges — separate fast endpoint)
  const { data: unreadCounts } = useQuery<UnreadCounts>({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data?.data ?? res.data ?? { total: 0, byType: {} };
    },
    enabled: !!user?.id,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const unreadCount = unreadCounts?.total ?? notifications.filter((n) => !n.isRead).length;

  // Badge count for a given module path (looks up byType from server counts)
  const badgeFor = (path: string, moduleMap: Record<string, string[]>): number => {
    const types = moduleMap[path] ?? [];
    if (!types.length) return 0;
    const byType = unreadCounts?.byType ?? {};
    return types.reduce((sum, t) => sum + (byType[t] ?? 0), 0);
  };

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((n) => ({ ...n, isRead: true })),
      );
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Delete single notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.filter((n) => n.id !== id),
      );
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], []);
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Register device FCM token
  const saveFcmTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await api.post('/notifications/fcm-token', { token });
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    unreadCounts,
    badgeFor,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutate(id),
    clearAll: () => clearAllMutation.mutate(),
    saveFcmToken: (token: string) => saveFcmTokenMutation.mutate(token),
    getRoute: (notification: Notification) => getNotificationRoute(notification, user?.role),
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
