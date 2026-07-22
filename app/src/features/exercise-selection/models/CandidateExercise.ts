import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { CandidateRole } from "./CandidateRole";
import type { SelectionReason } from "./SelectionReason";
import type { SelectionScore } from "./SelectionScore";

/**
 * Ranked exercise candidate for a training objective / role.
 * Selection only — never includes sets, reps, RPE, or volume.
 */
export interface CandidateExercise {
  readonly exerciseId: string;
  readonly exercise: ExerciseDefinition;
  readonly role: CandidateRole;
  readonly score: SelectionScore;
  readonly reasons: readonly SelectionReason[];
  /** 1-based rank within the role group. */
  readonly rank: number;
}
