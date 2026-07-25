import type { CoachingExplanation } from "../models/CoachingExplanation";

export function selectExplanationById(
  explanations: readonly CoachingExplanation[],
  id: string,
): CoachingExplanation | null {
  return explanations.find((e) => e.id === id) ?? null;
}

export function selectExplanationsByCategory(
  explanations: readonly CoachingExplanation[],
  category: string,
): readonly CoachingExplanation[] {
  return Object.freeze(explanations.filter((e) => e.recommendationLink.category === category));
}
