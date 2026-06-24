import type { CourtSlotData } from '@/lib/api/discovery';
import { pad, to12h } from '@/lib/time';

/** A start-time option for a chosen duration — available only if the whole run is free. */
export interface StartSlot {
  startAt: string;
  value: string;
  /** Start-time display label, e.g. "6:00 PM". */
  label: string;
  /** Start–end range for the chosen duration, e.g. "6:00 PM – 8:00 PM". */
  rangeLabel: string;
  available: boolean;
  /** Total price of the consecutive run starting here. */
  price: number;
}

/** "6:00 PM" label for `startAt` shifted by `addMinutes` (handles the midnight wrap). */
function shiftedLabel(startAt: string, addMinutes: number): string {
  const d = new Date(startAt);
  d.setMinutes(d.getMinutes() + addMinutes);
  return to12h(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
}

/**
 * Turn the court's raw slots into selectable start times for a booking of `durationSlots`
 * consecutive slots. A start is available only when it and the next `durationSlots-1`
 * slots all exist, are contiguous (each slot's end == the next slot's start) and free.
 * Past/booked slots are already flagged `available: false` by the backend.
 */
export function startSlots(
  slots: CourtSlotData[],
  durationSlots: number,
  slotMinutes: number,
): StartSlot[] {
  const n = Math.max(1, durationSlots);
  return slots.map((slot, i) => {
    const run = slots.slice(i, i + n);
    let ok = run.length === n;
    let price = 0;
    for (let j = 0; ok && j < run.length; j += 1) {
      if (!run[j].available) ok = false;
      price += run[j].price;
    }
    const endLabel = shiftedLabel(slot.startAt, n * slotMinutes);
    return {
      startAt: slot.startAt,
      value: slot.value,
      label: slot.label,
      rangeLabel: `${slot.label} – ${endLabel}`,
      available: ok,
      price,
    };
  });
}
