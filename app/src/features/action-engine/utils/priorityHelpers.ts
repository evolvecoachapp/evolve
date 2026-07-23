import type { ActionPriority } from "../models/ActionPriority";
import {
  ActionPriorities,
  ActionPriorityRanks,
} from "../models/ActionPriority";
import type { ActionStep } from "../models/ActionStep";

/**
 * Deterministic priority helpers.
 */

export function priorityRank(priority: ActionPriority): number {
  return ActionPriorityRanks[priority];
}

export function comparePriorities(
  a: ActionPriority,
  b: ActionPriority,
): number {
  return priorityRank(b) - priorityRank(a);
}

export function isValidPriority(value: string): value is ActionPriority {
  return Object.values(ActionPriorities).includes(value as ActionPriority);
}

export function maxPriority(
  priorities: readonly ActionPriority[],
): ActionPriority {
  if (priorities.length === 0) return ActionPriorities.MEDIUM;
  return [...priorities].sort(comparePriorities)[0];
}

export function sortStepsByPriority(
  steps: readonly ActionStep[],
): readonly ActionStep[] {
  return Object.freeze(
    [...steps].sort(
      (a, b) =>
        comparePriorities(a.priority, b.priority) ||
        a.order - b.order ||
        a.id.localeCompare(b.id),
    ),
  );
}

export function averagePriorityRank(
  steps: readonly ActionStep[],
): number {
  if (steps.length === 0) return 0;
  const sum = steps.reduce((acc, s) => acc + priorityRank(s.priority), 0);
  return sum / steps.length;
}
