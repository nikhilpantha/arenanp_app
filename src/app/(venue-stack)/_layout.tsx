import { Stack } from 'expo-router';

/**
 * All venue-owner pushed screens, grouped so the routing tree stays clean and every
 * owner screen lives in one place: the booking flows (new-booking, booking detail,
 * calendar), memberships, offers, customers, members, teams, closures, venue editing,
 * the account page and create-venue. A route group `(…)` is transparent to URLs, so
 * paths like `/new-booking`, `/venue-account` and `/offers` are unchanged.
 *
 * Player-facing pushed screens live in the sibling `(player-stack)` group; genuinely
 * shared screens (e.g. `notifications`) stay at the root.
 */
export default function VenueStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
