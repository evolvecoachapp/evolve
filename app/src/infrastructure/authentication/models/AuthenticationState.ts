/**
 * Deterministic authentication session state.
 * No timers. No background refresh.
 */
export const AUTHENTICATION_STATES = [
  "anonymous",
  "authenticated",
  "signed_out",
  "invalid",
] as const;

export type AuthenticationState = (typeof AUTHENTICATION_STATES)[number];

export function isAuthenticationState(
  value: string,
): value is AuthenticationState {
  return (AUTHENTICATION_STATES as readonly string[]).includes(value);
}
