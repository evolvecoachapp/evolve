import {
  createAnalyticsFilter,
  createAnalyticsPeriod,
  createAnalyticsSnapshot,
  createAthleteProgress,
  createBodyComposition,
  createBodyMeasurement,
  createBodyWeightHistory,
  createGoalProgress,
  createNutritionStatistics,
  createPerformanceTrend,
  createPersonalRecord,
  createProgressChart,
  createProgressSummary,
  createRecoveryStatistics,
  createSleepStatistics,
  createStrengthProgress,
  createTrainingConsistency,
  createVolumeProgress,
  createWorkoutHistory,
  createWorkoutStatistics,
  type AnalyticsSnapshot,
  type AthleteProgress,
  type BodyMeasurement,
  type GoalProgress,
  type NutritionStatistics,
  type PersonalRecord,
  type ProgressChart,
  type RecoveryStatistics,
  type StrengthProgress,
  type WorkoutHistory,
} from "../models";
import type {
  AnalyticsSnapshotDto,
  BodyMeasurementDto,
  GoalProgressDto,
  NutritionStatisticsDto,
  PersonalRecordDto,
  ProgressAnalyticsDataDto,
  ProgressChartDto,
  RecoveryStatisticsDto,
  StrengthProgressDto,
  WorkoutHistoryDto,
} from "../services";

export type ProgressAnalyticsData = AthleteProgress;

function mapChart(dto: ProgressChartDto | null | undefined): ProgressChart | null {
  if (!dto) return null;
  return createProgressChart({
    id: dto.id,
    title: dto.title,
    type: dto.type,
    unit: dto.unit,
    category: dto.category,
    points: dto.points.map((p) => ({
      label: p.label,
      value: p.value,
      secondaryValue: p.secondaryValue ?? null,
    })),
    series: (dto.series ?? []).map((s) => ({
      id: s.id,
      label: s.label,
      points: s.points.map((p) => ({
        label: p.label,
        value: p.value,
        secondaryValue: p.secondaryValue ?? null,
      })),
    })),
  });
}

export function mapWorkoutHistory(dto: WorkoutHistoryDto): WorkoutHistory {
  return createWorkoutHistory({
    entries: dto.entries.map((e) => ({
      id: e.id,
      title: e.title,
      completedAt: e.completedAt,
      durationMinutes: e.durationMinutes,
      volumeKg: e.volumeKg,
      exerciseCount: e.exerciseCount,
      rpeAverage: e.rpeAverage ?? null,
      destination: e.destination ?? null,
    })),
    totalCount: dto.totalCount,
    destination: dto.destination ?? null,
  });
}

export function mapBodyMeasurements(dtos: readonly BodyMeasurementDto[]): readonly BodyMeasurement[] {
  return Object.freeze(
    dtos.map((dto) =>
      createBodyMeasurement({
        id: dto.id,
        measuredAt: dto.measuredAt,
        site: dto.site,
        valueCm: dto.valueCm,
        changeCm: dto.changeCm ?? null,
        destination: dto.destination ?? null,
      }),
    ),
  );
}

export function mapStrengthProgress(dto: StrengthProgressDto): StrengthProgress {
  return createStrengthProgress({
    estimatedOneRepMaxKg: dto.estimatedOneRepMaxKg,
    changePercent: dto.changePercent,
    strongestLift: dto.strongestLift,
    personalRecordsCount: dto.personalRecordsCount,
    chart: mapChart(dto.chart),
    destination: dto.destination ?? null,
  });
}

export function mapNutritionStatistics(dto: NutritionStatisticsDto): NutritionStatistics {
  return createNutritionStatistics({
    averageCalories: dto.averageCalories,
    averageProteinGrams: dto.averageProteinGrams,
    averageCarbohydrateGrams: dto.averageCarbohydrateGrams,
    averageFatGrams: dto.averageFatGrams,
    calorieAdherencePercent: dto.calorieAdherencePercent,
    proteinAdherencePercent: dto.proteinAdherencePercent,
    chart: mapChart(dto.chart),
    destination: dto.destination ?? null,
  });
}

export function mapRecoveryStatistics(dto: RecoveryStatisticsDto): RecoveryStatistics {
  return createRecoveryStatistics({
    averageScore: dto.averageScore,
    trend: dto.trend,
    readinessLabel: dto.readinessLabel,
    restingHeartRate: dto.restingHeartRate ?? null,
    hrvAverage: dto.hrvAverage ?? null,
    chart: mapChart(dto.chart),
    destination: dto.destination ?? null,
  });
}

export function mapGoalProgress(dtos: readonly GoalProgressDto[]): readonly GoalProgress[] {
  return Object.freeze(
    dtos.map((dto) =>
      createGoalProgress({
        id: dto.id,
        title: dto.title,
        category: dto.category,
        currentValue: dto.currentValue,
        targetValue: dto.targetValue,
        unit: dto.unit,
        completionPercent: dto.completionPercent,
        status: dto.status,
        destination: dto.destination ?? null,
      }),
    ),
  );
}

