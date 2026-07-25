import type { GoalProgress } from "../models/GoalProgress";

export function selectHighestPriorityDecisions(
  decisions: readonly GoalProgress[],
): readonly GoalProgress[] {
  if (decisions.length === 0) return Object.freeze([]);
  const min = Math.min(...decisions.map((d) => d.priority.ordinal));
  return Object.freeze(decisions.filter((d) => d.priority.ordinal === min));
}
