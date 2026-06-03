import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthProvider, AuthSession } from './provider';

/**
 * In-memory / AsyncStorage-backed auth for frontend-only development — no network.
 * - Any 6-digit code passes OTP verification.
 * - Login accepts any phone + password.
 * The user id is derived from the phone (`mock-<phone>`) so the local role/venue
 * profile sticks to the same account across sign-up and login.
 */
const SESSION_KEY = 'mock-auth:session';
const PENDING_KEY = 'mock-auth:pending';

interface Pending {
  phone: string;
  password: string;
  fullName: string;
}

const listeners = new Set<(session: AuthSession | null) => void>();

function notify(session: AuthSession | null) {
  listeners.forEach((cb) => cb(session));
}

async function persistSession(session: AuthSession | null) {
  if (session) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
  notify(session);
}

function sessionFor(phone: string, fullName?: string): AuthSession {
  return { user: { id: `mock-${phone}`, phone, fullName } };
}

export const mockAuth: AuthProvider = {
  async getSession() {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  },

  onAuthChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async signUp({ phone, password, fullName }) {
    const pending: Pending = { phone, password, fullName };
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    // No session yet — the OTP step finalizes it.
  },

  async signIn({ phone }) {
    await persistSession(sessionFor(phone));
  },

  async verifyOtp({ phone, token }) {
    if (!/^\d{6}$/.test(token)) throw new Error('Enter the 6-digit code.');
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    const pending = raw ? (JSON.parse(raw) as Pending) : null;
    await AsyncStorage.removeItem(PENDING_KEY);
    await persistSession(sessionFor(phone, pending?.fullName));
  },

  async resendOtp() {
    // No-op: the mock accepts any 6-digit code.
  },

  async signOut() {
    await persistSession(null);
  },
};
