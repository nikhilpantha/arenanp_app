import type { Slot, SlotStatus, SportType } from '@/types';

export interface VenueCourt {
  id: string;
  name: string;
  sport: SportType;
  pricePerSlot: number; // NPR
}

export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 22;
export const SLOT_MINUTES = 60;

// TODO(backend): courts come from the saved venue's services config.
export const VENUE_COURTS: VenueCourt[] = [
  { id: 'c1', name: 'Court 1', sport: 'futsal', pricePerSlot: 1200 },
  { id: 'c2', name: 'Court 2', sport: 'futsal', pricePerSlot: 1200 },
  { id: 'b1', name: 'Court A', sport: 'basketball', pricePerSlot: 900 },
  { id: 'cr1', name: 'Net 1', sport: 'cricket', pricePerSlot: 800 },
  { id: 'bd1', name: 'Court 1', sport: 'badminton', pricePerSlot: 500 },
];

/** Distinct sports the venue offers (drives the sport filter). */
export const VENUE_SPORTS: SportType[] = Array.from(new Set(VENUE_COURTS.map((c) => c.sport)));

interface Seed {
  status: SlotStatus;
  customerName?: string;
}

// TODO(backend): seeded so each status is visible; same pattern every day for the mock.
const SEED: Record<string, Seed> = {
  'c1:7': { status: 'online', customerName: 'Ramesh K.' },
  'c1:17': { status: 'walkin', customerName: 'Walk-in' },
  'c1:18': { status: 'subscription', customerName: 'Arjun T.' },
  'c1:20': { status: 'online', customerName: 'Bibek S.' },
  'c2:9': { status: 'maintenance' },
  'c2:19': { status: 'online', customerName: 'Sita M.' },
  'b1:8': { status: 'maintenance' },
  'b1:18': { status: 'walkin', customerName: 'Walk-in' },
  'cr1:16': { status: 'subscription', customerName: 'Hari P.' },
  'bd1:19': { status: 'online', customerName: 'Nisha R.' },
};

export function formatHour(h: number): string {
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:00 ${period}`;
}

export interface CourtSchedule {
  court: VenueCourt;
  slots: Slot[];
}

/** Builds the day's slot grid for every court of a sport (open→close in hourly steps). */
export function getSchedule(sport: SportType): CourtSchedule[] {
  return VENUE_COURTS.filter((c) => c.sport === sport).map((court) => {
    const slots: Slot[] = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      const seed = SEED[`${court.id}:${h}`];
      slots.push({
        id: `${court.id}:${h}`,
        time: formatHour(h),
        court: court.name,
        status: seed?.status ?? 'available',
        customerName: seed?.customerName,
      });
    }
    return { court, slots };
  });
}
