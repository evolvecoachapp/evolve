import type { Insight } from "../../insight-engine/models/Insight";
import { normalizePriority } from "../utils/normalizePriorities";

export interface PrioritySelection {
  readonly rankedInsightIds: readonly string[];
  readonly prioritiesByInsightId: Readonly<Record<string, number>>;
}

/**
 * Ranks selected insights by priority.
 * One responsibility: priority ranking only.
 */
export class PrioritySelector {
  select(insights: readonly Insight[]): PrioritySelection {
    const ranked = [...insights].sort((a, b) => {
      const priorityDiff =
        normalizePriority(b.priority) - normalizePriority(a.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.id.localeCompare(b.id);
    });

    const prioritiesByInsightId: Record<string, number> = {};
    for (const insight of ranked) {
      prioritiesByInsightId[insight.id] = normalizePriority(insight.priority);
    }

    return Object.freeze({
      rankedInsightIds: Object.freeze(ranked.map((insight) => insight.id)),
      prioritiesByInsightId: Object.freeze(prioritiesByInsightId),
    });
  }
}

export function createPrioritySelector(): PrioritySelector {
  return new PrioritySelector();
}
