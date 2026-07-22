import type { ExerciseProgression } from "./ExerciseProgression";
import type { ProgressionContext } from "./ProgressionContext";
import type { ProgressionExplanation } from "./ProgressionExplanation";
import type { ProgressionScore } from "./ProgressionScore";
import type { ProgressionStep } from "./ProgressionStep";

/**
 * Immutable output of the Progression Engine.
 *
 * Deterministic multi-week evolution of programming prescriptions.
 * No athlete adaptation. No real performance. No fatigue. No readiness.
 */
export interface ProgressionPlan {
  readonly requestId: string;
  readonly context: ProgressionContext;
  readonly exerciseProgressions: readonly ExerciseProgression[];
  /** Flattened, week-ordered timeline across all exercises. */
  readonly timeline: readonly ProgressionStep[];
  readonly explanations: readonly ProgressionExplanation[];
  readonly validationIssues: readonly string[];
  readonly score: ProgressionScore;
  /** ISO-8601 — fixed by the engine for determinism. */
  readonly progressedAt: string;
}
