import AsyncStorage from '@react-native-async-storage/async-storage';

import type { VenueFormValues } from '@/components/venue/onboarding/form';

/**
 * Local persistence for the in-progress venue onboarding draft, so a mid-flow app
 * restart resumes where the owner left off. Keyed per auth user.
 *
 * TODO(backend): drafts will eventually live server-side.
 */
const key = (userId: string) => `onboarding:venue-draft:${userId}`;

export async function loadVenueDraft(userId: string): Promise<Partial<VenueFormValues> | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as Partial<VenueFormValues>) : null;
  } catch {
    return null;
  }
}

export async function saveVenueDraft(
  userId: string,
  draft: Partial<VenueFormValues>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(key(userId), JSON.stringify(draft));
  } catch {
    // best-effort; losing a draft is non-fatal
  }
}

export async function clearVenueDraft(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(userId));
  } catch {
    // best-effort
  }
}
