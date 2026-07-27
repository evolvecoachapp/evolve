import { createCoachTimelineService } from "../services/CoachTimelineService";
import { createAppendRequest } from "../builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";

export const FIXED_TIMELINE_TIMESTAMP = "2026-07-27T12:00:00.000Z";

export function createTimelineClock(start = FIXED_TIMELINE_TIMESTAMP): {
  readonly now: () => string;
  readonly advance: (ms: number) => void;
} {
  let current = Date.parse(start);
  return {
    now: () => new Date(current).toISOString(),
    advance: (ms: number) => {
      current += ms;
    },
  };
}

export function createTestCoachTimelineService(
  overrides: { readonly clock?: () => string } = {},
) {
  return createCoachTimelineService({
    clock: overrides.clock ?? (() => FIXED_TIMELINE_TIMESTAMP),
  });
}

export function createTimelineEntryRequest(
  overrides: Partial<AppendTimelineEntryRequest> & {
    readonly id: string;
    readonly athleteId?: string;
  },
): AppendTimelineEntryRequest {
  return createAppendRequest({
    id: overrides.id,
    athleteId: overrides.athleteId ?? "athlete:1",
    category: overrides.category ?? CoachTimelineEventCategories.COACH_DECISION,
    summary: overrides.summary ?? "Coach decision recorded",
    explanation: overrides.explanation ?? "Deterministic decision explanation",
    reason: overrides.decisionReason?.reason ?? "Because readiness required it",
    impact: overrides.decisionReason?.impact ?? "Training load adjusted",
    expectedOutcome:
      overrides.decisionReason?.expectedOutcome ?? "Safer next session",
    affectedDomain: overrides.affectedDomain ?? "decision",
    relatedPlanVersion: overrides.relatedPlanVersion ?? null,
    relatedPlanLineageId: overrides.relatedPlanLineageId ?? null,
    conversationId: overrides.conversationId ?? "conversation:1",
    sessionId: overrides.sessionId ?? "session:1",
    confidence: overrides.confidence ?? 1,
    metadata: overrides.metadata ?? Object.freeze({}),
    createdAt: overrides.createdAt ?? FIXED_TIMELINE_TIMESTAMP,
    decisionId: overrides.decisionReason?.decisionId ?? "decision:1",
    recommendationId: overrides.decisionReason?.recommendationId ?? null,
    evidenceKeys: overrides.decisionReason?.evidenceKeys ?? Object.freeze([]),
  });
}
