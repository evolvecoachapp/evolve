import type { AuthenticatedUser } from "./AuthenticatedUser";
import {
  createAuthenticationMetadata,
  type AuthenticationMetadata,
} from "./AuthenticationMetadata";
import type { AuthenticationState } from "./AuthenticationState";
import type { AuthenticationToken } from "./AuthenticationToken";
import type { RefreshToken } from "./RefreshToken";

/**
 * Immutable authentication session.
 * Deterministic state only — no expiration timers, no background refresh.
 */
export interface AuthenticationSession {
  readonly sessionId: string;
  readonly user: AuthenticatedUser;
  readonly accessToken: AuthenticationToken;
  readonly refreshToken: RefreshToken;
  readonly state: AuthenticationState;
  readonly metadata: AuthenticationMetadata;
  readonly createdAt: string;
}

export function createAuthenticationSession(input: {
  readonly sessionId: string;
  readonly user: AuthenticatedUser;
  readonly accessToken: AuthenticationToken;
  readonly refreshToken: RefreshToken;
  readonly state: AuthenticationState;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
}): AuthenticationSession {
  return Object.freeze({
    sessionId: input.sessionId,
    user: input.user,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    state: input.state,
    metadata: createAuthenticationMetadata(input.metadata ?? {}),
    createdAt: input.createdAt,
  });
}
