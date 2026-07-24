/**
 * Immutable hydration representation.
 */
export interface HydrationState {
  readonly status: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
