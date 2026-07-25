import { priorityForOrdinal, type GoalPriority } from "../models/GoalPriority";

/** Deterministic ordinal lookup only. */
export function evaluatePriority(ordinal: number): GoalPriority {
  return priorityForOrdinal(ordinal);
}

/** Fixed category → ordinal table. */
const CATEGORY_ORDINAL: Readonly<Record<string, number>> = Object.freeze({
  recovery: 0,
  workout: 1,
  nutrition: 2,
  goal: 2,
  performance: 1,
  adherence: 3,
  state: 2,
  general: 3,
});

export function evaluatePriorityForCategory(category: string): GoalPriority {
  return priorityForOrdinal(CATEGORY_ORDINAL[category] ?? 3);
}
