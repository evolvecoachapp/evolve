/**
 * Immutable fatigue representation (no scoring).
 */
export interface FatigueState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
