import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionCategory } from "../models/DecisionCategory";

export function selectDecisionsByCategory(
  decisions: readonly CoachingDecision[],
  category: DecisionCategory,
): readonly CoachingDecision[] {
  return Object.freeze(decisions.filter((d) => d.category === category));
}

export function selectPrimaryDecision(
  decisions: readonly CoachingDecision[],
): CoachingDecision | null {
  return decisions[0] ?? null;
}
