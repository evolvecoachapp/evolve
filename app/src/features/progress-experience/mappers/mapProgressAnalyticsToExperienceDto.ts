import type {
  PerformanceTrendDto,
  ProgressAnalyticsDataDto,
  ProgressChartDto,
} from "../../progress-analytics/services/ProgressAnalyticsService";
import type { TimeRange } from "../models";
import type {
  ChartSeriesDto,
  CoachInsightSummaryDto,
  GoalProgressDto,
  ProgressDashboardDto,
  TrainingStreakDto,
} from "../services";

export interface MapProgressAnalyticsToExperienceDtoInput {
  readonly analytics: ProgressAnalyticsDataDto;
  readonly timeRange: TimeRange;
  readonly athleteId: string;
}

function mapProgressChartToChartSeries(
  chart: ProgressChartDto | null | undefined,
  fallback: { readonly id: string; readonly label: string; readonly unit: string },
): ChartSeriesDto {
  if (!chart || chart.points.length === 0) {
    return Object.freeze({
      id: fallback.id,
      label: fallback.label,
      unit: fallback.unit,
      points: Object.freeze([Object.freeze({ label: "—", value: 0 })]),
    });
  }

  return Object.freeze({
    id: chart.id,
    label: chart.title,
    unit: chart.unit,
    points: Object.freeze(
      chart.points.map((point) =>
        Object.freeze({ label: point.label, value: point.value }),
      ),
    ),
  });
}

function mapPerformanceTrendToCoachInsight(
  trend: PerformanceTrendDto,
): CoachInsightSummaryDto {
  const severity =
    trend.direction === "up"
      ? "positive"
      : trend.direction === "down"
        ? "warning"
        : "action";

  return Object.freeze({
    id: trend.id,
    title: trend.label,
    summary: `${trend.label} is ${trend.direction} ${Math.abs(trend.changePercent)}% over the selected period.`,
    metric: `${trend.changePercent > 0 ? "+" : ""}${trend.changePercent}%`,
    severity,
    destination:
      trend.destination ?? `/(app)/progress/coach-insights/${trend.id}`,
  });
}

function resolveGoalProgress(
  goals: ProgressAnalyticsDataDto["goalProgress"],
): GoalProgressDto {
  const primary = goals[0];

  if (!primary) {
    return Object.freeze({
      id: "goal-empty",
      title: "Complete your first training block",
      currentValue: 0,
      targetValue: 1,
      unit: "block",
      completionPercent: 0,
      status: "Not started",
      destination: "/(app)/progress/goal-details/goal-empty",
    });
  }

  return Object.freeze({
    id: primary.id,
    title: primary.title,
    currentValue: primary.currentValue,
    targetValue: primary.targetValue,
    unit: primary.unit,
    completionPercent: primary.completionPercent,
    status: primary.status,
    destination:
      primary.destination ?? `/(app)/progress/goal-details/${primary.id}`,
  });
}

function resolveTrainingStreak(
  analytics: ProgressAnalyticsDataDto,
): TrainingStreakDto {
  const consistency = analytics.trainingConsistency;

  return Object.freeze({
    currentDays: consistency.currentStreakDays,
    bestDays: consistency.bestStreakDays,
    completedWeeks: Math.max(
      0,
      Math.floor(consistency.completedSessions / Math.max(consistency.plannedSessions, 1)),
    ),
    destination:
      consistency.destination ?? "/(app)/progress/exercise-history",
  });
}

