/**
 * Immutable athlete profile (Sprint 29.1).
 *
 * Identity-layer profile only — not Athlete State profile, not auth claims.
 */
export interface AthleteProfile {
  readonly displayName: string;
  readonly givenName: string | null;
  readonly familyName: string | null;
  readonly sex: string | null;
  readonly birthYear: number | null;
  readonly experienceLevel: string | null;
}
