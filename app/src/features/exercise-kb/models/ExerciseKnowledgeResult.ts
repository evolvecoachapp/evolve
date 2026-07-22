import type { ExerciseDefinition } from "./ExerciseDefinition";

/**
 * Outcome of an exercise knowledge query or validation pass.
 */
export interface ExerciseKnowledgeResult {
  readonly exercises: readonly ExerciseDefinition[];
  /** Frozen validation issue codes; empty means valid. */
  readonly validationIssues: readonly string[];
  /** ISO-8601 timestamp. */
  readonly queriedAt: string;
}
