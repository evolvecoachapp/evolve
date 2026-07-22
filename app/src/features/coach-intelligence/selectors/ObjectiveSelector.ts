import type { Insight } from "../../insight-engine/models/Insight";
import { InsightSeverities } from "../../insight-engine/models/InsightSeverity";
import { InsightTypes } from "../../insight-engine/models/InsightType";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachIntent } from "../models/CoachIntent";
import { CoachIntents } from "../models/CoachIntent";
import type { CoachObjective } from "../models/CoachObjective";
import { freezeObjective } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortObjectives } from "../utils/sortEvidence";

function intentForInsight(insight: Insight): CoachIntent {
  if (insight.type === InsightTypes.ACHIEVEMENT) {
    return CoachIntents.CELEBRATE;
  }
  if (insight.type === InsightTypes.RECOVERY) {
    return insight.severity === InsightSeverities.ELEVATED ||
      insight.severity === InsightSeverities.CRITICAL
      ? CoachIntents.CAUTION
      : CoachIntents.PREPARE;
  }
  if (insight.type === InsightTypes.HISTORY) {
    return CoachIntents.INFORM;
  }
  if (insight.severity === InsightSeverities.CRITICAL) {
    return CoachIntents.CAUTION;
  }
  if (insight.severity === InsightSeverities.NOTABLE) {
    return CoachIntents.REINFORCE;
  }
  return CoachIntents.FOCUS;
}

/**
 * Builds coaching objectives from ranked insights + focus.
 * One responsibility: objective selection only.
 */
export class ObjectiveSelector {
  select(options: {
    readonly rankedInsights: readonly Insight[];
    readonly evidence: readonly CoachEvidence[];
    readonly focus: readonly CoachFocus[];
    readonly limit?: number;
  }): readonly CoachObjective[] {
    const limit = options.limit ?? 5;
    const evidenceByInsightId = new Map<string, string>();
    for (const item of options.evidence) {
      const insightId = item.attributes.insightId;
      if (typeof insightId === "string") {
        evidenceByInsightId.set(insightId, item.id);
      }
    }

    const focusIds = options.focus.map((item) => item.id);
    const objectives = options.rankedInsights.slice(0, limit).map((insight) => {
      const evidenceId = evidenceByInsightId.get(insight.id);
      return freezeObjective({
        id: `coach-objective:${insight.id}`,
        intent: intentForInsight(insight),
        priority: normalizePriority(insight.priority),
        title: insight.title,
        statement: insight.statement,
        reason: Object.freeze({
          code: "insight_objective",
          statement: "Derived from selected Insight",
          attributes: Object.freeze({
            insightId: insight.id,
            insightType: insight.type,
          }),
        }),
        evidenceIds: Object.freeze(evidenceId ? [evidenceId] : []),
        focusIds: Object.freeze([...focusIds]),
        metadata: Object.freeze({
          tags: Object.freeze([insight.type, insight.category]),
          attributes: Object.freeze({
            insightId: insight.id,
            severity: insight.severity,
          }),
        }),
      });
    });

    return Object.freeze(sortObjectives(objectives));
  }
}

export function createObjectiveSelector(): ObjectiveSelector {
  return new ObjectiveSelector();
}
