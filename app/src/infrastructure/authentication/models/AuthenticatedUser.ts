import {
  createAuthenticationMetadata,
  type AuthenticationMetadata,
} from "./AuthenticationMetadata";

/**
 * Immutable authenticated user projection.
 * Not domain Athlete Identity. No persistence. No OAuth profile.
 */
export interface AuthenticatedUser {
  readonly userId: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly metadata: AuthenticationMetadata;
}

export function createAuthenticatedUser(input: {
  readonly userId: string;
  readonly email?: string | null;
  readonly displayName?: string | null;
  readonly metadata?: Readonly<Record<string, string>>;
}): AuthenticatedUser {
  return Object.freeze({
    userId: input.userId,
    email: input.email ?? null,
    displayName: input.displayName ?? null,
    metadata: createAuthenticationMetadata(input.metadata ?? {}),
  });
}
