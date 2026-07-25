import { GoalCategories, type GoalCategory } from "../models/GoalCategory";
import type { GoalCheckpoint } from "../models/GoalCheckpoint";
import type { GoalDeviation } from "../models/GoalDeviation";
import type { GoalConstraint } from "../models/GoalConstraint";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalDependency } from "../models/GoalDependency";
import type { GoalEvaluation } from "../models/GoalEvaluation";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalMilestone } from "../models/GoalMilestone";
import type { GoalConfidence } from "../models/GoalConfidence";
import { GoalConfidenceCodes } from "../models/GoalConfidence";
import type { GoalAchievement } from "../models/GoalAchievement";
import { freezeDecision, freezeReason, freezeCondition } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

export function buildGoalProgress(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: GoalCategory;
  readonly triggers: readonly GoalAchievement[];
  readonly candidates: readonly GoalCheckpoint[];
  readonly opportunities: readonly GoalMilestone[];
  readonly evaluation: GoalEvaluation;
  readonly dependencies?: readonly GoalDependency[];
  readonly constraints?: readonly GoalConstraint[];
  readonly sourceKeys?: readonly string[];
  readonly at: string;
}): GoalProgress {
  const present = input.triggers.filter((t) => t.present);
  const conditions: GoalDeviation[] = present.map((t) =>
    freezeCondition({
      id: `cond:${t.id}`,
      key: t.signalKey,
      subjectId: t.subjectId,
      met: true,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_GOAL_METADATA,
    }),
  );
  const reasons: GoalConfidence[] = present.map((t) =>
    freezeReason({
      id: `reason:${t.id}`,
      code: GoalConfidenceCodes.SIGNAL_PRESENT,
      subjectId: input.id,
      category: input.category,
      statementKey: `signal.${t.kind}.present`,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_GOAL_METADATA,
    }),
  );
  if (present.length > 0) {
    reasons.push(
      freezeReason({
        id: `reason:priority:${input.id}`,
        code: GoalConfidenceCodes.PRIORITY_ORDERING,
        subjectId: input.id,
        category: input.category,
        statementKey: `priority.${input.evaluation.priority.label}`,
        signalKeys: input.evaluation.signalKeys,
        metadata: EMPTY_GOAL_METADATA,
      }),
    );
  }
  const signalKeys = uniqueSorted([
    ...present.map((t) => t.signalKey),
    ...input.evaluation.signalKeys,
  ]);
  return freezeDecision({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    category: input.category,
    triggers: input.triggers,
    conditions: Object.freeze(conditions),
    candidates: input.candidates,
    opportunities: input.opportunities,
    reasons: Object.freeze(reasons),
    evaluation: input.evaluation,
    priority: input.evaluation.priority,
    severity: input.evaluation.severity,
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    constraints: Object.freeze([...(input.constraints ?? [])]),
    signalKeys,
    sourceKeys: Object.freeze([...(input.sourceKeys ?? [])]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}

export function categoryFromSignals(signalKeys: readonly string[]): GoalCategory {
  if (signalKeys.some((k) => k.includes("recovery"))) return GoalCategories.RECOVERY;
  if (signalKeys.some((k) => k.includes("workout") || k.includes("performance")))
    return GoalCategories.WORKOUT;
  if (signalKeys.some((k) => k.includes("nutrition"))) return GoalCategories.NUTRITION;
  if (signalKeys.some((k) => k.includes("goal"))) return GoalCategories.GOAL;
  if (signalKeys.some((k) => k.includes("adherence"))) return GoalCategories.ADHERENCE;
  if (signalKeys.some((k) => k.includes("state"))) return GoalCategories.STATE;
  return GoalCategories.GENERAL;
}
