import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type {
  WeeklyEvidence,
  WeeklyEvidenceItem,
  WeeklyEvidenceSource,
} from "../models/WeeklyEvidence";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";
import type { WeeklyInsightReport } from "../models/WeeklyInsightReport";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";

export interface BuildEvidenceInput {
  readonly reportId: string;
  readonly dailyBrief?: DailyBrief | null;
  readonly coachingSession?: CoachingSession | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly planHistory?: PlanHistory | null;
  readonly workout: WeeklyWorkoutReport;
  readonly nutrition: WeeklyNutritionReport;
  readonly recovery: WeeklyRecoveryReport;
  readonly goals: WeeklyGoalReport;
  readonly insights: WeeklyInsightReport;
  readonly decisions: WeeklyDecisionReport;
  readonly recommendations: WeeklyRecommendationReport;
}

/**
 * Collect evidence references used by the Weekly Coach Report.
 * Never generate evidence — only project existing references.
 */
export function buildEvidence(input: BuildEvidenceInput): WeeklyEvidence {
  const items: WeeklyEvidenceItem[] = [];
  const sources = new Set<WeeklyEvidenceSource>();
  const timelineEntryIds: string[] = [];
  const planVersionNumbers: number[] = [];
  const decisionIds: string[] = [];
  const recommendationIds: string[] = [];
  const insightIds: string[] = [];
  const keys: string[] = [];

  const push = (
    source: WeeklyEvidenceSource,
    key: string,
    summary: string,
    referenceId: string | null = null,
  ): void => {
    sources.add(source);
    keys.push(key);
    items.push(
      Object.freeze({
        id: `weekly-evidence:${input.reportId}:${items.length + 1}`,
        source,
        key,
        summary,
        referenceId,
      }),
    );
  };

  if (input.dailyBrief) {
    push(
      "daily_brief",
      `daily_brief:${input.dailyBrief.id}`,
      input.dailyBrief.summary.headline,
      input.dailyBrief.id,
    );
  }

  if (input.coachingSession) {
    push(
      "coaching_session",
      `coaching_session:${input.coachingSession.id}`,
      input.coachingSession.summary.headline,
      input.coachingSession.id,
    );
    for (const item of input.coachingSession.evidenceUsed.items) {
      const mapped = mapSessionSource(item.source);
      if (mapped) {
        push(mapped, item.key, item.summary, item.referenceId);
      }
    }
    for (const id of input.coachingSession.evidenceUsed.timelineEntryIds) {
      timelineEntryIds.push(id);
    }
    for (const n of input.coachingSession.evidenceUsed.planVersionNumbers) {
      planVersionNumbers.push(n);
    }
    for (const id of input.coachingSession.evidenceUsed.decisionIds) {
      decisionIds.push(id);
    }
    for (const id of input.coachingSession.evidenceUsed.recommendationIds) {
      recommendationIds.push(id);
    }
    for (const id of input.coachingSession.evidenceUsed.insightIds) {
      insightIds.push(id);
    }
  }

  const entries = input.timelineEntries ?? Object.freeze([]);
  for (const entry of entries) {
    timelineEntryIds.push(entry.id);
    push(
      "coach_timeline",
      `timeline:${entry.id}`,
      entry.summary,
      entry.id,
    );
  }

  if (input.planHistory) {
    planVersionNumbers.push(input.planHistory.currentVersionNumber);
    push(
      "plan_history",
      `plan_history:${input.planHistory.lineageId}`,
      `Plan version ${input.planHistory.currentVersionNumber}`,
      input.planHistory.lineageId,
    );
  }

  if (input.workout.present) {
    push(
      "workout_plan",
      `workout:${input.workout.planId ?? "present"}`,
      input.workout.summary,
      input.workout.planId,
    );
  }
  if (input.nutrition.present) {
    push(
      "nutrition_plan",
      `nutrition:${input.nutrition.planId ?? "present"}`,
      input.nutrition.summary,
      input.nutrition.planId,
    );
  }
  if (input.recovery.present) {
    push("recovery_state", "recovery:present", input.recovery.summary, null);
  }
  if (input.goals.present) {
    push(
      "goal_progress",
      `goal:${input.goals.goalId ?? "present"}`,
      input.goals.summary,
      input.goals.goalId,
    );
  }
  for (const insight of input.insights.items) {
    insightIds.push(insight.id);
    push(
      "proactive_insights",
      `insight:${insight.id}`,
      insight.summary,
      insight.id,
    );
  }
  for (const decision of input.decisions.items) {
    decisionIds.push(decision.id);
    push(
      "decision_engine",
      `decision:${decision.id}`,
      decision.summary,
      decision.id,
    );
  }
  for (const id of input.recommendations.recommendationIds) {
    recommendationIds.push(id);
    push(
      "recommendation_engine",
      `recommendation:${id}`,
      input.recommendations.recommendationSummary ?? id,
      id,
    );
  }

  if (items.length === 0) {
    return Object.freeze({
      present: false,
      items: Object.freeze([]),
      sources: Object.freeze([]),
      timelineEntryIds: Object.freeze([]),
      planVersionNumbers: Object.freeze([]),
      decisionIds: Object.freeze([]),
      recommendationIds: Object.freeze([]),
      insightIds: Object.freeze([]),
      dailyBriefId: null,
      coachingSessionId: null,
      keys: Object.freeze([]),
      summary: "No evidence references.",
    });
  }

  return Object.freeze({
    present: true,
    items: Object.freeze(items),
    sources: Object.freeze([...sources]),
    timelineEntryIds: Object.freeze([...new Set(timelineEntryIds)]),
    planVersionNumbers: Object.freeze([...new Set(planVersionNumbers)]),
    decisionIds: Object.freeze([...new Set(decisionIds)]),
    recommendationIds: Object.freeze([...new Set(recommendationIds)]),
    insightIds: Object.freeze([...new Set(insightIds)]),
    dailyBriefId: input.dailyBrief?.id ?? null,
    coachingSessionId: input.coachingSession?.id ?? null,
    keys: Object.freeze([...new Set(keys)]),
    summary: `${items.length} evidence reference(s) across ${sources.size} source(s).`,
  });
}

function mapSessionSource(
  source: string,
): WeeklyEvidenceSource | null {
  switch (source) {
    case "coach_timeline":
      return "coach_timeline";
    case "plan_history":
      return "plan_history";
    case "workout_plan":
      return "workout_plan";
    case "nutrition_plan":
      return "nutrition_plan";
    case "goal_progress":
      return "goal_progress";
    case "recovery_state":
      return "recovery_state";
    case "decision_engine":
      return "decision_engine";
    case "recommendation_engine":
      return "recommendation_engine";
    case "proactive_insights":
      return "proactive_insights";
    default:
      return null;
  }
}
