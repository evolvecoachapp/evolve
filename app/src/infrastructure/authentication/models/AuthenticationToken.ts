/**
 * Immutable opaque access token handle.
 * No JWT parsing. No encryption. Opaque string only.
 */
export interface AuthenticationToken {
  readonly value: string;
  readonly type: "access";
  readonly issuedAt: string;
}

export function createAuthenticationToken(input: {
  readonly value: string;
  readonly issuedAt: string;
}): AuthenticationToken {
  return Object.freeze({
    value: input.value,
    type: "access" as const,
    issuedAt: input.issuedAt,
  });
}
