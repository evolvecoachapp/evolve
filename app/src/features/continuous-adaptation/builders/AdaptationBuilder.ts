import { AdaptationCategories, type AdaptationCategory } from "../models/AdaptationCategory";
import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationCondition } from "../models/AdaptationCondition";
import type { AdaptationConstraint } from "../models/AdaptationConstraint";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDependency } from "../models/AdaptationDependency";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationReason } from "../models/AdaptationReason";
import { AdaptationReasonCodes } from "../models/AdaptationReason";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { freezeDecision, freezeReason, freezeCondition } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationDecision(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: AdaptationCategory;
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly evaluation: AdaptationEvaluation;
  readonly dependencies?: readonly AdaptationDependency[];
  readonly constraints?: readonly AdaptationConstraint[];
  readonly sourceKeys?: readonly string[];
  readonly at: string;
}): AdaptationDecision {
  const present = input.triggers.filter((t) => t.present);
  const conditions: AdaptationCondition[] = present.map((t) =>
    freezeCondition({
      id: `cond:${t.id}`,
      key: t.signalKey,
      subjectId: t.subjectId,
      met: true,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  const reasons: AdaptationReason[] = present.map((t) =>
    freezeReason({
      id: `reason:${t.id}`,
      code: AdaptationReasonCodes.SIGNAL_PRESENT,
      subjectId: input.id,
      category: input.category,
      statementKey: `signal.${t.kind}.present`,
      signalKeys: Object.freeze([t.signalKey]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  if (present.length > 0) {
    reasons.push(
      freezeReason({
        id: `reason:priority:${input.id}`,
        code: AdaptationReasonCodes.PRIORITY_ORDERING,
        subjectId: input.id,
        category: input.category,
        statementKey: `priority.${input.evaluation.priority.label}`,
        signalKeys: input.evaluation.signalKeys,
        metadata: EMPTY_ADAPTATION_METADATA,
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
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function categoryFromSignals(signalKeys: readonly string[]): AdaptationCategory {
  if (signalKeys.some((k) => k.includes("recovery"))) return AdaptationCategories.RECOVERY;
  if (signalKeys.some((k) => k.includes("workout") || k.includes("performance")))
    return AdaptationCategories.WORKOUT;
  if (signalKeys.some((k) => k.includes("nutrition"))) return AdaptationCategories.NUTRITION;
  if (signalKeys.some((k) => k.includes("goal"))) return AdaptationCategories.GOAL;
  if (signalKeys.some((k) => k.includes("adherence"))) return AdaptationCategories.ADHERENCE;
  if (signalKeys.some((k) => k.includes("state"))) return AdaptationCategories.STATE;
  return AdaptationCategories.GENERAL;
}
