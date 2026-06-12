import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Panel } from '@/types';

/**
 * Local profile stub. The auth provider owns identity; the panel the account
 * logged in as is kept here (per auth user id) so routing resolves before the
 * backend `me` query returns. Capabilities + venue memberships come from `me`.
 */
export interface LocalProfile {
  /** Panel the account logged in as (player or venue). Drives routing before `me` resolves. */
  initialPanel?: Panel;
}

const key = (userId: string) => `profile:${userId}`;
const PENDING_PANEL_KEY = 'profile:pending-panel';

/**
 * Panel chosen before sign-up (no user id yet). Stashed here and adopted into the
 * profile on the first hydrate after the phone is verified.
 */
export async function setPendingPanel(panel: Panel): Promise<void> {
  await AsyncStorage.setItem(PENDING_PANEL_KEY, panel);
}

/** Read and clear the pending panel (one-shot). */
export async function takePendingPanel(): Promise<Panel | null> {
  const panel = (await AsyncStorage.getItem(PENDING_PANEL_KEY)) as Panel | null;
  if (panel) await AsyncStorage.removeItem(PENDING_PANEL_KEY);
  return panel;
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

/** Persist the panel the account logged in as. */
export function saveInitialPanel(userId: string, panel: Panel): Promise<LocalProfile> {
  return patchLocalProfile(userId, { initialPanel: panel });
}

/**
 * Wipe the local profile for a user (panel + onboarding progress).
 *
 * Frontend-only/mock behavior: sign-out clears this so a fresh sign-up/in re-enters
 * onboarding instead of skipping it on a stale flag.
 * TODO(backend): drop this from sign-out once profiles live server-side.
 */
export async function clearLocalProfile(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(userId));
  } catch {
    // best-effort
  }
}
