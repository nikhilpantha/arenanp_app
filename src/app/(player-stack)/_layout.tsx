import { Stack } from 'expo-router';

/**
 * All player-facing pushed screens, grouped so the routing tree stays clean and every
 * player screen lives in one place: the venue browse + booking detail (`venue/[id]`,
 * `venue/[id]/book`) and the player calendar. A route group `(…)` is transparent to URLs,
 * so paths like `/venue/123` and `/player-calendar` are unchanged.
 *
 * Genuinely shared screens (e.g. `notifications`, pushed from both panels) stay at the root.
 */
export default function PlayerStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