export function mapPersonalRecords(dtos: readonly PersonalRecordDto[]): readonly PersonalRecord[] {
  return Object.freeze(
    dtos.map((dto) =>
      createPersonalRecord({
        id: dto.id,
        exerciseName: dto.exerciseName,
        weightKg: dto.weightKg,
        reps: dto.reps,
        estimatedOneRepMaxKg: dto.estimatedOneRepMaxKg,
        achievedAt: dto.achievedAt,
        destination: dto.destination ?? null,
      }),
    ),
  );
}

export function mapAnalyticsSnapshot(dto: AnalyticsSnapshotDto): AnalyticsSnapshot {
  return createAnalyticsSnapshot({
    id: dto.id,
    capturedAt: dto.capturedAt,
    period: createAnalyticsPeriod(dto.period),
    summary: createProgressSummary(dto.summary),
    notes: dto.notes ?? null,
    destination: dto.destination ?? null,
  });
}

export function mapProgressAnalyticsData(dto: ProgressAnalyticsDataDto): ProgressAnalyticsData {
  return createAthleteProgress({
    period: createAnalyticsPeriod(dto.period),
    filter: createAnalyticsFilter({
      period: createAnalyticsPeriod(dto.filter.period),
      categories: dto.filter.categories,
      includeCharts: dto.filter.includeCharts,
    }),
    summary: createProgressSummary(dto.summary),
    workoutHistory: mapWorkoutHistory(dto.workoutHistory),
    workoutStatistics: createWorkoutStatistics({
      totalWorkouts: dto.workoutStatistics.totalWorkouts,
      totalVolumeKg: dto.workoutStatistics.totalVolumeKg,
      averageDurationMinutes: dto.workoutStatistics.averageDurationMinutes,
      averageRpe: dto.workoutStatistics.averageRpe ?? null,
      completionRatePercent: dto.workoutStatistics.completionRatePercent,
      chart: mapChart(dto.workoutStatistics.chart),
      destination: dto.workoutStatistics.destination ?? null,
    }),
    strengthProgress: mapStrengthProgress(dto.strengthProgress),
    volumeProgress: createVolumeProgress({
      totalVolumeKg: dto.volumeProgress.totalVolumeKg,
      changePercent: dto.volumeProgress.changePercent,
      weeklyAverageKg: dto.volumeProgress.weeklyAverageKg,
      chart: mapChart(dto.volumeProgress.chart),
      destination: dto.volumeProgress.destination ?? null,
    }),
    bodyMeasurements: mapBodyMeasurements(dto.bodyMeasurements),
    bodyComposition: createBodyComposition({
      bodyFatPercent: dto.bodyComposition.bodyFatPercent ?? null,
      leanMassKg: dto.bodyComposition.leanMassKg ?? null,
      fatMassKg: dto.bodyComposition.fatMassKg ?? null,
      muscleMassKg: dto.bodyComposition.muscleMassKg ?? null,
      measuredAt: dto.bodyComposition.measuredAt ?? null,
      destination: dto.bodyComposition.destination ?? null,
    }),
    bodyWeightHistory: createBodyWeightHistory({
      entries: dto.bodyWeightHistory.entries.map((e) => ({
        id: e.id,
        recordedAt: e.recordedAt,
        weightKg: e.weightKg,
        changeKg: e.changeKg ?? null,
      })),
      currentKg: dto.bodyWeightHistory.currentKg ?? null,
      changeKg: dto.bodyWeightHistory.changeKg ?? null,
      chart: mapChart(dto.bodyWeightHistory.chart),
      destination: dto.bodyWeightHistory.destination ?? null,
    }),
    nutritionStatistics: mapNutritionStatistics(dto.nutritionStatistics),
    recoveryStatistics: mapRecoveryStatistics(dto.recoveryStatistics),
    sleepStatistics: createSleepStatistics({
      averageHours: dto.sleepStatistics.averageHours,
      averageQualityScore: dto.sleepStatistics.averageQualityScore ?? null,
      consistencyPercent: dto.sleepStatistics.consistencyPercent,
      chart: mapChart(dto.sleepStatistics.chart),
      destination: dto.sleepStatistics.destination ?? null,
    }),
    performanceTrends: Object.freeze(
      dto.performanceTrends.map((t) =>
        createPerformanceTrend({
          id: t.id,
          category: t.category,
          label: t.label,
          direction: t.direction,
          changePercent: t.changePercent,
          chart: mapChart(t.chart),
          destination: t.destination ?? null,
        }),
      ),
    ),
    goalProgress: mapGoalProgress(dto.goalProgress),
    personalRecords: mapPersonalRecords(dto.personalRecords),
    trainingConsistency: createTrainingConsistency({
      currentStreakDays: dto.trainingConsistency.currentStreakDays,
      bestStreakDays: dto.trainingConsistency.bestStreakDays,
      adherencePercent: dto.trainingConsistency.adherencePercent,
      completedSessions: dto.trainingConsistency.completedSessions,
      plannedSessions: dto.trainingConsistency.plannedSessions,
      chart: mapChart(dto.trainingConsistency.chart),
      destination: dto.trainingConsistency.destination ?? null,
    }),
    charts: Object.freeze(dto.charts.map((c) => mapChart(c)!)),
    snapshot: dto.snapshot ? mapAnalyticsSnapshot(dto.snapshot) : null,
  });
}
