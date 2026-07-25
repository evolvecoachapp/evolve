import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionPlan } from "../models/DecisionPlan";
import { DecisionStepStatuses } from "../models/DecisionStep";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezePlan } from "../utils/FreezeDecisionState";
import { sortDecisionsByPriority } from "../utils/DecisionHelpers";

/**
 * Decision planner — ordered steps only, no execution.
 */
export function planDecisions(input: {
  readonly planId: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly at: string;
}): DecisionPlan {
  const ordered = sortDecisionsByPriority(input.decisions);
  const steps = ordered.map((decision, index) =>
    Object.freeze({
      id: `step:${decision.id}`,
      decisionId: decision.id,
      order: index,
      category: decision.category,
      intent: decision.intent,
      status: DecisionStepStatuses.PLANNED,
      dependsOn: Object.freeze(
        index === 0 ? [] : [ordered[index - 1]!.id],
      ) as readonly string[],
      metadata: EMPTY_DECISION_METADATA,
    }),
  );
  return freezePlan({
    id: input.planId,
    athleteId: input.athleteId,
    contextId: input.contextId,
    steps: Object.freeze(steps),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
