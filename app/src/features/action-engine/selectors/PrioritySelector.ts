import type { ActionPriority } from "../models/ActionPriority";
import { ActionPriorities } from "../models/ActionPriority";
import type { ActionStep } from "../models/ActionStep";
import {
  comparePriorities,
  maxPriority,
  sortStepsByPriority,
} from "../utils/priorityHelpers";

/**
 * Deterministic priority selection.
 */
export class PrioritySelector {
  selectPlanPriority(steps: readonly ActionStep[]): ActionPriority {
    if (steps.length === 0) return ActionPriorities.MEDIUM;
    return maxPriority(steps.map((s) => s.priority));
  }

  selectHighest(steps: readonly ActionStep[]): ActionStep | null {
    const sorted = sortStepsByPriority(steps);
    return sorted[0] ?? null;
  }

  compare(a: ActionPriority, b: ActionPriority): number {
    return comparePriorities(a, b);
  }
}
