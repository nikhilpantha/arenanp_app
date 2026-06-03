import type { Member, MembershipStats, MembershipTier } from '@/types';

// TODO(backend): membership tiers, members and stats come from the API.
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 't1',
    name: 'Morning Saver',
    price: 4000,
    duration: 'monthly',
    startHour: 6,
    endHour: 10,
    daysOfWeek: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
    validityDays: 30,
    sportsIncluded: ['futsal', 'basketball'],
    accent: '#10b981',
    highlight: 'Popular',
    description: 'Unlimited morning slots, weekdays.',
  },
  {
    id: 't2',
    name: 'All-Access Monthly',
    price: 8000,
    duration: 'monthly',
    startHour: 6,
    endHour: 22,
    daysOfWeek: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    validityDays: 30,
    sportsIncluded: ['futsal', 'basketball', 'cricket', 'badminton'],
    accent: '#10b981',
    description: 'Any sport, any time, all month.',
  },
];

export const MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Arjun Thapa',
    phone: '9812345678',
    tierId: 't2',
    status: 'active',
    joinedAt: '2026-05-01',
    expiresAt: '2026-06-30',
    remainingSessions: 12,
    totalSessions: 20,
    renewals: [{ id: 'rn1', date: '2026-05-01', amount: 8000, duration: 'monthly' }],
    payments: [{ id: 'pm1', date: '2026-05-01', amount: 8000, method: 'khalti', status: 'paid' }],
  },
  {
    id: 'm2',
    name: 'Sunita Lama',
    phone: '9803001122',
    tierId: 't1',
    status: 'expiring',
    joinedAt: '2026-05-10',
    expiresAt: '2026-06-09',
    remainingSessions: 3,
    totalSessions: 16,
    renewals: [{ id: 'rn2', date: '2026-05-10', amount: 4000, duration: 'monthly' }],
    payments: [{ id: 'pm2', date: '2026-05-10', amount: 4000, method: 'esewa', status: 'paid' }],
  },
  {
    id: 'm3',
    name: 'Kiran Bhandari',
    phone: '9845678901',
    tierId: 't1',
    status: 'expired',
    joinedAt: '2026-03-15',
    expiresAt: '2026-04-14',
    remainingSessions: 0,
    totalSessions: 16,
    renewals: [{ id: 'rn3', date: '2026-03-15', amount: 4000, duration: 'monthly' }],
    payments: [{ id: 'pm3', date: '2026-03-15', amount: 4000, method: 'cash', status: 'paid' }],
  },
];

export const MEMBERSHIP_STATS: MembershipStats = {
  activeMembers: 24,
  expiringSoon: 3,
  monthlyRevenue: 148000,
  renewalRatePct: 82,
};

export function getTier(id: string): MembershipTier | null {
  return MEMBERSHIP_TIERS.find((t) => t.id === id) ?? null;
}

export function getMember(id: string): Member | null {
  return MEMBERS.find((m) => m.id === id) ?? null;
}

export const DURATION_LABEL: Record<MembershipTier['duration'], string> = {
  monthly: 'month',
  quarterly: '3 months',
  'half-yearly': '6 months',
  yearly: 'year',
};
