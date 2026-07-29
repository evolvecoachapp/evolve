import type { AnalyticsCategory } from "../models/AnalyticsCategory";
import type { AnalyticsPeriodKind } from "../models/AnalyticsPeriod";
import type { ChartType } from "../models/ProgressChart";

export interface AnalyticsPeriodDto {
  readonly kind: AnalyticsPeriodKind;
  readonly label: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export interface AnalyticsFilterDto {
  readonly period: AnalyticsPeriodDto;
  readonly categories: readonly AnalyticsCategory[];
  readonly includeCharts: boolean;
}

export interface ChartDataPointDto {
  readonly label: string;
  readonly value: number;
  readonly secondaryValue?: number | null;
}

export interface ChartSeriesDto {
  readonly id: string;
  readonly label: string;
  readonly points: readonly ChartDataPointDto[];
}

export interface ProgressChartDto {
  readonly id: string;
  readonly title: string;
  readonly type: ChartType;
  readonly unit: string;
  readonly category: AnalyticsCategory;
  readonly points: readonly ChartDataPointDto[];
  readonly series?: readonly ChartSeriesDto[];
}

export interface ProgressSummaryDto {
  readonly headline: string;
  readonly summary: string;
  readonly workoutsCompleted: number;
  readonly adherencePercent: number;
  readonly strengthChangePercent: number;
  readonly bodyWeightChangeKg: number;
  readonly recoveryScore: number;
  readonly consistencyPercent: number;
}

export interface WorkoutHistoryEntryDto {
  readonly id: string;
  readonly title: string;
  readonly completedAt: string;
  readonly durationMinutes: number;
  readonly volumeKg: number;
  readonly exerciseCount: number;
  readonly rpeAverage?: number | null;
  readonly destination?: string | null;
}

export interface WorkoutHistoryDto {
  readonly entries: readonly WorkoutHistoryEntryDto[];
  readonly totalCount: number;
  readonly destination?: string | null;
}

export interface WorkoutStatisticsDto {
  readonly totalWorkouts: number;
  readonly totalVolumeKg: number;
  readonly averageDurationMinutes: number;
  readonly averageRpe?: number | null;
  readonly completionRatePercent: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface StrengthProgressDto {
  readonly estimatedOneRepMaxKg: number;
  readonly changePercent: number;
  readonly strongestLift: string;
  readonly personalRecordsCount: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface VolumeProgressDto {
  readonly totalVolumeKg: number;
  readonly changePercent: number;
  readonly weeklyAverageKg: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface BodyMeasurementDto {
  readonly id: string;
  readonly measuredAt: string;
  readonly site: string;
  readonly valueCm: number;
  readonly changeCm?: number | null;
  readonly destination?: string | null;
}

export interface BodyCompositionDto {
  readonly bodyFatPercent?: number | null;
  readonly leanMassKg?: number | null;
  readonly fatMassKg?: number | null;
  readonly muscleMassKg?: number | null;
  readonly measuredAt?: string | null;
  readonly destination?: string | null;
}

export interface BodyWeightEntryDto {
  readonly id: string;
  readonly recordedAt: string;
  readonly weightKg: number;
  readonly changeKg?: number | null;
}

export interface BodyWeightHistoryDto {
  readonly entries: readonly BodyWeightEntryDto[];
  readonly currentKg?: number | null;
  readonly changeKg?: number | null;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface NutritionStatisticsDto {
  readonly averageCalories: number;
  readonly averageProteinGrams: number;
  readonly averageCarbohydrateGrams: number;
  readonly averageFatGrams: number;
  readonly calorieAdherencePercent: number;
  readonly proteinAdherencePercent: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface RecoveryStatisticsDto {
  readonly averageScore: number;
  readonly trend: "improving" | "stable" | "declining";
  readonly readinessLabel: string;
  readonly restingHeartRate?: number | null;
  readonly hrvAverage?: number | null;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface SleepStatisticsDto {
  readonly averageHours: number;
  readonly averageQualityScore?: number | null;
  readonly consistencyPercent: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface PerformanceTrendDto {
  readonly id: string;
  readonly category: AnalyticsCategory;
  readonly label: string;
  readonly direction: "up" | "flat" | "down";
  readonly changePercent: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface GoalProgressDto {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly completionPercent: number;
  readonly status: string;
  readonly destination?: string | null;
}

export interface PersonalRecordDto {
  readonly id: string;
  readonly exerciseName: string;
  readonly weightKg: number;
  readonly reps: number;
  readonly estimatedOneRepMaxKg: number;
  readonly achievedAt: string;
  readonly destination?: string | null;
}

export interface TrainingConsistencyDto {
  readonly currentStreakDays: number;
  readonly bestStreakDays: number;
  readonly adherencePercent: number;
  readonly completedSessions: number;
  readonly plannedSessions: number;
  readonly chart?: ProgressChartDto | null;
  readonly destination?: string | null;
}

export interface AnalyticsSnapshotDto {
  readonly id: string;
  readonly capturedAt: string;
  readonly period: AnalyticsPeriodDto;
  readonly summary: ProgressSummaryDto;
  readonly notes?: string | null;
  readonly destination?: string | null;
}

export interface ProgressAnalyticsDataDto {
  readonly period: AnalyticsPeriodDto;
  readonly filter: AnalyticsFilterDto;
  readonly summary: ProgressSummaryDto;
  readonly workoutHistory: WorkoutHistoryDto;
  readonly workoutStatistics: WorkoutStatisticsDto;
  readonly strengthProgress: StrengthProgressDto;
  readonly volumeProgress: VolumeProgressDto;
  readonly bodyMeasurements: readonly BodyMeasurementDto[];
  readonly bodyComposition: BodyCompositionDto;
  readonly bodyWeightHistory: BodyWeightHistoryDto;
  readonly nutritionStatistics: NutritionStatisticsDto;
  readonly recoveryStatistics: RecoveryStatisticsDto;
  readonly sleepStatistics: SleepStatisticsDto;
  readonly performanceTrends: readonly PerformanceTrendDto[];
  readonly goalProgress: readonly GoalProgressDto[];
  readonly personalRecords: readonly PersonalRecordDto[];
  readonly trainingConsistency: TrainingConsistencyDto;
  readonly charts: readonly ProgressChartDto[];
  readonly snapshot: AnalyticsSnapshotDto | null;
}

export type ProgressAnalyticsProviderId = "mock" | "backend" | "local";

export interface ProgressAnalyticsService {
  readonly providerId: ProgressAnalyticsProviderId;
  getAnalytics(filter?: AnalyticsFilterDto): Promise<ProgressAnalyticsDataDto>;
  getWorkoutHistory(period?: AnalyticsPeriodDto): Promise<WorkoutHistoryDto>;
  getBodyMeasurements(period?: AnalyticsPeriodDto): Promise<readonly BodyMeasurementDto[]>;
  getStrengthProgress(period?: AnalyticsPeriodDto): Promise<StrengthProgressDto>;
  getNutritionStatistics(period?: AnalyticsPeriodDto): Promise<NutritionStatisticsDto>;
  getRecoveryStatistics(period?: AnalyticsPeriodDto): Promise<RecoveryStatisticsDto>;
  getGoalProgress(period?: AnalyticsPeriodDto): Promise<readonly GoalProgressDto[]>;
  getPersonalRecords(period?: AnalyticsPeriodDto): Promise<readonly PersonalRecordDto[]>;
  getAnalyticsSnapshot(period?: AnalyticsPeriodDto): Promise<AnalyticsSnapshotDto>;
}

export class ProgressAnalyticsError extends Error {
  constructor(message: string, readonly providerId?: ProgressAnalyticsProviderId) {
    super(message);
    this.name = "ProgressAnalyticsError";
  }
}
