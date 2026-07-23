/**
 * Immutable model version descriptor.
 */
export interface AIModelVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly label: string | null;
  readonly releasedAt: string | null;
}

export function formatModelVersion(version: AIModelVersion): string {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.label ? `${base}-${version.label}` : base;
}
