import { create } from 'zustand';

import { authProvider, type AuthSession } from '@/lib/auth';
import { clearVenueDraft } from '@/lib/onboarding-draft';
import {
  clearLocalProfile,
  loadLocalProfile,
  markPlayerOnboarded,
  markVenueOnboarded,
  saveRole,
  setPendingRole,
  takePendingRole,
} from '@/lib/profile';
import type { Profile, SportType, UserRole } from '@/types';

import { useRoleStore } from './use-role-store';

// 'onboarding' = phone verified, but role (and, for owners, venue) not yet set.
export type AuthStatus = 'loading' | 'signedOut' | 'onboarding' | 'authed';

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  profile: Profile | null;
  init: () => () => void;
  signUp: (args: { phone: string; password: string; fullName: string }) => Promise<void>;
  signIn: (args: { phone: string; password: string }) => Promise<void>;
  verifyOtp: (args: { phone: string; token: string }) => Promise<void>;
  resendOtp: (args: { phone: string }) => Promise<void>;
  /** Stash the role chosen before sign-up; adopted on the first hydrate after verify. */
  choosePendingRole: (role: UserRole) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  completeVenueOnboarding: () => Promise<void>;
  completePlayerOnboarding: (sports: SportType[]) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Builds the in-memory profile + status from the auth provider's session and the
  // local profile stub (role / venue progress). The provider owns auth; the rest is local.
  const hydrate = async (session: AuthSession) => {
    let local = await loadLocalProfile(session.user.id);
    // First hydrate after verify: adopt the role chosen before sign-up.
    if (!local.role) {
      const pending = await takePendingRole();
      if (pending) local = await saveRole(session.user.id, pending);
    }
    const profile: Profile = {
      id: session.user.id,
      role: local.role,
      fullName: session.user.fullName,
      phone: session.user.phone,
    };
    const needsRole = !local.role;
    const needsVenue = local.role === 'owner' && !local.venueOnboarded;
    const needsPlayerOnboarding = local.role === 'player' && !local.playerOnboarded;
    // Keep the accent context in sync with the signed-in role.
    useRoleStore.getState().setRole(local.role ?? null);
    set({
      session,
      profile,
      status: needsRole || needsVenue || needsPlayerOnboarding ? 'onboarding' : 'authed',
    });
  };

  const clear = () => {
    useRoleStore.getState().setRole(null);
    set({ session: null, profile: null, status: 'signedOut' });
  };

  return {
    status: 'loading',
    session: null,
    profile: null,

    // Resolves the persisted session on launch, then keeps the store in sync with
    // the auth provider. Returns an unsubscribe fn for the root layout to clean up.
    init: () => {
      void (async () => {
        const session = await authProvider.getSession();
        if (session) await hydrate(session);
        else clear();
      })();

      // Keep the store in sync as the provider's session changes.
      return authProvider.onAuthChange((session) => {
        void (session ? hydrate(session) : clear());
      });
    },

    // Sign up with phone + password. Sends an OTP; verifyOtp creates the session.
    signUp: async ({ phone, password, fullName }) => {
      await authProvider.signUp({ phone, password, fullName });
    },

    // Returning users: phone + password. onAuthChange hydrates the session.
    signIn: async ({ phone, password }) => {
      await authProvider.signIn({ phone, password });
    },

    verifyOtp: async ({ phone, token }) => {
      await authProvider.verifyOtp({ phone, token });
      // onAuthChange fires with the new session → hydrate → 'onboarding'.
    },

    resendOtp: async ({ phone }) => {
      await authProvider.resendOtp({ phone });
    },

    choosePendingRole: async (role) => {
      await setPendingRole(role);
    },

    // Persist the chosen role locally, then recompute status: players become 'authed';
    // owners stay 'onboarding' until they finish venue setup.
    setRole: async (role) => {
      const session = get().session;
      if (!session) return;
      await saveRole(session.user.id, role);
      await hydrate(session);
    },

    completeVenueOnboarding: async () => {
      const session = get().session;
      if (!session) return;
      await markVenueOnboarded(session.user.id);
      await hydrate(session);
    },

    // Persist the player's sport interests + mark onboarding done → status becomes
    // 'authed' and the root guard swaps to the player tabs (home).
    completePlayerOnboarding: async (sports) => {
      const session = get().session;
      if (!session) return;
      await markPlayerOnboarded(session.user.id, sports);
      await hydrate(session);
    },

    signOut: async () => {
      // Mock phase only: also reset this account's local onboarding so a fresh
      // sign-up/in re-runs the role → venue/player flow instead of skipping it on a
      // stale flag. See clearLocalProfile's TODO — drop this once the backend lands.
      const session = get().session;
      if (session) {
        await clearLocalProfile(session.user.id);
        await clearVenueDraft(session.user.id);
      }
      await authProvider.signOut();
    },
  };
});
