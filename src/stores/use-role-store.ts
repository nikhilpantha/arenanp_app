import { create } from 'zustand';

import type { Panel } from '@/types';

interface RoleState {
  /**
   * The active panel context that drives accent theming across the auth flow and the
   * panel's app area. Set from the welcome CTA pre-auth, then kept in sync with the
   * active panel by the auth store. `null` falls back to the player (green) accent.
   */
  role: Panel | null;
  setRole: (role: Panel | null) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