function formatChangeLabel(changePercent: number, periodLabel: string): string {
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${changePercent}% ${periodLabel}`;
}

/** Projects Progress Analytics read models into Progress Experience dashboard DTO. */
export function mapProgressAnalyticsToExperienceDto({
  analytics,
  timeRange,
}: MapProgressAnalyticsToExperienceDtoInput): ProgressDashboardDto {
  const { summary, strengthProgress, volumeProgress, recoveryStatistics, nutritionStatistics } =
    analytics;

  return Object.freeze({
    timeRange,
    headline: summary.headline,
    summary: summary.summary,
    strength: Object.freeze({
      estimatedOneRepMaxKg: strengthProgress.estimatedOneRepMaxKg,
      changePercent: strengthProgress.changePercent,
      strongestLift: strengthProgress.strongestLift,
      personalRecordsCount: strengthProgress.personalRecordsCount,
      chart: mapProgressChartToChartSeries(strengthProgress.chart, {
        id: "strength",
        label: "Estimated 1RM",
        unit: "kg",
      }),
      destination:
        strengthProgress.destination ?? "/(app)/progress/detailed-analytics",
    }),
    volume: Object.freeze({
      totalVolumeKg: volumeProgress.totalVolumeKg,
      changePercent: volumeProgress.changePercent,
      workoutsCompleted: analytics.workoutStatistics.totalWorkouts,
      weeklyProgressLabel: formatChangeLabel(
        volumeProgress.changePercent,
        "vs prior week",
      ),
      monthlyProgressLabel: formatChangeLabel(
        volumeProgress.changePercent,
        "vs prior month",
      ),
      chart: mapProgressChartToChartSeries(volumeProgress.chart, {
        id: "volume",
        label: "Training Volume",
        unit: "kg",
      }),
      destination:
        volumeProgress.destination ?? "/(app)/progress/exercise-history",
    }),
    recovery: Object.freeze({
      averageScore: recoveryStatistics.averageScore,
      trend: recoveryStatistics.trend,
      sleepAverageHours: analytics.sleepStatistics.averageHours,
      readinessLabel: recoveryStatistics.readinessLabel,
      chart: mapProgressChartToChartSeries(recoveryStatistics.chart, {
        id: "recovery",
        label: "Recovery Score",
        unit: "score",
      }),
      destination:
        recoveryStatistics.destination ?? "/(app)/progress/detailed-analytics",
    }),
    nutrition: Object.freeze({
      caloriesAdherencePercent: nutritionStatistics.calorieAdherencePercent,
      proteinAdherencePercent: nutritionStatistics.proteinAdherencePercent,
      averageCalories: nutritionStatistics.averageCalories,
      averageProteinGrams: nutritionStatistics.averageProteinGrams,
      chart: mapProgressChartToChartSeries(nutritionStatistics.chart, {
        id: "nutrition",
        label: "Protein Adherence",
        unit: "%",
      }),
      destination:
        nutritionStatistics.destination ?? "/(app)/progress/detailed-analytics",
    }),
    bodyMetrics: Object.freeze({
      bodyWeightKg: analytics.bodyWeightHistory.currentKg ?? 0,
      bodyWeightChangeKg: analytics.bodyWeightHistory.changeKg ?? 0,
      bodyFatPercent: analytics.bodyComposition.bodyFatPercent ?? null,
      leanMassKg: analytics.bodyComposition.leanMassKg ?? 0,
      chart: mapProgressChartToChartSeries(analytics.bodyWeightHistory.chart, {
        id: "body-weight",
        label: "Body Weight",
        unit: "kg",
      }),
      destination:
        analytics.bodyWeightHistory.destination ?? "/(app)/progress/body-metrics",
    }),
    coachInsights: Object.freeze(
      analytics.performanceTrends.map(mapPerformanceTrendToCoachInsight),
    ),
    personalRecords: Object.freeze(
      analytics.personalRecords.map((record) =>
        Object.freeze({
          id: record.id,
          exerciseName: record.exerciseName,
          weightKg: record.weightKg,
          reps: record.reps,
          estimatedOneRepMaxKg: record.estimatedOneRepMaxKg,
          achievedAt: record.achievedAt,
        }),
      ),
    ),
    trainingStreak: resolveTrainingStreak(analytics),
    goalProgress: resolveGoalProgress(analytics.goalProgress),
    detailsDestination: "/(app)/progress/detailed-analytics",
  });
}
