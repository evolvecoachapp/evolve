/**
 * Immutable health indicator facts (representation only).
 */
export interface HealthIndicators {
  readonly flags: readonly string[];
  readonly clearanceStatus: string | null;
  readonly notes: readonly string[];
}
