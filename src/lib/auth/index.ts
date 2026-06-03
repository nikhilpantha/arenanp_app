import { mockAuth } from './mock-auth';
import type { AuthProvider } from './provider';

export type { AuthProvider, AuthSession, AuthUser } from './provider';

/**
 * Active auth backend. Frontend-only for now → mock (no network).
 *
 * When the API is ready, add `./api-auth.ts` implementing AuthProvider and swap
 * this line (`export const authProvider = apiAuth;`). Nothing else changes.
 */
export const authProvider: AuthProvider = mockAuth;
