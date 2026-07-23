/**
 * Immutable hydration planning proposal.
 */
export interface HydrationPlan {
  readonly litersPerDay: number;
  readonly notes: readonly string[];
}
