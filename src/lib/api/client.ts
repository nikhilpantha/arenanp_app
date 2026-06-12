import { ClientError, GraphQLClient, type Variables } from 'graphql-request';

import { clearToken, loadToken } from './token-store';

/**
 * GraphQL endpoint. Configured via EXPO_PUBLIC_API_URL (e.g.
 * https://api.arenanp.com/graphql or http://localhost:8000/graphql). Required —
 * auth and identity talk to this backend directly.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * True when a backend URL is configured. Used to gate live data queries that also
 * need a resolved venue id (e.g. venue bookings/analytics) before the API is hit.
 */
export const isApiConfigured = API_URL.length > 0;

const client = new GraphQLClient(API_URL);

/** Thrown when the server rejects the token (expired / revoked tokenVersion). */
export class UnauthorizedError extends Error {
  constructor(message = 'Session expired') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

function isUnauthorized(err: unknown): boolean {
  if (!(err instanceof ClientError)) return false;
  const status = err.response?.status;
  if (status === 401) return true;
  return (err.response?.errors ?? []).some((e) => {
    const code = (e.extensions as { code?: string } | undefined)?.code;
    return code === 'UNAUTHENTICATED' || code === 'FORBIDDEN';
  });
}

/** Extract the first human-readable GraphQL error message, if any. */
function messageFrom(err: unknown): string | undefined {
  if (err instanceof ClientError) return err.response?.errors?.[0]?.message;
  return err instanceof Error ? err.message : undefined;
}

/**
 * Run a GraphQL operation with the current access token attached. On an auth
 * failure the token is cleared (the caller treats this as signed-out) and an
 * {@link UnauthorizedError} is thrown.
 */
export async function gqlRequest<T>(
  document: string,
  variables?: Variables,
  opts?: { auth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts?.auth !== false) {
    const token = await loadToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }
  try {
    return await client.request<T>(document, variables, headers);
  } catch (err) {
    if (isUnauthorized(err)) {
      await clearToken();
      throw new UnauthorizedError(messageFrom(err));
    }
    throw new Error(messageFrom(err) ?? 'Network request failed. Please try again.');
  }
}
