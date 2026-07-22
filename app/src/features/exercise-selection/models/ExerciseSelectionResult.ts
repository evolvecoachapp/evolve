import type { CandidateExercise } from "./CandidateExercise";
import type { ExerciseCandidateGroup } from "./ExerciseCandidateGroup";
import type { RejectedExercise } from "./RejectedExercise";
import type { SelectionContext } from "./SelectionContext";
import type { SelectionExplanation } from "./SelectionExplanation";

/**
 * Deterministic outcome of exercise candidate selection.
 * Does not produce a workout or prescribe volume/intensity.
 */
export interface ExerciseSelectionResult {
  readonly requestId: string;
  readonly context: SelectionContext;
  readonly groups: readonly ExerciseCandidateGroup[];
  /** Flattened candidates across all roles, deterministic order. */
  readonly candidates: readonly CandidateExercise[];
  readonly rejected: readonly RejectedExercise[];
  readonly explanations: readonly SelectionExplanation[];
  readonly validationIssues: readonly string[];
  /** ISO-8601 timestamp. */
  readonly selectedAt: string;
}
