import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationCategory } from "../models/AdaptationCategory";

export function selectDecisionsByCategory(
  decisions: readonly AdaptationDecision[],
  category: AdaptationCategory,
): readonly AdaptationDecision[] {
  return Object.freeze(decisions.filter((d) => d.category === category));
}

export function selectDecisionById(
  decisions: readonly AdaptationDecision[],
  id: string,
): AdaptationDecision | null {
  return decisions.find((d) => d.id === id) ?? null;
}
