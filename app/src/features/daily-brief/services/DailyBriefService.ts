import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { HomeExperienceService } from "../../home-experience/services/HomeExperienceService";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { DailyBrief } from "../models/DailyBrief";
import type { DailyBriefCoachMessage } from "../models/DailyBriefCoachMessage";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";
import type { DailyBriefNutrition } from "../models/DailyBriefNutrition";
import type { DailyBriefRecovery } from "../models/DailyBriefRecovery";
import type { DailyBriefResult } from "../models/DailyBriefResult";
import type { DailyBriefWorkout } from "../models/DailyBriefWorkout";
import {
  buildDailyBrief,
  type BuildDailyBriefInput,
} from "./buildDailyBrief";
import { validateDailyBrief } from "./validateDailyBrief";

export interface DailyBriefServiceDeps {
  readonly homeExperience?: HomeExperienceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
}

/**
 * Athlete Daily Brief composition facade (Sprint 27.2).
 * Composes existing domain services — no new reasoning engines.
 * In-memory latest-brief index only (no persistence).
 */
export class DailyBriefService {
  private readonly homeExperience: HomeExperienceService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly clock: () => string;
  private readonly latestByAthlete = new Map<string, DailyBrief>();

  constructor(deps: DailyBriefServiceDeps = {}) {
    this.homeExperience = deps.homeExperience ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  build(
    input: Omit<
      BuildDailyBriefInput,
      | "generatedAt"
      | "timelineEntries"
      | "insights"
      | "coachingSession"
      | "planHistory"
    > & {
      readonly generatedAt?: string;
      readonly timelineEntries?: BuildDailyBriefInput["timelineEntries"];
      readonly insights?: BuildDailyBriefInput["insights"];
      readonly coachingSession?: BuildDailyBriefInput["coachingSession"];
      readonly planHistory?: BuildDailyBriefInput["planHistory"];
      readonly planLineageId?: string | null;
      readonly goalSignals?: readonly string[];
    },
  ): DailyBriefResult {
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

    let coachingSession =
      input.coachingSession ??
      (this.explainableCoachingSession
        ? this.explainableCoachingSession.getLatest(input.athleteId)
        : null);

    // Prefer latest Home Experience coach card session when domain session absent
    if (!coachingSession && this.homeExperience) {
      const home = this.homeExperience.getHomeExperience(input.athleteId);
      if (home?.coach.present && home.coach.sessionId) {
        coachingSession =
          this.explainableCoachingSession?.getLatest(input.athleteId) ?? null;
      }
    }

    const result = buildDailyBrief({
      ...input,
      timelineEntries,
      insights,
      planHistory,
      coachingSession,
      generatedAt,
    });

    if (result.success && result.brief) {
      this.latestByAthlete.set(input.athleteId, result.brief);
    }

    return result;
  }

  getDailyBrief(athleteId: string): DailyBrief | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getCoachMessage(athleteId: string): DailyBriefCoachMessage | null {
    return this.getDailyBrief(athleteId)?.coachMessage ?? null;
  }

  getWorkoutSection(athleteId: string): DailyBriefWorkout | null {
    return this.getDailyBrief(athleteId)?.workout ?? null;
  }

  getNutritionSection(athleteId: string): DailyBriefNutrition | null {
    return this.getDailyBrief(athleteId)?.nutrition ?? null;
  }

  getRecoverySection(athleteId: string): DailyBriefRecovery | null {
    return this.getDailyBrief(athleteId)?.recovery ?? null;
  }

  getGoalSection(athleteId: string): DailyBriefGoals | null {
    return this.getDailyBrief(athleteId)?.goals ?? null;
  }

  getInsightSection(athleteId: string): DailyBriefInsights | null {
    return this.getDailyBrief(athleteId)?.insights ?? null;
  }

  validate(athleteId: string): ReturnType<typeof validateDailyBrief> {
    return validateDailyBrief(this.getDailyBrief(athleteId));
  }

  getHomeExperience(): HomeExperienceService | null {
    return this.homeExperience;
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

export function createDailyBriefService(
  deps: DailyBriefServiceDeps = {},
): DailyBriefService {
  return new DailyBriefService(deps);
}
