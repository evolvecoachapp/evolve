import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applyExplainabilityPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(explanations.map(freezeExplanation));
}
