import { createCoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import {
  createAppendRequest,
} from "../../coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../../coach-timeline/models/AppendTimelineEntryRequest";
import {
  createProactiveInsightsService,
  type ProactiveInsightsService,
} from "../services/ProactiveInsightsService";

export const FIXED_INSIGHT_TIMESTAMP = "2026-07-27T15:00:00.000Z";

export function createInsightClock(start = FIXED_INSIGHT_TIMESTAMP): {
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

export function createTestProactiveInsightsService(
  overrides: {
    readonly clock?: () => string;
    readonly coachTimeline?: CoachTimelineService;
  } = {},
): ProactiveInsightsService {
  const clock = overrides.clock ?? (() => FIXED_INSIGHT_TIMESTAMP);
  const coachTimeline =
    overrides.coachTimeline ?? createCoachTimelineService({ clock });
  return createProactiveInsightsService({ coachTimeline, clock });
}

export function appendSeedEntry(
  timeline: CoachTimelineService,
  overrides: Partial<AppendTimelineEntryRequest> & {
    readonly id: string;
    readonly category?: AppendTimelineEntryRequest["category"];
    readonly summary?: string;
    readonly explanation?: string;
    readonly reason?: string;
    readonly impact?: string;
    readonly expectedOutcome?: string;
    readonly affectedDomain?: AppendTimelineEntryRequest["affectedDomain"];
    readonly athleteId?: string;
    readonly createdAt?: string;
  },
) {
  const request = createAppendRequest({
    id: overrides.id,
    athleteId: overrides.athleteId ?? "athlete:1",
    category:
      overrides.category ?? CoachTimelineEventCategories.COACH_DECISION,
    summary: overrides.summary ?? "Seed timeline entry",
    explanation: overrides.explanation ?? "Deterministic seed explanation",
    reason: overrides.reason ?? "Seed reason",
    impact: overrides.impact ?? "Seed impact",
    expectedOutcome: overrides.expectedOutcome ?? "Seed expected outcome",
    affectedDomain: overrides.affectedDomain ?? "decision",
    relatedPlanVersion: null,
    relatedPlanLineageId: null,
    conversationId: "conversation:1",
    sessionId: "session:1",
    confidence: 1,
    metadata: Object.freeze({}),
    createdAt: overrides.createdAt ?? FIXED_INSIGHT_TIMESTAMP,
    decisionId: "decision:seed",
    recommendationId: null,
    evidenceKeys: Object.freeze(["seed"]),
  });
  return timeline.appendEntry(request);
}
