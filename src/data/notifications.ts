import type { IconName } from '@/components/common';

export type NotificationTone = 'success' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  time: string;
  tone: NotificationTone;
  read: boolean;
}

// TODO(backend): replace with the notifications API (scoped per user / venue). Shared by
// the venue and player notification screens.
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: '1', icon: 'calendarDays', title: 'New booking', body: 'Ramesh booked Court 1 · 5:00 PM today', time: '2m', tone: 'success', read: false },
  { id: '2', icon: 'star', title: 'New review', body: 'Sita rated your venue 5★ — “Great turf!”', time: '1h', tone: 'warning', read: false },
  { id: '3', icon: 'dollarSign', title: 'Payment received', body: 'Rs 1,200 for a Court 2 booking', time: '3h', tone: 'info', read: true },
  { id: '4', icon: 'calendarDays', title: 'Booking cancelled', body: 'Hari cancelled Court 1 · 8:00 PM', time: 'Yesterday', tone: 'info', read: true },
  { id: '5', icon: 'users', title: 'New follower', body: 'Bikash started following your venue', time: '2d', tone: 'success', read: true },
];
