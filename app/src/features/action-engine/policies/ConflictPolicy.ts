import type { ActionStep } from "../models/ActionStep";
import type { ActionType } from "../models/ActionType";

/**
 * Conflict policy — detect conflicting step types (no resolution business logic).
 */
export interface ConflictPolicy {
  readonly id: string;
  findConflicts(steps: readonly ActionStep[]): readonly ActionConflict[];
}

export interface ActionConflict {
  readonly leftStepId: string;
  readonly rightStepId: string;
  readonly reason: string;
}

export class DefaultConflictPolicy implements ConflictPolicy {
  readonly id = "policy:conflict:default";

  findConflicts(steps: readonly ActionStep[]): readonly ActionConflict[] {
    const conflicts: ActionConflict[] = [];
    const byType = new Map<ActionType, ActionStep[]>();

    for (const step of steps) {
      const list = byType.get(step.type) ?? [];
      list.push(step);
      byType.set(step.type, list);
    }

    // Same type + identical label => conflict marker (deterministic, no domain logic)
    for (const group of byType.values()) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].label === group[j].label) {
            conflicts.push(
              Object.freeze({
                leftStepId: group[i].id,
                rightStepId: group[j].id,
                reason: "duplicate_label_same_type",
              }),
            );
          }
        }
      }
    }

    return Object.freeze(conflicts);
  }
}
