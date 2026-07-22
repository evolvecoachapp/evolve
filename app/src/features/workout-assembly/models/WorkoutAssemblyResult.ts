import type { WorkoutAssemblyContext } from "./WorkoutAssemblyContext";
import type { WorkoutAssemblyExplanation } from "./WorkoutAssemblyExplanation";
import type { WorkoutAssemblyScore } from "./WorkoutAssemblyScore";
import type { WorkoutSession } from "./WorkoutSession";

/**
 * Immutable output of the Workout Assembly Engine.
 *
 * Assembles a final executable WorkoutSession from prior engine outputs.
 * Does not generate strategy, programming, progression, or readiness.
 */
export interface WorkoutAssemblyResult {
  readonly requestId: string;
  readonly context: WorkoutAssemblyContext;
  readonly session: WorkoutSession;
  readonly explanations: readonly WorkoutAssemblyExplanation[];
  readonly validationIssues: readonly string[];
  readonly score: WorkoutAssemblyScore;
  /** ISO-8601 — fixed by the engine for determinism. */
  readonly assembledAt: string;
}
