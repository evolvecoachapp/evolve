/**
 * Immutable athlete identity.
 */
export interface AthleteIdentity {
  readonly athleteId: string;
  readonly displayName: string | null;
  readonly externalIds: Readonly<Record<string, string>>;
}
