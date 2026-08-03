/**
 * Singleton socket client for the /chat namespace.
 * Re-uses the same connection across the whole app.
 * Import getSocket() wherever you need the socket.
 */
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId: string): Socket {
  if (socket && socket.connected) return socket;

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const host = apiBase.replace(/\/api\/v1\/?$/, '');

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
