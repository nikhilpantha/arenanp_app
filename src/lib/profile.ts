import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SportType, UserRole } from '@/types';

/**
 * Local profile stub. The auth provider owns identity; role and onboarding
 * progress live here (per auth user id) until the backend API is ready.
 *
 * TODO(backend): replace these reads/writes with calls to the profile API.
 * The store consumes this module, so screens won't change when the API lands.
 */
export interface LocalProfile {
  role?: UserRole;
  venueOnboarded?: boolean;
  /** Player has completed sport-interest onboarding. */
  playerOnboarded?: boolean;
  /** Sports the player is interested in (editable later from profile). */
  playerSports?: SportType[];
}

const key = (userId: string) => `profile:${userId}`;
const PENDING_ROLE_KEY = 'profile:pending-role';

/**
 * Role chosen before sign-up (no user id yet). Stashed here and adopted into the
 * profile on the first hydrate after the phone is verified.
 */
export async function setPendingRole(role: UserRole): Promise<void> {
  await AsyncStorage.setItem(PENDING_ROLE_KEY, role);
}

/** Read and clear the pending role (one-shot). */
export async function takePendingRole(): Promise<UserRole | null> {
  const role = (await AsyncStorage.getItem(PENDING_ROLE_KEY)) as UserRole | null;
  if (role) await AsyncStorage.removeItem(PENDING_ROLE_KEY);
  return role;
}

export async function loadLocalProfile(userId: string): Promise<LocalProfile> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as LocalProfile) : {};
  } catch {
    return {};
  }
}

async function patchLocalProfile(userId: string, patch: Partial<LocalProfile>): Promise<LocalProfile> {
  const current = await loadLocalProfile(userId);
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
  return next;
}

export function saveRole(userId: string, role: UserRole): Promise<LocalProfile> {
  return patchLocalProfile(userId, { role });
}

export function markVenueOnboarded(userId: string): Promise<LocalProfile> {
  return patchLocalProfile(userId, { venueOnboarded: true });
}

export function markPlayerOnboarded(userId: string, sports: SportType[]): Promise<LocalProfile> {
  return patchLocalProfile(userId, { playerOnboarded: true, playerSports: sports });
}

/**
 * Wipe the local profile for a user (role + onboarding progress).
 *
 * Frontend-only/mock behavior: sign-out clears this so a fresh sign-up/in re-enters
 * onboarding instead of skipping it on a stale `venueOnboarded`/`playerOnboarded` flag.
 * TODO(backend): drop this from sign-out once profiles live server-side — signing out
 * must not delete a real account's profile.
 */
export async function clearLocalProfile(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(userId));
  } catch {
    // best-effort
  }
}
