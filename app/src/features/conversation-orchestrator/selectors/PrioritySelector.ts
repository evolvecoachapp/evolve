import type { CoachObjective } from "../../coach-intelligence/models/CoachObjective";
import { normalizePriority } from "../utils/normalizePriorities";

export interface PrioritySelection {
  readonly rankedObjectiveIds: readonly string[];
  readonly prioritiesByObjectiveId: Readonly<Record<string, number>>;
}

/**
 * Ranks coaching objectives by priority for conversation goals.
 * One responsibility: priority ranking only.
 */
export class PrioritySelector {
  select(objectives: readonly CoachObjective[]): PrioritySelection {
    const ranked = [...objectives].sort((a, b) => {
      const priorityDiff =
        normalizePriority(b.priority) - normalizePriority(a.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.id.localeCompare(b.id);
    });

    const prioritiesByObjectiveId: Record<string, number> = {};
    for (const objective of ranked) {
      prioritiesByObjectiveId[objective.id] = normalizePriority(
        objective.priority,
      );
    }

    return Object.freeze({
      rankedObjectiveIds: Object.freeze(ranked.map((objective) => objective.id)),
      prioritiesByObjectiveId: Object.freeze(prioritiesByObjectiveId),
    });
  }
}

export function createPrioritySelector(): PrioritySelector {
  return new PrioritySelector();
}
