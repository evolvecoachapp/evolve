import type { WorkoutBlueprint } from "./WorkoutBlueprint";

/**
 * Outcome of a blueprint generation or validation pass.
 */
export interface WorkoutBlueprintResult {
  readonly blueprint: WorkoutBlueprint;
  /** Frozen validation issue codes; empty means valid. */
  readonly validationIssues: readonly string[];
  /** ISO-8601 timestamp. */
  readonly generatedAt: string;
}
