import type { RecommendationContext } from "../models/RecommendationContext";

export function selectFocusAreas(
  context: RecommendationContext | null,
): readonly string[] {
  return context?.focusAreas ?? Object.freeze([]);
}

export function selectDecisionIds(
  context: RecommendationContext | null,
): readonly string[] {
  return context?.decisionIds ?? Object.freeze([]);
}
