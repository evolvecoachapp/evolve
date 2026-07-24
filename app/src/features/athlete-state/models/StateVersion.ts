/**
 * Immutable version stamp for athlete state evolution.
 */
export interface StateVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly revision: number;
  readonly label: string;
}

export const INITIAL_STATE_VERSION: StateVersion = Object.freeze({
  major: 1,
  minor: 0,
  patch: 0,
  revision: 0,
  label: "1.0.0+0",
});

export function formatStateVersion(version: StateVersion): string {
  return `${version.major}.${version.minor}.${version.patch}+${version.revision}`;
}
