import { apiAuth } from './api-auth';
import type { AuthProvider } from './provider';

export type { AuthProvider, AuthSession, AuthUser } from './provider';

/**
 * Active auth backend — the live GraphQL API. The endpoint is configured via
 * EXPO_PUBLIC_API_URL (see lib/api/client.ts). Screens + stores talk to this
 * seam only, so the backend stays invisible to them.
 */
export const authProvider: AuthProvider = apiAuth;
