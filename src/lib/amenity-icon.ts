import type { IconName } from '@/components/common';

/** Keyword → icon rules for venue amenities + add-on services (first match wins). */
const RULES: [RegExp, IconName][] = [
  [/wi-?fi|internet|network/, 'wifi'],
  [/park/, 'car'],
  [/shower|bath/, 'showerHead'],
  [/water|hydration|drink/, 'droplets'],
  [/cafe|canteen|coffee|food|snack|restaurant|refreshment|tea/, 'coffee'],
  [/light|floodlight|flood|night/, 'lightbulb'],
  [/lock|locker|storage|cloak/, 'lock'],
  [/first ?aid|medical|aid|health|nurse/, 'heart'],
  [/equip|rental|gear|kit|racket|racquet|ball|jersey|bib/, 'dumbbell'],
  [/sound|music|speaker|dj|audio/, 'music'],
  [/seat|spectator|stand|gallery|viewing|lounge|rest/, 'users'],
  [/secur|cctv|guard|camera|safe/, 'shield'],
  [/wash|toilet|restroom|changing|locker ?room/, 'droplets'],
];

/**
 * Map a free-text amenity / service name to a relevant icon (hotel-style), falling back
 * to a sensible default when nothing matches.
 */
export function amenityIcon(name: string, fallback: IconName = 'check'): IconName {
  const n = name.toLowerCase();
  for (const [re, icon] of RULES) if (re.test(n)) return icon;
  return fallback;
}
