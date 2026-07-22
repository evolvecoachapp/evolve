/**
 * Deterministic execution order for an assembled session.
 * No timers. No live state.
 */
export interface WorkoutExecutionOrder {
  /** Ordered workout exercise ids. */
  readonly exerciseIds: readonly string[];
  /** Ordered workout block ids. */
  readonly blockIds: readonly string[];
}
