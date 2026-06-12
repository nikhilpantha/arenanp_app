import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persisted access token (JWT) for the GraphQL API. Kept in AsyncStorage and
 * mirrored in memory so the request layer can attach it synchronously.
 *
 * TODO(security): move to expo-secure-store once added to the app — AsyncStorage
 * is not encrypted at rest.
 */
const TOKEN_KEY = 'arenanp:access-token';

let cached: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (cached !== null) return cached;
  cached = await AsyncStorage.getItem(TOKEN_KEY);
  return cached;
}

export function getCachedToken(): string | null {
  return cached;
}

export async function setToken(token: string): Promise<void> {
  cached = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}
