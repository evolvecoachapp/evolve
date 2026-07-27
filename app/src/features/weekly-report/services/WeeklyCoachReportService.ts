import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBriefService } from "../../daily-brief/services/DailyBriefService";
import type { HomeExperienceService } from "../../home-experience/services/HomeExperienceService";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { WeeklyCoachReport } from "../models/WeeklyCoachReport";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";
import type { WeeklyExecutiveSummary } from "../models/WeeklyExecutiveSummary";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";
import type { WeeklyReportResult } from "../models/WeeklyReportResult";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";
import {
  buildWeeklyCoachReport,
  type BuildWeeklyCoachReportInput,
} from "./buildWeeklyCoachReport";
import { validateWeeklyCoachReport } from "./validateWeeklyCoachReport";

export interface WeeklyCoachReportServiceDeps {
  readonly dailyBrief?: DailyBriefService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
}

/**
 * Weekly Coach Report composition facade (Sprint 27.3).
 * Composes existing domain services — no new reasoning engines.
 * In-memory latest-report index only (no persistence).
 */
export class WeeklyCoachReportService {
  private readonly dailyBrief: DailyBriefService | null;
  private readonly homeExperience: HomeExperienceService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly clock: () => string;
  private readonly latestByAthlete = new Map<string, WeeklyCoachReport>();

  constructor(deps: WeeklyCoachReportServiceDeps = {}) {
    this.dailyBrief = deps.dailyBrief ?? null;
    this.homeExperience = deps.homeExperience ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  build(
    input: Omit<
      BuildWeeklyCoachReportInput,
      | "generatedAt"
      | "timelineEntries"
      | "insights"
      | "coachingSession"
      | "planHistory"
      | "dailyBrief"
      | "homeExperience"
    > & {
      readonly generatedAt?: string;
      readonly timelineEntries?: BuildWeeklyCoachReportInput["timelineEntries"];
      readonly insights?: BuildWeeklyCoachReportInput["insights"];
      readonly coachingSession?: BuildWeeklyCoachReportInput["coachingSession"];
      readonly planHistory?: BuildWeeklyCoachReportInput["planHistory"];
      readonly dailyBrief?: BuildWeeklyCoachReportInput["dailyBrief"];
      readonly homeExperience?: BuildWeeklyCoachReportInput["homeExperience"];
      readonly planLineageId?: string | null;
      readonly goalSignals?: readonly string[];
    },
  ): WeeklyReportResult {
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

    const dailyBrief =
      input.dailyBrief ??
      (this.dailyBrief
        ? this.dailyBrief.getDailyBrief(input.athleteId)
        : null);

    const homeExperience =
      input.homeExperience ??
      (this.homeExperience
        ? this.homeExperience.getHomeExperience(input.athleteId)
        : null);

    const result = buildWeeklyCoachReport({
      ...input,
      timelineEntries,
      insights,
      planHistory,
      coachingSession,
      dailyBrief,
      homeExperience,
      generatedAt,
    });

    if (result.success && result.report) {
      this.latestByAthlete.set(input.athleteId, result.report);
    }

    return result;
  }

  getWeeklyCoachReport(athleteId: string): WeeklyCoachReport | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getExecutiveSummary(athleteId: string): WeeklyExecutiveSummary | null {
    return this.getWeeklyCoachReport(athleteId)?.executiveSummary ?? null;
  }

  getWorkoutReport(athleteId: string): WeeklyWorkoutReport | null {
    return this.getWeeklyCoachReport(athleteId)?.workout ?? null;
  }

  getNutritionReport(athleteId: string): WeeklyNutritionReport | null {
    return this.getWeeklyCoachReport(athleteId)?.nutrition ?? null;
  }

  getRecoveryReport(athleteId: string): WeeklyRecoveryReport | null {
    return this.getWeeklyCoachReport(athleteId)?.recovery ?? null;
  }

  getGoalReport(athleteId: string): WeeklyGoalReport | null {
    return this.getWeeklyCoachReport(athleteId)?.goals ?? null;
  }

  getDecisionReport(athleteId: string): WeeklyDecisionReport | null {
    return this.getWeeklyCoachReport(athleteId)?.decisions ?? null;
  }

  getRecommendationReport(
    athleteId: string,
  ): WeeklyRecommendationReport | null {
    return this.getWeeklyCoachReport(athleteId)?.recommendations ?? null;
  }

  validate(athleteId: string): ReturnType<typeof validateWeeklyCoachReport> {
    return validateWeeklyCoachReport(this.getWeeklyCoachReport(athleteId));
  }

  getDailyBrief(): DailyBriefService | null {
    return this.dailyBrief;
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

export function createWeeklyCoachReportService(
  deps: WeeklyCoachReportServiceDeps = {},
): WeeklyCoachReportService {
  return new WeeklyCoachReportService(deps);
}
