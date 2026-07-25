import type { GoalProgress } from "../models/GoalProgress";
import type { GoalCategory } from "../models/GoalCategory";

export function selectDecisionsByCategory(
  decisions: readonly GoalProgress[],
  category: GoalCategory,
): readonly GoalProgress[] {
  return Object.freeze(decisions.filter((d) => d.category === category));
}

export function selectDecisionById(
  decisions: readonly GoalProgress[],
  id: string,
): GoalProgress | null {
  return decisions.find((d) => d.id === id) ?? null;
}
