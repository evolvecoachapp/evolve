/** Deterministic count of dependency ids only. */
export function evaluatePerformanceGoalCount(fromIds: readonly string[]): number {
  return new Set(fromIds).size;
}
