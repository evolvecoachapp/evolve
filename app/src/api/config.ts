import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

/**
 * Resolved from `app.config.ts`'s `extra.apiBaseUrl` (itself sourced from
 * the `EXPO_PUBLIC_API_BASE_URL` env var — see `.env.example`), falling
 * back to `process.env` directly and finally a localhost default so the
 * app never crashes for lack of configuration in a fresh checkout.
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  DEFAULT_API_BASE_URL;
