/**
 * Immutable confidence representation (facts only — no AI scoring).
 */
export interface ContextConfidence {
  readonly level: "unknown" | "low" | "medium" | "high" | "complete";
  readonly sourceCount: number;
  readonly resolvedConflictCount: number;
  readonly notes: readonly string[];
}
