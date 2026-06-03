import { create } from 'zustand';

import userData from '@/data/user.json';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read?: boolean;
  link?: string;
}

export interface AppMessage {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read?: boolean;
  link?: string;
}

export interface UserState {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  notifications: AppNotification[];
  messages: AppMessage[];
  setUser: (u: Partial<UserState>) => void;
  markNotificationRead: (id: string) => void;
  markMessageRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markAllMessagesRead: () => void;
  addNotification: (n: AppNotification) => void;
  addMessage: (m: AppMessage) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: userData.id,
  name: userData.name,
  avatarUrl: userData.avatarUrl,
  location: userData.location,
  notifications: (userData.notifications as AppNotification[]) ?? [],
  messages: (userData.messages as AppMessage[]) ?? [],
  setUser: (u: Partial<UserState>) => set((s) => ({ ...s, ...u })),
  markNotificationRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markMessageRead: (id: string) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
  markAllMessagesRead: () =>
    set((state) => ({ messages: state.messages.map((m) => ({ ...m, read: true })) })),
  addNotification: (n: AppNotification) =>
    set((state) => ({ notifications: [n, ...state.notifications] })),
  addMessage: (m: AppMessage) => set((state) => ({ messages: [m, ...state.messages] })),
}));
