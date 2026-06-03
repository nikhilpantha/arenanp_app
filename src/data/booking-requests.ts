import type { BookingRequest } from '@/types';

// TODO(backend): pending online bookings come from the API (player app → owner).
export const BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'r1',
    customerName: 'Prakash Gurung',
    phone: '9801112233',
    sport: 'futsal',
    court: 'Court 1',
    time: '8:00 PM',
    date: 'Today',
    durationHours: 1,
    price: 1200,
    requestedAt: '5m ago',
  },
  {
    id: 'r2',
    customerName: 'Anjali Rai',
    phone: '9845567788',
    sport: 'badminton',
    court: 'Court 1',
    time: '7:00 AM',
    date: 'Tomorrow',
    durationHours: 1,
    price: 500,
    requestedAt: '1h ago',
  },
];
