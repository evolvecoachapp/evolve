/**
 * Immutable energy availability representation (no calculations).
 */
export interface EnergyAvailability {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
