import { Stack } from 'expo-router';

/**
 * Venue-side booking flows, grouped so the routing tree stays clean: the new-booking
 * form, booking detail, the booking calendar, and memberships. A route group `(…)` is
 * transparent to URLs, so paths like `/new-booking` and `/booking/[id]` are unchanged.
 *
 * Player-facing booking will live in a sibling `(player-booking)` group when built.
 */
export default function VenueBookingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
