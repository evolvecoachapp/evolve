/**
 * Immutable version stamp for fused context.
 */
export interface ContextVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly revision: number;
  readonly label: string;
}

export const INITIAL_CONTEXT_VERSION: ContextVersion = Object.freeze({
  major: 1,
  minor: 0,
  patch: 0,
  revision: 0,
  label: "1.0.0+0",
});

export function formatContextVersion(version: ContextVersion): string {
  return `${version.major}.${version.minor}.${version.patch}+${version.revision}`;
}
