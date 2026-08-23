/**
 * Singleton socket client for the /chat namespace.
 * Re-uses the same connection across the whole app.
 * Import getSocket() wherever you need the socket.
 */
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId: string): Socket {
  if (socket && socket.connected) return socket;

  let host = 'https://backend-psy-upv7.onrender.com';
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) {
      host = 'https://backend-psy-upv7.onrender.com';
    } else if (window.location.hostname.includes('educanet.pro')) {
      host = 'https://be-psy.educanet.pro';
    } else {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://backend-psy-upv7.onrender.com/api/v1';
      host = apiBase.replace(/\/api\/v1\/?$/, '');
    }
  }

  socket = io(`${host}/chat`, {
    query: { userId },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getExistingSocket(): Socket | null {
  return socket;
}
