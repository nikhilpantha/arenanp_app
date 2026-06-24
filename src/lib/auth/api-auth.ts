import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Capability, Panel, VenueMembershipSummary, VenuePermission } from '@/types';

import { gqlRequest, UnauthorizedError } from '../api/client';
import { setDevOtp } from '../api/dev-otp';
import {
  type ApiUser,
  type ApiVenueMembership,
  type AuthPayload,
  IDENTITY,
  type IdentityResponse,
  LOGIN_WITH_PHONE,
  REQUEST_PLAYER_OTP,
  REQUEST_VENUE_OTP,
  SIGN_OUT,
  UPDATE_PROFILE,
  VERIFY_OTP,
} from '../api/operations';
import { clearToken, loadToken, setToken } from '../api/token-store';
import { uploadLocalFile } from '../api/uploads';
import type { AuthProvider, AuthSession } from './provider';

/**
 * Live auth backend (graphql-request). Mobile auth is OTP-only:
 *   signUp/signIn  → requestOtp  (no session yet)
 *   verifyOtp      → verifyOtp   (stores the JWT + emits the session)
 * The `password` arg is part of the neutral seam but unused by the OTP backend.
 */
const PENDING_NAME_KEY = 'api-auth:pending-name';
// Avatar chosen at sign-up. Stashed (no session yet) and uploaded once the phone
// is verified, then saved to the profile as an S3 object key.
const PENDING_AVATAR_KEY = 'api-auth:pending-avatar';

const listeners = new Set<(session: AuthSession | null) => void>();
function notify(session: AuthSession | null) {
  listeners.forEach((cb) => cb(session));
}

function mapMembership(m: ApiVenueMembership): VenueMembershipSummary {
  return {
    venueId: m.venueId,
    venueName: m.venueName,
    role: m.role,
    permissions: m.permissions as VenuePermission[],
    status: m.status,
    // Backend listing status uses PENDING; the app union uses PENDING_VERIFICATION.
    verificationStatus: m.verificationStatus === 'PENDING' ? 'PENDING_VERIFICATION' : m.verificationStatus,
  };
}

function toSession(user: ApiUser, memberships: ApiVenueMembership[]): AuthSession {
  return {
    user: {
      id: user.id,
      phone: user.phoneNumber,
      fullName: user.fullName ?? undefined,
      email: user.email ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      capabilities: user.capabilities as Capability[],
      venueMemberships: memberships.map(mapMembership),
    },
  };
}

/** Fetch the user + their venue memberships in one round-trip. */
async function loadIdentity(): Promise<AuthSession> {
  const data = await gqlRequest<IdentityResponse>(IDENTITY);
  return toSession(data.me, data.myVenueMemberships);
}

type OtpResult = { devCode?: string | null; roleAdded?: boolean | null };

// Pick the per-role OTP mutation (role is fixed server-side). Venue → owner
// role; everything else → player. `password` is set on first sign-up.
const requestOtp = async (
  phone: string,
  role: Panel = 'player',
  password?: string,
): Promise<void> => {
  const mutation = role === 'venue' ? REQUEST_VENUE_OTP : REQUEST_PLAYER_OTP;
  const key = role === 'venue' ? 'requestVenueOtp' : 'requestPlayerOtp';
  const r = await gqlRequest<Record<string, OtpResult>>(
    mutation,
    { input: { phoneNumber: phone, ...(password ? { password } : {}) } },
    { auth: false },
  );
  // Dev convenience: stash the stub OTP so the verify screen can show / fill it.
  if (__DEV__) setDevOtp(r[key]?.devCode ?? null);
};

export const apiAuth: AuthProvider = {
  async getSession() {
    // No token → definitely signed out; skip the network round-trip.
    if (!(await loadToken())) return null;
    try {
      return await loadIdentity();
    } catch (err) {
      // No / expired token or offline → treat as signed out on launch.
      if (err instanceof UnauthorizedError) await clearToken();
      return null;
    }
  },

  onAuthChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async signUp({ phone, fullName, role, password, photo }) {
    if (fullName) await AsyncStorage.setItem(PENDING_NAME_KEY, fullName);
    if (photo) await AsyncStorage.setItem(PENDING_AVATAR_KEY, photo);
    await requestOtp(phone, role, password);
  },

  async signIn({ phone, role }) {
    await requestOtp(phone, role);
  },

  async loginWithPassword({ phone, password }) {
    const { loginWithPhone } = await gqlRequest<{ loginWithPhone: AuthPayload }>(
      LOGIN_WITH_PHONE,
      { input: { phoneNumber: phone, password } },
      { auth: false },
    );
    await setToken(loginWithPhone.accessToken);
    notify(await loadIdentity());
  },

  async verifyOtp({ phone, token }) {
    const { verifyOtp } = await gqlRequest<{ verifyOtp: AuthPayload }>(
      VERIFY_OTP,
      { input: { phoneNumber: phone, code: token } },
      { auth: false },
    );
    await setToken(verifyOtp.accessToken);

    // Apply the name + avatar collected at sign-up (the OTP endpoint takes neither).
    // The avatar can only be uploaded now — uploading needs the session token.
    const profilePatch: { fullName?: string; avatarUrl?: string } = {};

    const pendingName = await AsyncStorage.getItem(PENDING_NAME_KEY);
    if (pendingName) {
      await AsyncStorage.removeItem(PENDING_NAME_KEY);
      if (!verifyOtp.user.fullName) profilePatch.fullName = pendingName;
    }

    const pendingAvatar = await AsyncStorage.getItem(PENDING_AVATAR_KEY);
    if (pendingAvatar) {
      await AsyncStorage.removeItem(PENDING_AVATAR_KEY);
      try {
        // Resolves to the S3 object key persisted in avatarUrl.
        profilePatch.avatarUrl = await uploadLocalFile(pendingAvatar, { category: 'AVATAR' });
      } catch {
        // Best-effort: a failed avatar upload must not block account creation.
      }
    }

    if (Object.keys(profilePatch).length) {
      await gqlRequest<{ updateProfile: ApiUser }>(UPDATE_PROFILE, { input: profilePatch });
    }
    // Load the full identity (user + memberships) for the session.
    notify(await loadIdentity());
  },

  async resendOtp({ phone }) {
    await requestOtp(phone);
  },

  async signOut() {
    try {
      await gqlRequest(SIGN_OUT);
    } catch {
      // Best-effort: even if the server call fails, drop the local token.
    }
    await clearToken();
    await AsyncStorage.multiRemove([PENDING_NAME_KEY, PENDING_AVATAR_KEY]);
    notify(null);
  },
};
