/**
 * Immutable readiness representation (no scoring).
 */
export interface ReadinessState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
