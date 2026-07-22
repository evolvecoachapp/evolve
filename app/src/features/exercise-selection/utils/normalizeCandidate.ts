import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { CandidateRole } from "../models/CandidateRole";
import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionReason } from "../models/SelectionReason";
import type { SelectionScore } from "../models/SelectionScore";
import { createEmptySelectionScore } from "../models/SelectionScore";

export interface NormalizeCandidateInput {
  readonly exercise: ExerciseDefinition;
  readonly role: CandidateRole;
  readonly score?: SelectionScore;
  readonly reasons?: readonly SelectionReason[];
  readonly rank?: number;
}

/**
 * Normalize a candidate into a frozen CandidateExercise.
 */
export function normalizeCandidate(
  input: NormalizeCandidateInput,
): CandidateExercise {
  return Object.freeze({
    exerciseId: input.exercise.id,
    exercise: input.exercise,
    role: input.role,
    score: input.score ?? createEmptySelectionScore(),
    reasons: Object.freeze([...(input.reasons ?? [])]),
    rank: input.rank ?? 0,
  });
}
