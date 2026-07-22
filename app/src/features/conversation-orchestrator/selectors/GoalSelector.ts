import type { CoachObjective } from "../../coach-intelligence/models/CoachObjective";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationIntent } from "../models/ConversationIntent";
import { ConversationIntents } from "../models/ConversationIntent";
import { ALL_CONVERSATION_INTENTS } from "../models/ConversationIntent";
import { freezeGoal } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortGoals } from "../utils/sortEvidence";

function mapIntent(intent: string): ConversationIntent {
  if (
    ALL_CONVERSATION_INTENTS.includes(intent as ConversationIntent)
  ) {
    return intent as ConversationIntent;
  }
  return ConversationIntents.FOCUS;
}

/**
 * Builds conversation goals from ranked coaching objectives.
 * One responsibility: goal selection only.
 */
export class GoalSelector {
  select(options: {
    readonly rankedObjectives: readonly CoachObjective[];
    readonly evidence: readonly ConversationEvidence[];
    readonly limit?: number;
  }): readonly ConversationGoal[] {
    const limit = options.limit ?? 5;
    const evidenceByObjectiveId = new Map<string, string[]>();

    for (const item of options.evidence) {
      const objectiveId = item.attributes.objectiveId;
      if (typeof objectiveId === "string") {
        const existing = evidenceByObjectiveId.get(objectiveId) ?? [];
        evidenceByObjectiveId.set(objectiveId, [...existing, item.id]);
      }
    }

    const availableEvidenceIds = new Set(
      options.evidence.map((item) => item.id),
    );

    const goals = options.rankedObjectives.slice(0, limit).map((objective) => {
      const linked =
        evidenceByObjectiveId.get(objective.id) ??
        objective.evidenceIds.map(
          (id) => `conversation-evidence:coach:${id}`,
        );
      const evidenceIds = linked.filter((id) => availableEvidenceIds.has(id));

      return freezeGoal({
        id: `conversation-goal:${objective.id}`,
        intent: mapIntent(objective.intent),
        priority: normalizePriority(objective.priority),
        title: objective.title,
        statement: objective.statement,
        reason: Object.freeze({
          code: "coaching_objective_goal",
          statement: "Derived from CoachingContext objective",
          attributes: Object.freeze({
            objectiveId: objective.id,
            intent: objective.intent,
          }),
        }),
        evidenceIds: Object.freeze([...evidenceIds]),
        objectiveIds: Object.freeze([objective.id]),
        metadata: Object.freeze({
          tags: Object.freeze(["conversation-goal", objective.intent]),
          attributes: Object.freeze({
            objectiveId: objective.id,
          }),
        }),
      });
    });

    return Object.freeze(sortGoals(goals));
  }
}

export function createGoalSelector(): GoalSelector {
  return new GoalSelector();
}
