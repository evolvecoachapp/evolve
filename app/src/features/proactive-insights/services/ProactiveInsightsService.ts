import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { CoachInsight } from "../models/CoachInsight";
import type { CoachInsightSnapshot } from "../models/CoachInsightSnapshot";
import {
  CoachInsightSeverities,
} from "../models/CoachInsightSeverity";
import {
  CoachInsightSummaryKinds,
  type CoachInsightSummaryKind,
} from "../models/CoachInsightSummary";
import type { InsightAnalysisResult } from "../models/InsightAnalysisResult";
import type { InsightFilter } from "../models/InsightFilter";
import type { InsightQuery } from "../models/InsightQuery";
import { analyzeGoalProgress } from "./analyzeGoalProgress";
import { analyzeNutritionPatterns } from "./analyzeNutritionPatterns";
import { analyzeRecoveryPatterns } from "./analyzeRecoveryPatterns";
import { analyzeTimeline } from "./analyzeTimeline";
import { analyzeWorkoutPatterns } from "./analyzeWorkoutPatterns";
import { buildCoachInsights } from "./buildCoachInsights";
import { buildInsightSummary } from "./buildInsightSummary";
import { filterInsights } from "./filterInsights";
import { prioritizeInsights } from "./prioritizeInsights";
import {
  assertInsightImmutable,
  validateInsights,
  type InsightValidation,
} from "./validateInsights";

export interface ProactiveInsightsServiceDeps {
  readonly coachTimeline: CoachTimelineService;
  readonly planHistory?: PlanHistoryService | null;
  readonly clock?: () => string;
}

/**
 * Proactive Coach Insights service — deterministic analysis over existing domain data.
 * No LLM. No persistence. No event bus. No scheduler.
 */
export class ProactiveInsightsService {
  private readonly coachTimeline: CoachTimelineService;
  private readonly planHistory: PlanHistoryService | null;
  private readonly clock: () => string;

