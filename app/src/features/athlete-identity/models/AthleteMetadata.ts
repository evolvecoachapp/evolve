/**
 * Immutable metadata for Athlete Identity (Sprint 29.1).
 */
export interface AthleteMetadata {
  readonly generatedAt: string;
  readonly version: string;
  readonly identityId: string;
  readonly schemaVersion: string;
}
