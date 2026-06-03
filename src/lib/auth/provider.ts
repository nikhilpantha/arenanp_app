/**
 * Neutral auth contract. The app talks to an {@link AuthProvider}, never to a
 * specific backend — so we can swap the mock for our own API by changing one
 * line in ./index.ts, with no screen or store changes.
 */
export interface AuthUser {
  id: string;
  phone?: string;
  fullName?: string;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthProvider {
  /** Resolve the persisted session on launch (or null if signed out). */
  getSession(): Promise<AuthSession | null>;
  /** Subscribe to session changes. Returns an unsubscribe fn. */
  onAuthChange(cb: (session: AuthSession | null) => void): () => void;
  /** Start sign-up; triggers an OTP to the phone. Does NOT create a session yet. */
  signUp(args: { phone: string; password: string; fullName: string }): Promise<void>;
  /** Returning user login; creates a session on success. */
  signIn(args: { phone: string; password: string }): Promise<void>;
  /** Confirm the phone OTP; creates the session for a pending sign-up. */
  verifyOtp(args: { phone: string; token: string }): Promise<void>;
  /** Re-send the OTP for a pending sign-up. */
  resendOtp(args: { phone: string }): Promise<void>;
  signOut(): Promise<void>;
}
