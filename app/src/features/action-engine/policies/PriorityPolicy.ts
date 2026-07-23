import type { ActionPriority } from "../models/ActionPriority";
import type { ActionStep } from "../models/ActionStep";
import { sortStepsByPriority } from "../utils/priorityHelpers";

/**
 * Priority policy — ordering rules only (no business decisions).
 */
export interface PriorityPolicy {
  readonly id: string;
  orderByPriority(steps: readonly ActionStep[]): readonly ActionStep[];
  meetsFloor(
    priority: ActionPriority,
    floor: ActionPriority,
    compare: (a: ActionPriority, b: ActionPriority) => number,
  ): boolean;
}

export class DefaultPriorityPolicy implements PriorityPolicy {
  readonly id = "policy:priority:default";

  orderByPriority(steps: readonly ActionStep[]): readonly ActionStep[] {
    return sortStepsByPriority(steps);
  }

  meetsFloor(
    priority: ActionPriority,
    floor: ActionPriority,
    compare: (a: ActionPriority, b: ActionPriority) => number,
  ): boolean {
    return compare(priority, floor) <= 0;
  }
}
