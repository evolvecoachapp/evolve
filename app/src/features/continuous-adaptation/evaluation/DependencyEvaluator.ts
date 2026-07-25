/** Deterministic count of dependency ids only. */
export function evaluateDependencyCount(fromIds: readonly string[]): number {
  return new Set(fromIds).size;
}
