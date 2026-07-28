/**
 * Immutable opaque refresh token handle.
 * No JWT parsing. No encryption. Opaque string only.
 */
export interface RefreshToken {
  readonly value: string;
  readonly type: "refresh";
  readonly issuedAt: string;
}

export function createRefreshToken(input: {
  readonly value: string;
  readonly issuedAt: string;
}): RefreshToken {
  return Object.freeze({
    value: input.value,
    type: "refresh" as const,
    issuedAt: input.issuedAt,
  });
}
