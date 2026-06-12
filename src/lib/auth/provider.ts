import type { Capability, Panel, VenueMembershipSummary } from '@/types';

/**
 * Neutral auth contract. The app talks to an {@link AuthProvider}, never to a
 * specific backend — keeping screens + stores decoupled from the transport.
 */
export interface AuthUser {
  id: string;
  phone?: string;
  fullName?: string;
  /** Platform capabilities from the backend `me` query. */
  capabilities?: Capability[];
  /** Venue memberships from the backend `me` query. */
  venueMemberships?: VenueMembershipSummary[];
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthProvider {
  /** Resolve the persisted session on launch (or null if signed out). */
  getSession(): Promise<AuthSession | null>;
  /** Subscribe to session changes. Returns an unsubscribe fn. */
  onAuthChange(cb: (session: AuthSession | null) => void): () => void;
  /**
   * Start sign-up; triggers an OTP to the phone and ensures the chosen role's
   * capability. The `password` is set on first sign-up; `role` selects which
   * role to grant (defaults to player). Does NOT create a session yet.
   */
  signUp(args: {
    phone: string;
    password: string;
    fullName: string;
    role?: Panel;
    /** Local image URI of the avatar chosen at sign-up; uploaded after the phone is verified. */
    photo?: string;
  }): Promise<void>;
  /** Returning user login; triggers an OTP (and ensures the role for `role`'s panel). */
  signIn(args: { phone: string; password?: string; role?: Panel }): Promise<void>;
  /** Confirm the phone OTP; creates the session for a pending sign-up. */
  verifyOtp(args: { phone: string; token: string }): Promise<void>;
  /** Password login (mobile) — only works once the phone has been OTP-verified once. */
  loginWithPassword(args: { phone: string; password: string }): Promise<void>;
  /** Re-send the OTP for a pending sign-up. */
  resendOtp(args: { phone: string }): Promise<void>;
  signOut(): Promise<void>;
}
