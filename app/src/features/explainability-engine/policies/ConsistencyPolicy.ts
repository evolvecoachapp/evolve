import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applyConsistencyPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(
    explanations.map((e) =>
      e.decisionId && e.recommendationId ? freezeExplanation(e) : e,
    ),
  );
}
