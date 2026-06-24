import type { Subscription, TimeWindow } from '@/lib/api/subscriptions';
import type {
  DayOfWeek,
  RecurringBooking,
  RecurringStatus,
  SportType,
  VenueBooking,
} from '@/types';

const DAY_ORDER: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};
const WEEKDAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

/** "HH:mm" → minutes since midnight (0 on bad input). */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

/** Minutes since midnight → short clock label, e.g. 360 → "6 AM", 1290 → "9:30 PM". */
export function formatClock(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const period = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/** "HH:mm" clock label, e.g. "06:00" → "6 AM". */
export function formatTime(time: string): string {
  return formatClock(toMinutes(time));
}

/** A member's slot label from start time + session length, e.g. "6 AM – 7 AM". */
export function slotLabel(slotStart: string, sessionMinutes: number): string {
  const start = toMinutes(slotStart);
  return `${formatClock(start)} – ${formatClock(start + sessionMinutes)}`;
}

/** A bookable slot a member can pick when subscribing. */
export interface SlotOption {
  start: string; // "HH:mm"
  label: string; // "6 AM – 7 AM"
}

/**
 * Every start time that yields a full session inside the plan's bands, stepping by
 * the session length. E.g. band 6:00–8:00 + 60 min → 6:00 and 7:00.
 */
export function slotOptions(windows: TimeWindow[], sessionMinutes: number): SlotOption[] {
  // Collect distinct start minutes — overlapping/duplicate bands must not repeat a slot.
  const starts = new Set<number>();
  for (const w of windows) {
    const start = toMinutes(w.start);
    const end = toMinutes(w.end);
    for (let t = start; t + sessionMinutes <= end; t += sessionMinutes) starts.add(t);
  }
  return [...starts]
    .sort((a, b) => a - b)
    .map((t) => ({
      start: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
      label: `${formatClock(t)} – ${formatClock(t + sessionMinutes)}`,
    }));
}

/** Session length label, e.g. 60 → "1 hr", 90 → "1.5 hr", 30 → "30 min". */
export function sessionLengthLabel(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60} hr`;
  if (minutes < 60) return `${minutes} min`;
  return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')} hr`;
}

/** Human cadence from the qualifying days, e.g. "Every day", "Weekdays", "Sun, Wed, Fri". */
export function cadenceLabel(days: DayOfWeek[]): string {
  const set = new Set(days);
  if (set.size === 0) return 'Flexible';
  if (set.size === 7) return 'Every day';
  if (set.size === WEEKDAYS.length && WEEKDAYS.every((d) => set.has(d))) return 'Weekdays';
  return DAY_ORDER.filter((d) => set.has(d))
    .map((d) => DAY_SHORT[d])
    .join(', ');
}

/** Short, locale-friendly date label, e.g. "Jun 30". Falls back to "—" on bad input. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Whether an ACTIVE subscription has a session on the given date — the date sits in its
 * window and is one of its weekdays. (Paused/expired subscriptions don't run sessions.)
 */
export function subscriptionOccursOn(s: Subscription, dateIso: string): boolean {
  if (s.status !== 'active') return false;
  const weekday = DAY_ORDER[new Date(`${dateIso}T00:00:00`).getDay()];
  if (!s.daysOfWeek.includes(weekday)) return false;
  // ISO "yyyy-mm-dd" strings compare lexicographically.
  return dateIso >= s.startedAt.slice(0, 10) && dateIso <= s.expiresAt.slice(0, 10);
}

/**
 * A virtual, read-only booking row for a subscription's session on a given date, so the
 * member's recurring slot shows up in the Today / Tomorrow lists alongside walk-ins.
 */
export function subscriptionToSession(s: Subscription, dateIso: string): VenueBooking {
  const startMin = toMinutes(s.slotStart);
  return {
    id: `sub-${s.id}-${dateIso}`,
    customer: s.customerName,
    customerType: 'individual',
    phone: s.customerPhone,
    sport: (s.sports[0] ?? 'futsal') as SportType,
    court: s.courtName,
    date: dateIso,
    startLabel: formatClock(startMin),
    endLabel: formatClock(startMin + s.sessionMinutes),
    status: 'upcoming',
    payment: 'paid',
    amount: 0,
    isSubscription: true,
    subscriptionId: s.id,
  };
}

const STATUS_TO_RECURRING: Record<Subscription['status'], RecurringStatus> = {
  pending: 'active', // pending requests live in the Requests tab, not the recurring list
  scheduled: 'active', // the Memberships tab only shows active, so this never surfaces
  active: 'active',
  paused: 'paused',
  expired: 'expired',
  cancelled: 'expired',
};

/**
 * Adapt a live Subscription to the RecurringBooking shape the RecurringCard renders.
 * The member's daily slot (start + session length) drives the time label.
 */
export function subscriptionToRecurring(s: Subscription): RecurringBooking {
  return {
    id: s.id,
    customer: s.customerName,
    sport: (s.sports[0] ?? 'futsal') as SportType,
    court: s.courtName,
    cadence: cadenceLabel(s.daysOfWeek),
    timeLabel: slotLabel(s.slotStart, s.sessionMinutes),
    packageName: s.planName,
    status: STATUS_TO_RECURRING[s.status],
    sessionLabel: sessionLengthLabel(s.sessionMinutes),
    packageAmount: s.price,
    startDate: shortDate(s.startedAt),
    renewalDate: shortDate(s.expiresAt),
  };
}
