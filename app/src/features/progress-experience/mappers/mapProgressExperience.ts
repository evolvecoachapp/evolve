import {
  createBodyMetrics,
  createChartPoint,
  createChartSeries,
  createCoachInsightSummary,
  createGoalProgress,
  createNutritionProgress,
  createPersonalRecord,
  createProgressDashboard,
  createRecoveryProgress,
  createStrengthProgress,
  createTrainingStreak,
  createVolumeProgress,
  type BodyMetrics,
  type CoachInsightSummary,
  type GoalProgress,
  type NutritionProgress,
  type PersonalRecord,
  type ProgressDashboard,
  type RecoveryProgress,
  type StrengthProgress,
  type TrainingStreak,
  type VolumeProgress,
} from "../models";
import type {
  BodyMetricsDto,
  CoachInsightSummaryDto,
  GoalProgressDto,
  NutritionProgressDto,
  PersonalRecordDto,
  ProgressDashboardDto,
  RecoveryProgressDto,
  StrengthProgressDto,
  TrainingStreakDto,
  VolumeProgressDto,
} from "../services";

function mapChartSeries(dto: {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly points: readonly { readonly label: string; readonly value: number }[];
}) {
  return createChartSeries({
    id: dto.id,
    label: dto.label,
    unit: dto.unit,
    points: dto.points.map((point) => createChartPoint(point.label, point.value)),
  });
}

export function mapStrengthProgress(dto: StrengthProgressDto): StrengthProgress {
  return createStrengthProgress({
    ...dto,
    chart: mapChartSeries(dto.chart),
    destination: dto.destination ?? "/(app)/progress/detailed-analytics",
  });
}

export function mapVolumeProgress(dto: VolumeProgressDto): VolumeProgress {
  return createVolumeProgress({
    ...dto,
    chart: mapChartSeries(dto.chart),
    destination: dto.destination ?? "/(app)/progress/exercise-history",
  });
}

export function mapRecoveryProgress(dto: RecoveryProgressDto): RecoveryProgress {
  return createRecoveryProgress({
    ...dto,
    chart: mapChartSeries(dto.chart),
    destination: dto.destination ?? "/(app)/progress/detailed-analytics",
  });
}

export function mapNutritionProgress(dto: NutritionProgressDto): NutritionProgress {
  return createNutritionProgress({
    ...dto,
    chart: mapChartSeries(dto.chart),
    destination: dto.destination ?? "/(app)/progress/detailed-analytics",
  });
}

export function mapBodyMetrics(dto: BodyMetricsDto): BodyMetrics {
  return createBodyMetrics({
    ...dto,
    chart: mapChartSeries(dto.chart),
    destination: dto.destination ?? "/(app)/progress/body-metrics",
  });
}

export function mapCoachInsight(dto: CoachInsightSummaryDto): CoachInsightSummary {
  return createCoachInsightSummary({
    ...dto,
    destination: dto.destination ?? `/(app)/progress/coach-insights/${dto.id}`,
  });
}

export function mapPersonalRecord(dto: PersonalRecordDto): PersonalRecord {
  return createPersonalRecord({ ...dto });
}

export function mapTrainingStreak(dto: TrainingStreakDto): TrainingStreak {
  return createTrainingStreak({
    ...dto,
    destination: dto.destination ?? "/(app)/progress/exercise-history",
  });
}

export function mapGoalProgress(dto: GoalProgressDto): GoalProgress {
  return createGoalProgress({
    ...dto,
    destination: dto.destination ?? `/(app)/progress/goal-details/${dto.id}`,
  });
}

export function mapProgressDashboard(dto: ProgressDashboardDto): ProgressDashboard {
  return createProgressDashboard({
    timeRange: dto.timeRange,
    headline: dto.headline,
    summary: dto.summary,
    strength: mapStrengthProgress(dto.strength),
    volume: mapVolumeProgress(dto.volume),
    recovery: mapRecoveryProgress(dto.recovery),
    nutrition: mapNutritionProgress(dto.nutrition),
    bodyMetrics: mapBodyMetrics(dto.bodyMetrics),
    coachInsights: dto.coachInsights.map(mapCoachInsight),
    personalRecords: dto.personalRecords.map(mapPersonalRecord),
    trainingStreak: mapTrainingStreak(dto.trainingStreak),
    goalProgress: mapGoalProgress(dto.goalProgress),
    detailsDestination: dto.detailsDestination ?? "/(app)/progress/detailed-analytics",
  });
}
