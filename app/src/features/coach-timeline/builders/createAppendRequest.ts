import type { CoachDecisionReason } from "../models/CoachDecisionReason";
import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimelineDomain } from "../models/CoachTimelineEntry";
import type { CoachTimelineEventCategory } from "../models/CoachTimelineEvent";

export function createDecisionReason(input: {
  readonly reason: string;
  readonly impact: string;
  readonly expectedOutcome: string;
  readonly decisionId?: string | null;
  readonly recommendationId?: string | null;
  readonly evidenceKeys?: readonly string[];
}): CoachDecisionReason {
  return Object.freeze({
    decisionId: input.decisionId ?? null,
    recommendationId: input.recommendationId ?? null,
    reason: input.reason,
    impact: input.impact,
    expectedOutcome: input.expectedOutcome,
    evidenceKeys: Object.freeze([...(input.evidenceKeys ?? [])]),
  });
}

export function createAppendRequest(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly category: CoachTimelineEventCategory;
  readonly summary: string;
  readonly explanation: string;
  readonly reason: string;
  readonly impact: string;
  readonly expectedOutcome: string;
  readonly affectedDomain: CoachTimelineDomain;
  readonly createdAt: string;
  readonly decisionId?: string | null;
  readonly recommendationId?: string | null;
  readonly evidenceKeys?: readonly string[];
  readonly relatedPlanVersion?: number | null;
  readonly relatedPlanLineageId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly confidence?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}): AppendTimelineEntryRequest {
  return Object.freeze({
    id: input.id,
    athleteId: input.athleteId,
    category: input.category,
    summary: input.summary,
    explanation: input.explanation,
    decisionReason: createDecisionReason({
      reason: input.reason,
      impact: input.impact,
      expectedOutcome: input.expectedOutcome,
      decisionId: input.decisionId,
      recommendationId: input.recommendationId,
      evidenceKeys: input.evidenceKeys,
    }),
    affectedDomain: input.affectedDomain,
    relatedPlanVersion: input.relatedPlanVersion ?? null,
    relatedPlanLineageId: input.relatedPlanLineageId ?? null,
    conversationId: input.conversationId ?? null,
    sessionId: input.sessionId ?? null,
    confidence: input.confidence ?? 1,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: input.createdAt,
  });
}
