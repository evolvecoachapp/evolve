import type { TimeRange } from "../models";

export interface ChartPointDto {
  readonly label: string;
  readonly value: number;
}

export interface ChartSeriesDto {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly points: readonly ChartPointDto[];
}

export interface PersonalRecordDto {
  readonly id: string;
  readonly exerciseName: string;
  readonly weightKg: number;
  readonly reps: number;
  readonly estimatedOneRepMaxKg: number;
  readonly achievedAt: string;
}

export interface GoalProgressDto {
  readonly id: string;
  readonly title: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly completionPercent: number;
  readonly status: string;
  readonly destination?: string | null;
}

export interface TrainingStreakDto {
  readonly currentDays: number;
  readonly bestDays: number;
  readonly completedWeeks: number;
  readonly destination?: string | null;
}

export interface CoachInsightSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly metric: string;
  readonly severity: "positive" | "warning" | "action";
  readonly destination?: string | null;
}

export interface StrengthProgressDto {
  readonly estimatedOneRepMaxKg: number;
  readonly changePercent: number;
  readonly strongestLift: string;
  readonly personalRecordsCount: number;
  readonly chart: ChartSeriesDto;
  readonly destination?: string | null;
}

export interface VolumeProgressDto {
  readonly totalVolumeKg: number;
  readonly changePercent: number;
  readonly workoutsCompleted: number;
  readonly weeklyProgressLabel: string;
  readonly monthlyProgressLabel: string;
  readonly chart: ChartSeriesDto;
  readonly destination?: string | null;
}

export interface RecoveryProgressDto {
  readonly averageScore: number;
  readonly trend: "improving" | "stable" | "declining";
  readonly sleepAverageHours: number;
  readonly readinessLabel: string;
  readonly chart: ChartSeriesDto;
  readonly destination?: string | null;
}

export interface NutritionProgressDto {
  readonly caloriesAdherencePercent: number;
  readonly proteinAdherencePercent: number;
  readonly averageCalories: number;
  readonly averageProteinGrams: number;
  readonly chart: ChartSeriesDto;
  readonly destination?: string | null;
}

export interface BodyMetricsDto {
  readonly bodyWeightKg: number;
  readonly bodyWeightChangeKg: number;
  readonly bodyFatPercent: number | null;
  readonly leanMassKg: number;
  readonly chart: ChartSeriesDto;
  readonly destination?: string | null;
}

export interface ProgressDashboardDto {
  readonly timeRange: TimeRange;
  readonly headline: string;
  readonly summary: string;
  readonly strength: StrengthProgressDto;
  readonly volume: VolumeProgressDto;
  readonly recovery: RecoveryProgressDto;
  readonly nutrition: NutritionProgressDto;
  readonly bodyMetrics: BodyMetricsDto;
  readonly coachInsights: readonly CoachInsightSummaryDto[];
  readonly personalRecords: readonly PersonalRecordDto[];
  readonly trainingStreak: TrainingStreakDto;
  readonly goalProgress: GoalProgressDto;
  readonly detailsDestination?: string | null;
}

export type ProgressExperienceProviderId = "mock" | "backend" | "local";

export interface ProgressExperienceService {
  readonly providerId: ProgressExperienceProviderId;
  getDashboard(timeRange: TimeRange): Promise<ProgressDashboardDto>;
  getStrengthProgress(timeRange: TimeRange): Promise<StrengthProgressDto>;
  getVolumeProgress(timeRange: TimeRange): Promise<VolumeProgressDto>;
  getRecoveryProgress(timeRange: TimeRange): Promise<RecoveryProgressDto>;
  getNutritionProgress(timeRange: TimeRange): Promise<NutritionProgressDto>;
  getBodyMetrics(timeRange: TimeRange): Promise<BodyMetricsDto>;
  getCoachInsights(timeRange: TimeRange): Promise<readonly CoachInsightSummaryDto[]>;
}

export class ProgressExperienceError extends Error {
  constructor(message: string, readonly providerId?: ProgressExperienceProviderId) {
    super(message);
    this.name = "ProgressExperienceError";
  }
}
