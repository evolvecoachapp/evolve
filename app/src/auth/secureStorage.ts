import * as SecureStore from "expo-secure-store";

/**
 * Persists the access/refresh token pair in the platform's encrypted
 * storage (iOS Keychain / Android Keystore) via `expo-secure-store` —
 * never in `AsyncStorage`, which is unencrypted plain text. See Decision
 * 026 in docs/DECISIONS.md.
 */

const ACCESS_TOKEN_KEY = "evolve.access_token";
const REFRESH_TOKEN_KEY = "evolve.refresh_token";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Persist a fresh access/refresh token pair, overwriting any existing one. */
export async function saveTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/** Read the stored token pair, or `null` if either token is missing. */
export async function getTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

/** Read only the access token — the common case for attaching a request header. */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/** Remove both tokens, e.g. on logout or an unrecoverable auth failure. */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
