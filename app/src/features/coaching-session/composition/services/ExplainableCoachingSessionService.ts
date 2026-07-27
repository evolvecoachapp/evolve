import type { CoachTimelineService } from "../../../coach-timeline/services/CoachTimelineService";
import type { PlanHistoryService } from "../../../plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../../proactive-insights/services/ProactiveInsightsService";
import type { CoachingSession } from "../models/CoachingSession";
import type { CoachingSessionConfidence } from "../models/CoachingSessionConfidence";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionInsight } from "../models/CoachingSessionInsight";
import type { CoachingSessionResult } from "../models/CoachingSessionResult";
import type { CoachingSessionSummary } from "../models/CoachingSessionSummary";
import {
  buildCoachingSession,
  type BuildCoachingSessionInput,
} from "./buildCoachingSession";
import { validateCoachingSession } from "./validateCoachingSession";

export interface ExplainableCoachingSessionServiceDeps {
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly clock?: () => string;
}

/**
 * Explainable Coaching Session composition facade (Sprint 26.1).
 * Composes existing domain services — no new reasoning engines.
 * In-memory latest-session index only (no persistence).
 */
export class ExplainableCoachingSessionService {
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly clock: () => string;
  private readonly latestByAthlete = new Map<string, CoachingSession>();

  constructor(deps: ExplainableCoachingSessionServiceDeps = {}) {
    this.coachTimeline = deps.coachTimeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  build(
    input: Omit<BuildCoachingSessionInput, "generatedAt" | "timelineEntries" | "insights" | "planHistory"> & {
      readonly generatedAt?: string;
      readonly timelineEntries?: BuildCoachingSessionInput["timelineEntries"];
      readonly insights?: BuildCoachingSessionInput["insights"];
      readonly planHistory?: BuildCoachingSessionInput["planHistory"];
      readonly planLineageId?: string | null;
      readonly goalSignals?: readonly string[];
    },
  ): CoachingSessionResult {
    const generatedAt = input.generatedAt ?? this.clock();
    const timelineEntries =
      input.timelineEntries ??
      (this.coachTimeline
        ? this.coachTimeline.getTimeline(input.athleteId)?.entries ??
          Object.freeze([])
        : Object.freeze([]));

    const insights =
      input.insights ??
      (this.proactiveInsights
        ? this.proactiveInsights.analyze({
            athleteId: input.athleteId,
            goalSignals: input.goalSignals,
          }).insights
        : Object.freeze([]));

    let planHistory = input.planHistory ?? null;
    if (!planHistory && this.planHistory && input.planLineageId) {
      planHistory = this.planHistory.getHistory(input.planLineageId);
    }

    const result = buildCoachingSession({
      ...input,
      timelineEntries,
      insights,
      planHistory,
      generatedAt,
    });

    if (result.success && result.session) {
      this.latestByAthlete.set(input.athleteId, result.session);
    }

    return result;
  }

  getLatest(athleteId: string): CoachingSession | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getSummary(athleteId: string): CoachingSessionSummary | null {
    return this.getLatest(athleteId)?.summary ?? null;
  }

  getEvidence(athleteId: string): CoachingSessionEvidence | null {
    return this.getLatest(athleteId)?.evidenceUsed ?? null;
  }

  getInsights(athleteId: string): CoachingSessionInsight | null {
    return this.getLatest(athleteId)?.insightSummary ?? null;
  }

  getConfidence(athleteId: string): CoachingSessionConfidence | null {
    return this.getLatest(athleteId)?.confidence ?? null;
  }

  validate(athleteId: string): ReturnType<typeof validateCoachingSession> {
    return validateCoachingSession(this.getLatest(athleteId));
  }

  getCoachTimeline(): CoachTimelineService | null {
    return this.coachTimeline;
  }

  getPlanHistory(): PlanHistoryService | null {
    return this.planHistory;
  }

  getProactiveInsights(): ProactiveInsightsService | null {
    return this.proactiveInsights;
  }
}

export function createExplainableCoachingSessionService(
  deps: ExplainableCoachingSessionServiceDeps = {},
): ExplainableCoachingSessionService {
  return new ExplainableCoachingSessionService(deps);
}
