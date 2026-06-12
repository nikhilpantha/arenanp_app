import { create } from 'zustand';

import { authProvider, type AuthSession } from '@/lib/auth';
import { clearVenueDraft } from '@/lib/onboarding-draft';
import { availablePanels, venueMembershipsFromCapabilities } from '@/lib/panels';
import {
  clearLocalProfile,
  loadLocalProfile,
  saveInitialPanel,
  setPendingPanel,
  takePendingPanel,
} from '@/lib/profile';
import type { Panel, Profile } from '@/types';

import { useRoleStore } from './use-role-store';

// 'onboarding' = phone verified, but the initial panel (and, for venue, the venue
// submission) not yet completed.
export type AuthStatus = 'loading' | 'signedOut' | 'onboarding' | 'authed';

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  profile: Profile | null;
  /** The panel currently being viewed (resolved from the login entry + capabilities). */
  activePanel: Panel | null;
  /** The panel chosen at signup — drives onboarding routing before panels resolve. */
  initialPanel: Panel | null;
  init: () => () => void;
  signUp: (args: {
    phone: string;
    password: string;
    fullName: string;
    photo?: string;
  }) => Promise<void>;
  signIn: (args: { phone: string; password: string }) => Promise<void>;
  /** Password login (mobile) — only after the phone has been OTP-verified once. */
  loginWithPassword: (args: { phone: string; password: string }) => Promise<void>;
  verifyOtp: (args: { phone: string; token: string }) => Promise<void>;
  resendOtp: (args: { phone: string }) => Promise<void>;
  /** Stash the panel chosen before sign-up; adopted on the first hydrate after verify. */
  choosePendingPanel: (panel: Panel) => Promise<void>;
  /** Fallback chooser for an authed account with no initial panel set. */
  setInitialPanel: (panel: Panel) => Promise<void>;
  /** Re-fetch the backend identity (capabilities + venue memberships) and re-hydrate. */
  reloadIdentity: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Builds the in-memory profile + panels + status from the auth session and the
  // local profile (onboarding-progress) stub. Capabilities + venue memberships
  // come straight from the backend `me` query via the auth provider.
  const hydrate = async (session: AuthSession) => {
    let local = await loadLocalProfile(session.user.id);
    // The panel is chosen at login (the welcome CTA). Adopt it whenever present so
    // logging in via a panel always lands there — there's no in-app switching, so a
    // multi-role account just signs out and logs in through the other panel.
    const pending = await takePendingPanel();
    if (pending) local = await saveInitialPanel(session.user.id, pending);

    // Identity from the backend `me` query: real capabilities + venue memberships.
    const capabilities = session.user.capabilities ?? [];
    const profile: Profile = {
      id: session.user.id,
      fullName: session.user.fullName,
      phone: session.user.phone,
      capabilities,
      venueMemberships:
        session.user.venueMemberships ?? venueMembershipsFromCapabilities(capabilities),
    };

    const panels = availablePanels(profile);
    // The panel the account logged in as, falling back to the first it actually has
    // (a venue-only account has no player panel).
    const preferred = local.initialPanel ?? panels[0];
    const activePanel: Panel = panels.includes(preferred) ? preferred : panels[0];

    // Neither panel has an onboarding step now — the capability is granted at
    // sign-up, so authentication routes straight to that panel's dashboard. The
    // only 'onboarding' case left is an account that never chose a panel (→ picker).
    const needsPanel = !local.initialPanel;

    // Keep the accent context in sync with the active panel.
    useRoleStore.getState().setRole(activePanel);
    set({
      session,
      profile,
      activePanel,
      initialPanel: local.initialPanel ?? null,
      status: needsPanel ? 'onboarding' : 'authed',
    });
  };

  const clear = () => {
    useRoleStore.getState().setRole(null);
    set({
      session: null,
      profile: null,
      activePanel: null,
      initialPanel: null,
      status: 'signedOut',
    });
  };

  return {
    status: 'loading',
    session: null,
    profile: null,
    activePanel: null,
    initialPanel: null,

    init: () => {
      void (async () => {
        const session = await authProvider.getSession();
        if (session) await hydrate(session);
        else clear();
      })();
      return authProvider.onAuthChange((session) => {
        void (session ? hydrate(session) : clear());
      });
    },

    signUp: async ({ phone, password, fullName, photo }) => {
      // The role is the panel chosen on the welcome screen (held in the role store).
      const role = useRoleStore.getState().role ?? 'player';
      await authProvider.signUp({ phone, password, fullName, role, photo });
    },

    signIn: async ({ phone, password }) => {
      const role = useRoleStore.getState().role ?? 'player';
      await authProvider.signIn({ phone, password, role });
    },

    loginWithPassword: async ({ phone, password }) => {
      await authProvider.loginWithPassword({ phone, password });
    },

    verifyOtp: async ({ phone, token }) => {
      await authProvider.verifyOtp({ phone, token });
    },

    resendOtp: async ({ phone }) => {
      await authProvider.resendOtp({ phone });
    },

    choosePendingPanel: async (panel) => {
      await setPendingPanel(panel);
    },

    setInitialPanel: async (panel) => {
      const session = get().session;
      if (!session) return;
      await saveInitialPanel(session.user.id, panel);
      await hydrate(session);
    },

    reloadIdentity: async () => {
      const session = (await authProvider.getSession()) ?? get().session;
      if (session) await hydrate(session);
    },

    signOut: async () => {
      const session = get().session;
      if (session) {
        await clearLocalProfile(session.user.id);
        await clearVenueDraft(session.user.id);
      }
      await authProvider.signOut();
    },
  };
});
