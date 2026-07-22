import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionScore } from "../models/SelectionScore";
import { compareCandidatesByScoreThenId } from "./sortDeterministically";

export interface RankableCandidate {
  readonly exerciseId: string;
  readonly score: SelectionScore;
  readonly reasons: CandidateExercise["reasons"];
  readonly exercise: CandidateExercise["exercise"];
}

/**
 * Rank candidates by score (desc) then id (asc), assigning 1-based ranks.
 */
export function rankCandidates(
  candidates: readonly RankableCandidate[],
  role: CandidateExercise["role"],
  limit: number,
): readonly CandidateExercise[] {
  const sorted = [...candidates].sort(compareCandidatesByScoreThenId);
  const limited = sorted.slice(0, Math.max(0, limit));
  return Object.freeze(
    limited.map((candidate, index) =>
      Object.freeze({
        exerciseId: candidate.exerciseId,
        exercise: candidate.exercise,
        role,
        score: candidate.score,
        reasons: Object.freeze([...candidate.reasons]),
        rank: index + 1,
      }),
    ),
  );
}
