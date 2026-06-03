import type { Customer } from '@/types';

// TODO(backend): customers + their game counts come from the API. Phones are 10-digit local.
export const CUSTOMERS: Customer[] = [
  { id: '1', name: 'Ramesh Karki', phone: '9801234567', gamesPlayed: 9, totalRevenue: 32400, lastPlayed: '2 days ago', preferredSlot: '6 PM' }, // 1 game to a free one
  { id: '2', name: 'Sita Maharjan', phone: '9807654321', gamesPlayed: 10, totalRevenue: 41000, lastPlayed: 'Yesterday', preferredSlot: '7 PM' }, // next game is free
  { id: '3', name: 'Arjun Thapa', phone: '9812345678', gamesPlayed: 3, totalRevenue: 9600, lastPlayed: '1 week ago', preferredSlot: '4 PM' },
  { id: '4', name: 'Bibek Shrestha', phone: '9843009988', gamesPlayed: 19, totalRevenue: 76000, lastPlayed: 'Today', preferredSlot: '6 PM' }, // next game is free
];

/** Looks up a customer by their 10-digit phone (loyalty is tracked per phone). */
export function getCustomerByPhone(phone: string): Customer | null {
  return CUSTOMERS.find((c) => c.phone === phone) ?? null;
}
