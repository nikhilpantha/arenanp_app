import { create } from 'zustand';

import type { UserRole } from '@/types';

interface RoleState {
  /**
   * The active role context that drives accent theming across the auth flow and the
   * role's app area. Set from the welcome CTA pre-auth, then kept in sync with the
   * signed-in profile by the auth store. `null` falls back to the player (green) accent.
   */
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
