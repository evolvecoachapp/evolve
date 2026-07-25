import { priorityForOrdinal, type AdaptationPriority } from "../models/AdaptationPriority";

/** Deterministic ordinal lookup only. */
export function evaluatePriority(ordinal: number): AdaptationPriority {
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

export function evaluatePriorityForCategory(category: string): AdaptationPriority {
  return priorityForOrdinal(CATEGORY_ORDINAL[category] ?? 3);
}
