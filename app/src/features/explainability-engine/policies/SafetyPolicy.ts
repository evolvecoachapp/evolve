import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applySafetyPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(
    explanations.map((e) => {
      if (e.recommendationLink.category !== "safety") return freezeExplanation(e);
      return freezeExplanation({
        ...e,
        priority: Object.freeze({ ...e.priority, ordinal: 0, urgency: 100, label: "critical" }),
      });
    }),
  );
}
