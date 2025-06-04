// src/shared/utils/socket.ts
import { io, Socket } from 'socket.io-client';
import { getAccessTokenFromLS, getverifyTokenFromLS } from 'src/shared/utils/auth';
import { useEffect } from 'react';

let socket: Socket | null = null;
let listeners: Record<string, Set<Function>> = {};

export const initializeSocket = (isCustomer?: boolean): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_APP_SOCKET_URL, {
      extraHeaders: {
        Authorization: `${isCustomer ? getverifyTokenFromLS() : getAccessTokenFromLS()}`
      }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❗ Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized. Initializing...');
    return initializeSocket();
  }
  return socket;
};

export const registerSocketListener = (event: string, callback: Function): void => {
  if (!listeners[event]) {
    listeners[event] = new Set();
  }
  listeners[event].add(callback);

  const socket = getSocket();
  socket.on(event, callback as (...args: any[]) => void);
};

export const unregisterSocketListener = (event: string, callback: Function): void => {
  if (listeners[event]) {
    listeners[event].delete(callback);
    if (socket) {
      socket.off(event, callback as (...args: any[]) => void);
    }
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Clear the socket reference
    console.log('Socket disconnected');
  }
};

export function useSocketEvent(
  eventName: string,
  callback: (...args: any[]) => void,
  dependencies: React.DependencyList = []
) {
  useEffect(() => {
    const socket = getSocket();
    socket.on(eventName, callback);
    return () => {
      socket.off(eventName, callback);
    };
  }, dependencies);
}

export function useMultiSocketEvents(
  events: { event: string; callback: (...args: any[]) => void }[],
  dependencies: React.DependencyList = []
) {
  useEffect(() => {
    const socket = getSocket();

    // Đăng ký tất cả các events
    events.forEach(({ event, callback }) => {
      socket.on(event, callback);
    });

    // Cleanup khi unmount
    return () => {
      events.forEach(({ event, callback }) => {
        socket.off(event, callback);
      });
    };
  }, [...dependencies, socket]);
}