  constructor(deps: ProactiveInsightsServiceDeps) {
    this.coachTimeline = deps.coachTimeline;
    this.planHistory = deps.planHistory ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getTimeline(): CoachTimelineService {
    return this.coachTimeline;
  }

  getPlanHistory(): PlanHistoryService | null {
    return this.planHistory;
  }

  analyze(input: {
    readonly athleteId: string;
    readonly goalSignals?: readonly string[];
  }): InsightAnalysisResult {
    const at = this.clock();
    const entries = this.loadEntries(input.athleteId);
    const signals = Object.freeze([
      ...analyzeTimeline(entries),
      ...analyzeGoalProgress(entries, input.goalSignals ?? Object.freeze([])),
      ...analyzeWorkoutPatterns(entries),
      ...analyzeNutritionPatterns(entries),
      ...analyzeRecoveryPatterns(entries),
      ...this.analyzePlanHistorySignals(input.athleteId, entries),
    ]);

    const insights = prioritizeInsights(
      buildCoachInsights({
        athleteId: input.athleteId,
        signals,
        generatedAt: at,
      }),
    );

    const summary = buildInsightSummary({
      insights,
      kind: CoachInsightSummaryKinds.ALL,
      generatedAt: at,
    });

    const snapshot: CoachInsightSnapshot = Object.freeze({
      id: `insight-snap:${input.athleteId}:${at}`,
      athleteId: input.athleteId,
      insights,
      summary,
      capturedAt: at,
      insightCount: insights.length,
    });

    return Object.freeze({
      query: null,
      insights,
      snapshot,
      summary,
      matchedCount: insights.length,
      success: true,
      message:
        insights.length > 0
          ? `Generated ${insights.length} proactive insight(s).`
          : "No proactive insights matched available evidence.",
      generatedAt: at,
    });
  }

  query(query: InsightQuery): InsightAnalysisResult {
    const analysis = this.analyze({ athleteId: query.athleteId });
    let insights = filterInsights(analysis.insights, query.filter);

    if (query.order === "priority") {
      insights = prioritizeInsights(insights);
    } else {
      const sorted = [...insights].sort((a, b) => {
        if (a.timestamp === b.timestamp) return a.id.localeCompare(b.id);
        return query.order === "asc"
          ? a.timestamp < b.timestamp
            ? -1
            : 1
          : a.timestamp < b.timestamp
            ? 1
            : -1;
      });
      insights = Object.freeze(sorted);
    }

    if (query.limit != null && query.limit >= 0) {
      insights = Object.freeze(insights.slice(0, query.limit));
    }

    const at = this.clock();
    const summaryKind = query.summaryKind ?? CoachInsightSummaryKinds.ALL;
    const summary = buildInsightSummary({
      insights,
      kind: summaryKind,
      generatedAt: at,
    });

    return Object.freeze({
      query: Object.freeze({ ...query }),
      insights,
      snapshot: analysis.snapshot,
      summary,
      matchedCount: insights.length,
      success: true,
      message:
        insights.length > 0
          ? `Matched ${insights.length} insight(s).`
          : "No insights matched the query; nothing will be invented.",
      generatedAt: at,
    });
  }

  getTopInsights(athleteId: string, limit = 5): readonly CoachInsight[] {
    return this.query(
      Object.freeze({
        athleteId,
        filter: null,
        order: "priority" as const,
        limit,
        summaryKind: CoachInsightSummaryKinds.TOP,
      }),
    ).insights;
  }

  getLatestInsights(athleteId: string, limit = 5): readonly CoachInsight[] {
    return this.query(
      Object.freeze({
        athleteId,
        filter: null,
        order: "desc" as const,
        limit,
        summaryKind: CoachInsightSummaryKinds.LATEST,
      }),
    ).insights;
  }

  getCriticalInsights(athleteId: string): readonly CoachInsight[] {
    return this.query(
      Object.freeze({
        athleteId,
        filter: Object.freeze({
          severities: Object.freeze([
            CoachInsightSeverities.CRITICAL,
            CoachInsightSeverities.HIGH,
          ]),
        }),
        order: "priority" as const,
        limit: null,
        summaryKind: CoachInsightSummaryKinds.CRITICAL,
      }),
    ).insights;
  }

  getRecoveryInsights(athleteId: string): readonly CoachInsight[] {
    return this.domainInsights(athleteId, "recovery", CoachInsightSummaryKinds.RECOVERY);
  }

  getGoalInsights(athleteId: string): readonly CoachInsight[] {
    return this.domainInsights(athleteId, "goal", CoachInsightSummaryKinds.GOAL);
  }

  getWorkoutInsights(athleteId: string): readonly CoachInsight[] {
    return this.domainInsights(athleteId, "workout", CoachInsightSummaryKinds.WORKOUT);
  }

  getNutritionInsights(athleteId: string): readonly CoachInsight[] {
    return this.domainInsights(
      athleteId,
      "nutrition",
      CoachInsightSummaryKinds.NUTRITION,
    );
  }

  filter(athleteId: string, filter: InsightFilter): readonly CoachInsight[] {
    return filterInsights(this.analyze({ athleteId }).insights, filter);
  }

  prioritize(athleteId: string): readonly CoachInsight[] {
    return prioritizeInsights(this.analyze({ athleteId }).insights);
  }

  validate(athleteId: string): InsightValidation {
    return validateInsights(this.analyze({ athleteId }).insights);
  }

  createSnapshot(athleteId: string): CoachInsightSnapshot {
    const result = this.analyze({ athleteId });
    return result.snapshot!;
  }

  isImmutable(insight: CoachInsight): boolean {
    return assertInsightImmutable(insight);
  }

  now(): string {
    return this.clock();
  }

  private domainInsights(
    athleteId: string,
    domain: "workout" | "nutrition" | "recovery" | "goal",
    summaryKind: CoachInsightSummaryKind,
  ): readonly CoachInsight[] {
    return this.query(
      Object.freeze({
        athleteId,
        filter: Object.freeze({
          domains: Object.freeze([domain]),
        }),
        order: "priority" as const,
        limit: null,
        summaryKind,
      }),
    ).insights;
  }

  private loadEntries(athleteId: string): readonly CoachTimelineEntry[] {
    return this.coachTimeline.getTimeline(athleteId)?.entries ?? Object.freeze([]);
  }

  private analyzePlanHistorySignals(
    athleteId: string,
    entries: readonly CoachTimelineEntry[],
  ) {
    // Plan History integration: restore/modification churn already surfaced via timeline.
    // When plan history is wired, extra restore counts reinforce RESTORE_PATTERN only if
    // timeline evidence already exists — never invent from empty history alone.
    if (!this.planHistory || entries.length === 0) {
      return Object.freeze([]);
    }
    void athleteId;
    return Object.freeze([]);
  }
}

export function createProactiveInsightsService(
  deps: ProactiveInsightsServiceDeps,
): ProactiveInsightsService {
  return new ProactiveInsightsService(deps);
}
