import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { WeeklyCoachReport } from "../models/WeeklyCoachReport";
import type { WeeklyReportResult } from "../models/WeeklyReportResult";
import { buildDecisionReport } from "./buildDecisionReport";
import { buildEvidence } from "./buildEvidence";
import {
  buildExecutiveSummary,
  deriveRelatedDomains,
} from "./buildExecutiveSummary";
import { buildGoalReport } from "./buildGoalReport";
import { buildInsightReport } from "./buildInsightReport";
import { buildNutritionReport } from "./buildNutritionReport";
import { buildRecommendationReport } from "./buildRecommendationReport";
import { buildRecoveryReport } from "./buildRecoveryReport";
import { buildWorkoutReport } from "./buildWorkoutReport";
import { calculateWeeklyConfidence } from "./calculateWeeklyConfidence";
import { validateWeeklyCoachReport } from "./validateWeeklyCoachReport";

export interface BuildWeeklyCoachReportInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly generatedAt: string;
  readonly weekStart?: string;
  readonly weekEnd?: string;
  readonly dailyBrief?: DailyBrief | null;
  readonly homeExperience?: HomeExperience | null;
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly planHistory?: PlanHistory | null;
  readonly completedWorkoutCount?: number;
  readonly modificationCount?: number;
  readonly workoutComplianceSummary?: string | null;
  readonly nutritionPlan?: NutritionPlan | null;
  readonly nutritionAdherenceSummary?: string | null;
  readonly nutritionComplianceSummary?: string | null;
  readonly recoveryMetrics?: RecoveryMetrics | null;
  readonly sleepProfile?: SleepProfile | null;
  readonly recoveryNotes?: readonly string[];
  readonly fatigueTrend?: string | null;
  readonly sleepTrend?: string | null;
  readonly recoveryTrend?: string | null;
  readonly goalProgress?: GoalProgress | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly coachingSession?: CoachingSession | null;
  readonly focusForNextWeek?: string | null;
  readonly recommendationTitles?: readonly string[];
  readonly recommendationIds?: readonly string[];
  readonly expectedOutcome?: string | null;
  readonly insightLimit?: number;
  readonly decisionLimit?: number;
}

function deriveWeekBounds(generatedAt: string): {
  readonly weekStart: string;
  readonly weekEnd: string;
} {
  const end = new Date(generatedAt);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
  };
}

/**
 * Compose an immutable Weekly Coach Report from existing domain outputs.
 * No new reasoning engines. No duplicated business logic. Not an LLM summary.
 */
export function buildWeeklyCoachReport(
  input: BuildWeeklyCoachReportInput,
): WeeklyReportResult {
  const timelineEntries = input.timelineEntries ?? Object.freeze([]);
  const insights = input.insights ?? Object.freeze([]);
  const bounds = deriveWeekBounds(input.generatedAt);
  const weekStart = input.weekStart ?? bounds.weekStart;
  const weekEnd = input.weekEnd ?? bounds.weekEnd;

  const workout = buildWorkoutReport({
    workoutPlan: input.workoutPlan ?? null,
    modification: input.modification ?? null,
    planHistory: input.planHistory ?? null,
    completedWorkoutCount: input.completedWorkoutCount,
    modificationCount: input.modificationCount,
    complianceSummary: input.workoutComplianceSummary,
  });

  const nutrition = buildNutritionReport({
    nutritionPlan: input.nutritionPlan ?? null,
    timelineEntries,
    adherenceSummary: input.nutritionAdherenceSummary,
    complianceSummary: input.nutritionComplianceSummary,
  });

  const recovery = buildRecoveryReport({
    recoveryMetrics: input.recoveryMetrics ?? null,
    sleepProfile: input.sleepProfile ?? null,
    recoveryNotes: input.recoveryNotes ?? Object.freeze([]),
    fatigueTrend: input.fatigueTrend,
    sleepTrend: input.sleepTrend,
    recoveryTrend: input.recoveryTrend,
  });

  const goals = buildGoalReport({
    goalProgress: input.goalProgress ?? null,
  });

  const insightReport = buildInsightReport({
    insights,
    limit: input.insightLimit ?? 5,
  });

  const decisions = buildDecisionReport({
    timelineEntries,
    limit: input.decisionLimit ?? 20,
  });

  const recommendations = buildRecommendationReport({
    coachingSession: input.coachingSession ?? null,
    focusForNextWeek: input.focusForNextWeek,
    recommendationTitles: input.recommendationTitles,
    recommendationIds: input.recommendationIds,
    expectedOutcome: input.expectedOutcome,
  });

  const reportId = `weekly-report:${input.requestId}:${input.generatedAt}`;

  const evidence = buildEvidence({
    reportId,
    dailyBrief: input.dailyBrief ?? null,
    coachingSession: input.coachingSession ?? null,
    timelineEntries,
    planHistory: input.planHistory ?? null,
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightReport,
    decisions,
    recommendations,
  });

  const confidence = calculateWeeklyConfidence({
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightReport,
    decisions,
    recommendations,
    evidence,
  });

  const relatedDomains = deriveRelatedDomains({
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightReport,
    decisions,
    recommendations,
  });

  const executiveSummary = buildExecutiveSummary({
    athleteId: input.athleteId,
    reportId,
    dailyBrief: input.dailyBrief ?? null,
    homeExperience: input.homeExperience ?? null,
    coachingSession: input.coachingSession ?? null,
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightReport,
    decisions,
    recommendations,
    confidence,
    generatedAt: input.generatedAt,
  });

  const report: WeeklyCoachReport = Object.freeze({
    id: reportId,
    athleteId: input.athleteId,
    timestamp: input.generatedAt,
    weekStart,
    weekEnd,
    executiveSummary,
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightReport,
    decisions,
    recommendations,
    evidence,
    confidence,
    relatedDomains,
    metadata: Object.freeze({
      requestId: input.requestId,
      athleteId: input.athleteId,
    }),
  });

  const validation = validateWeeklyCoachReport(report);
  if (!validation.valid) {
    return Object.freeze({
      id: `weekly-report-result:${input.requestId}:invalid`,
      success: false,
      report: null,
      executiveSummary: null,
      validation,
      message: `Weekly coach report validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `weekly-report-result:${input.requestId}`,
    success: true,
    report,
    executiveSummary,
    validation,
    message: "Weekly coach report composed from existing coaching knowledge.",
    generatedAt: input.generatedAt,
  });
}
