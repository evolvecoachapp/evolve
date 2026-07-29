import type { AnalyticsFilter } from "./AnalyticsFilter";
import type { AnalyticsPeriod } from "./AnalyticsPeriod";
import type { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import type { BodyComposition } from "./BodyComposition";
import type { BodyMeasurement } from "./BodyMeasurement";
import type { BodyWeightHistory } from "./BodyWeightHistory";
import type { GoalProgress } from "./GoalProgress";
import type { NutritionStatistics } from "./NutritionStatistics";
import type { PerformanceTrend } from "./PerformanceTrend";
import type { PersonalRecord } from "./PersonalRecord";
import type { ProgressChart } from "./ProgressChart";
import type { ProgressSummary } from "./ProgressSummary";
import type { RecoveryStatistics } from "./RecoveryStatistics";
import type { SleepStatistics } from "./SleepStatistics";
import type { StrengthProgress } from "./StrengthProgress";
import type { TrainingConsistency } from "./TrainingConsistency";
import type { VolumeProgress } from "./VolumeProgress";
import type { WorkoutHistory } from "./WorkoutHistory";
import type { WorkoutStatistics } from "./WorkoutStatistics";

export interface AthleteProgress {
  readonly period: AnalyticsPeriod;
  readonly filter: AnalyticsFilter;
  readonly summary: ProgressSummary;
  readonly workoutHistory: WorkoutHistory;
  readonly workoutStatistics: WorkoutStatistics;
  readonly strengthProgress: StrengthProgress;
  readonly volumeProgress: VolumeProgress;
  readonly bodyMeasurements: readonly BodyMeasurement[];
  readonly bodyComposition: BodyComposition;
  readonly bodyWeightHistory: BodyWeightHistory;
  readonly nutritionStatistics: NutritionStatistics;
  readonly recoveryStatistics: RecoveryStatistics;
  readonly sleepStatistics: SleepStatistics;
  readonly performanceTrends: readonly PerformanceTrend[];
  readonly goalProgress: readonly GoalProgress[];
  readonly personalRecords: readonly PersonalRecord[];
  readonly trainingConsistency: TrainingConsistency;
  readonly charts: readonly ProgressChart[];
  readonly snapshot: AnalyticsSnapshot | null;
}

export function createAthleteProgress(input: AthleteProgress): AthleteProgress {
  return Object.freeze({
    ...input,
    bodyMeasurements: Object.freeze([...input.bodyMeasurements]),
    performanceTrends: Object.freeze([...input.performanceTrends]),
    goalProgress: Object.freeze([...input.goalProgress]),
    personalRecords: Object.freeze([...input.personalRecords]),
    charts: Object.freeze([...input.charts]),
  });
}
