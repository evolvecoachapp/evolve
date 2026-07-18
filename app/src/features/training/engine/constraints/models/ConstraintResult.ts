/**
 * Outcome of a constraint evaluation. Used both as the shape returned by a
 * single `Constraint` and as the aggregated decision produced by the
 * `ConstraintEngine`, so combining many results together never requires
 * changing shape — aggregation is just merging lists of this same type.
 *
 * `rejected` is true when at least one hard requirement was violated, and
 * `allowed` is always its logical negation; both are exposed explicitly so
 * callers never need to remember which way the boolean points. `reasons`
 * explain why a candidate was rejected; `warnings` flag non-blocking
 * concerns that do not by themselves cause rejection.
 */
export interface ConstraintResult {
  readonly allowed: boolean;
  readonly rejected: boolean;
  readonly warnings: readonly string[];
  readonly reasons: readonly string[];
}
