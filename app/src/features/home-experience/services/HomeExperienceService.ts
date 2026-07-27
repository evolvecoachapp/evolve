import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { HomeCoachCard } from "../models/HomeCoachCard";
import type { HomeExperience } from "../models/HomeExperience";
import type { HomeExperienceResult } from "../models/HomeExperienceResult";
import type { HomeInsightCard } from "../models/HomeInsightCard";
import type { HomeQuickAction } from "../models/HomeQuickAction";
import type { HomeSummary } from "../models/HomeSummary";
import {
  buildHomeExperience,
  type BuildHomeExperienceInput,
} from "./buildHomeExperience";
import { validateHomeExperience } from "./validateHomeExperience";

export interface HomeExperienceServiceDeps {
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
}

/**
 * Home Experience composition facade (Sprint 27.1).
 * Composes existing domain services — no new reasoning engines.
 * In-memory latest-experience index only (no persistence).
 */
export class HomeExperienceService {
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly clock: () => string;
  private readonly latestByAthlete = new Map<string, HomeExperience>();

  constructor(deps: HomeExperienceServiceDeps = {}) {
    this.coachTimeline = deps.coachTimeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  build(
    input: Omit<
      BuildHomeExperienceInput,
      | "generatedAt"
      | "timelineEntries"
      | "insights"
      | "coachingSession"
      | "planHistory"
      | "canRestorePlan"
    > & {
      readonly generatedAt?: string;
      readonly timelineEntries?: BuildHomeExperienceInput["timelineEntries"];
      readonly insights?: BuildHomeExperienceInput["insights"];
      readonly coachingSession?: BuildHomeExperienceInput["coachingSession"];
      readonly planHistory?: BuildHomeExperienceInput["planHistory"];
      readonly planLineageId?: string | null;
      readonly canRestorePlan?: boolean;
      readonly goalSignals?: readonly string[];
    },
  ): HomeExperienceResult {
    const generatedAt = input.generatedAt ?? this.clock();

    const timelineEntries =
      input.timelineEntries ??
      (this.coachTimeline
        ? (this.coachTimeline.getTimeline(input.athleteId)?.entries ??
          Object.freeze([]))
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

    const coachingSession =
      input.coachingSession ??
      (this.explainableCoachingSession
        ? this.explainableCoachingSession.getLatest(input.athleteId)
        : null);

    const canRestorePlan =
      input.canRestorePlan === true ||
      (planHistory !== null && planHistory.currentVersionNumber > 1);

    const result = buildHomeExperience({
      ...input,
      timelineEntries,
      insights,
      planHistory,
      coachingSession,
      canRestorePlan,
      generatedAt,
    });

    if (result.success && result.experience) {
      this.latestByAthlete.set(input.athleteId, result.experience);
    }

    return result;
  }

  getHomeExperience(athleteId: string): HomeExperience | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getHomeSummary(athleteId: string): HomeSummary | null {
    return this.getHomeExperience(athleteId)?.summary ?? null;
  }

  getQuickActions(athleteId: string): readonly HomeQuickAction[] {
    return (
      this.getHomeExperience(athleteId)?.quickActions ?? Object.freeze([])
    );
  }

  getCoachCard(athleteId: string): HomeCoachCard | null {
    return this.getHomeExperience(athleteId)?.coach ?? null;
  }

  getInsightCards(athleteId: string): readonly HomeInsightCard[] {
    return this.getHomeExperience(athleteId)?.insights ?? Object.freeze([]);
  }

  validate(athleteId: string): ReturnType<typeof validateHomeExperience> {
    return validateHomeExperience(this.getHomeExperience(athleteId));
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

  getExplainableCoachingSession(): ExplainableCoachingSessionService | null {
    return this.explainableCoachingSession;
  }
}

export function createHomeExperienceService(
  deps: HomeExperienceServiceDeps = {},
): HomeExperienceService {
  return new HomeExperienceService(deps);
}
