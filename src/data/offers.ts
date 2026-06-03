import type { Offer, OfferClaim } from '@/types';

// TODO(backend): offers + claims come from the promotions API. Seeded to show every type.
export const OFFERS: Offer[] = [
  {
    id: 'of1',
    title: 'Loyalty card',
    description: 'Every 10th game is on the house.',
    reward: 'free-game',
    trigger: 'every-nth',
    everyGames: 10,
    audience: 'all',
    status: 'active',
  },
  {
    id: 'of2',
    title: 'Every 5th game',
    description: '20% off on every 5th game played.',
    reward: 'percent',
    rewardValue: 20,
    trigger: 'every-nth',
    everyGames: 5,
    audience: 'all',
    status: 'active',
  },
  {
    id: 'of3',
    title: 'Morning happy hour',
    description: '30% off weekday mornings.',
    reward: 'percent',
    rewardValue: 30,
    trigger: 'happy-hour',
    days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
    startHour: 6,
    endHour: 10,
    audience: 'all',
    status: 'active',
  },
  {
    id: 'of4',
    title: 'Welcome offer',
    description: 'Rs 200 off — grant it to a new customer.',
    reward: 'flat',
    rewardValue: 200,
    trigger: 'manual',
    audience: 'individual',
    status: 'active',
  },
  {
    id: 'of5',
    title: 'Futsal weekend',
    description: 'Rs 150 off weekend futsal for regular teams.',
    reward: 'flat',
    rewardValue: 150,
    trigger: 'manual',
    audience: 'team',
    sports: ['futsal'],
    status: 'paused',
  },
];

// A welcome offer already granted to Arjun Thapa (customer id '3').
export const OFFER_CLAIMS: OfferClaim[] = [
  { id: 'ocl1', offerId: 'of4', subjectType: 'customer', subjectId: '3', status: 'available', claimedAt: '2026-06-01' },
];
