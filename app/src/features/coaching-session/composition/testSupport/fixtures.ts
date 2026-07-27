import { createCoachTimelineService } from "../../../coach-timeline/services/CoachTimelineService";
import type { CoachTimelineService } from "../../../coach-timeline/services/CoachTimelineService";
import { createPlanHistoryService } from "../../../plan-history/services/PlanHistoryService";
import type { PlanHistoryService } from "../../../plan-history/services/PlanHistoryService";
import { createProactiveInsightsService } from "../../../proactive-insights/services/ProactiveInsightsService";
import type { ProactiveInsightsService } from "../../../proactive-insights/services/ProactiveInsightsService";
import {
  createExplainableCoachingSessionService,
  type ExplainableCoachingSessionService,
} from "../services/ExplainableCoachingSessionService";

export const FIXED_SESSION_TIMESTAMP = "2026-07-28T10:00:00.000Z";

export function createSessionClock(start = FIXED_SESSION_TIMESTAMP): {
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

export function createTestExplainableCoachingSessionService(
  overrides: {
    readonly clock?: () => string;
    readonly coachTimeline?: CoachTimelineService;
    readonly planHistory?: PlanHistoryService;
    readonly proactiveInsights?: ProactiveInsightsService;
  } = {},
): ExplainableCoachingSessionService {
  const clock = overrides.clock ?? (() => FIXED_SESSION_TIMESTAMP);
  const coachTimeline =
    overrides.coachTimeline ?? createCoachTimelineService({ clock });
  const planHistory =
    overrides.planHistory ?? createPlanHistoryService({ clock });
  const proactiveInsights =
    overrides.proactiveInsights ??
    createProactiveInsightsService({ coachTimeline, planHistory, clock });
  return createExplainableCoachingSessionService({
    coachTimeline,
    planHistory,
    proactiveInsights,
    clock,
  });
}
