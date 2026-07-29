import type {
  AnalyticsFilterDto,
  AnalyticsPeriodDto,
  AnalyticsSnapshotDto,
  BodyMeasurementDto,
  GoalProgressDto,
  NutritionStatisticsDto,
  PersonalRecordDto,
  ProgressAnalyticsDataDto,
  ProgressAnalyticsService,
  RecoveryStatisticsDto,
  StrengthProgressDto,
  WorkoutHistoryDto,
} from "../services";

const defaultPeriod: AnalyticsPeriodDto = {
  kind: "week",
  label: "This Week",
  startDate: "2026-07-23",
  endDate: "2026-07-29",
};

const defaultFilter: AnalyticsFilterDto = {
  period: defaultPeriod,
  categories: [
    "workout",
    "strength",
    "hypertrophy",
    "nutrition",
    "recovery",
    "sleep",
    "body_weight",
    "measurements",
    "consistency",
    "goals",
  ],
  includeCharts: true,
};

function buildDefaultData(): ProgressAnalyticsDataDto {
  return {
    period: defaultPeriod,
    filter: defaultFilter,
    summary: {
      headline: "Strong week",
      summary: "You completed 4 of 5 planned sessions with rising strength and solid recovery.",
      workoutsCompleted: 4,
      adherencePercent: 80,
      strengthChangePercent: 3.2,
      bodyWeightChangeKg: -0.4,
      recoveryScore: 78,
      consistencyPercent: 85,
    },
    workoutHistory: {
      entries: [
        {
          id: "wh-001",
          title: "Upper Strength",
          completedAt: "2026-07-28T07:30:00Z",
          durationMinutes: 62,
          volumeKg: 8450,
          exerciseCount: 7,
          rpeAverage: 7.5,
          destination: "/(app)/progress/analytics/workout/wh-001",
        },
        {
          id: "wh-002",
          title: "Lower Hypertrophy",
          completedAt: "2026-07-26T08:00:00Z",
          durationMinutes: 71,
          volumeKg: 10200,
          exerciseCount: 8,
          rpeAverage: 8.0,
          destination: "/(app)/progress/analytics/workout/wh-002",
        },
        {
          id: "wh-003",
          title: "Push Volume",
          completedAt: "2026-07-24T07:15:00Z",
          durationMinutes: 55,
          volumeKg: 7200,
          exerciseCount: 6,
          rpeAverage: 7.0,
          destination: "/(app)/progress/analytics/workout/wh-003",
        },
      ],
      totalCount: 3,
      destination: "/(app)/progress/analytics/history",
    },
    workoutStatistics: {
      totalWorkouts: 4,
      totalVolumeKg: 31200,
      averageDurationMinutes: 61,
      averageRpe: 7.4,
      completionRatePercent: 80,
      chart: {
        id: "chart-workout-volume",
        title: "Weekly Volume",
        type: "bar",
        unit: "kg",
        category: "workout",
        points: [
          { label: "Mon", value: 7200, secondaryValue: null },
          { label: "Wed", value: 10200, secondaryValue: null },
          { label: "Fri", value: 8450, secondaryValue: null },
          { label: "Sat", value: 5350, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/workouts",
    },
    strengthProgress: {
      estimatedOneRepMaxKg: 142,
      changePercent: 3.2,
      strongestLift: "Back Squat",
      personalRecordsCount: 2,
      chart: {
        id: "chart-strength",
        title: "Estimated 1RM",
        type: "line",
        unit: "kg",
        category: "strength",
        points: [
          { label: "W1", value: 135, secondaryValue: null },
          { label: "W2", value: 137, secondaryValue: null },
          { label: "W3", value: 140, secondaryValue: null },
          { label: "W4", value: 142, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/strength",
    },
    volumeProgress: {
      totalVolumeKg: 31200,
      changePercent: 8.5,
      weeklyAverageKg: 7800,
      chart: {
        id: "chart-volume",
        title: "Training Volume",
        type: "area",
        unit: "kg",
        category: "hypertrophy",
        points: [
          { label: "W1", value: 28000, secondaryValue: null },
          { label: "W2", value: 29500, secondaryValue: null },
          { label: "W3", value: 30100, secondaryValue: null },
          { label: "W4", value: 31200, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/volume",
    },
    bodyMeasurements: [
      {
        id: "bm-001",
        measuredAt: "2026-07-29",
        site: "Waist",
        valueCm: 82.0,
        changeCm: -0.5,
        destination: "/(app)/progress/analytics/measurements/bm-001",
      },
      {
        id: "bm-002",
        measuredAt: "2026-07-29",
        site: "Chest",
        valueCm: 102.5,
        changeCm: 0.3,
        destination: "/(app)/progress/analytics/measurements/bm-002",
      },
      {
        id: "bm-003",
        measuredAt: "2026-07-29",
        site: "Arms",
        valueCm: 36.0,
        changeCm: 0.2,
        destination: "/(app)/progress/analytics/measurements/bm-003",
      },
    ],
    bodyComposition: {
      bodyFatPercent: 14.2,
      leanMassKg: 68.5,
      fatMassKg: 11.3,
      muscleMassKg: 62.0,
      measuredAt: "2026-07-29",
      destination: "/(app)/progress/analytics/composition",
    },
    bodyWeightHistory: {
      entries: [
        { id: "bw-001", recordedAt: "2026-07-01", weightKg: 80.2, changeKg: null },
        { id: "bw-002", recordedAt: "2026-07-08", weightKg: 79.8, changeKg: -0.4 },
        { id: "bw-003", recordedAt: "2026-07-15", weightKg: 79.6, changeKg: -0.2 },
        { id: "bw-004", recordedAt: "2026-07-22", weightKg: 79.4, changeKg: -0.2 },
        { id: "bw-005", recordedAt: "2026-07-29", weightKg: 79.8, changeKg: 0.4 },
      ],
      currentKg: 79.8,
      changeKg: -0.4,
      chart: {
        id: "chart-body-weight",
        title: "Body Weight",
        type: "line",
        unit: "kg",
        category: "body_weight",
        points: [
          { label: "Jul 1", value: 80.2, secondaryValue: null },
          { label: "Jul 8", value: 79.8, secondaryValue: null },
          { label: "Jul 15", value: 79.6, secondaryValue: null },
          { label: "Jul 22", value: 79.4, secondaryValue: null },
          { label: "Jul 29", value: 79.8, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/body-weight",
    },
    nutritionStatistics: {
      averageCalories: 2450,
      averageProteinGrams: 165,
      averageCarbohydrateGrams: 280,
      averageFatGrams: 72,
      calorieAdherencePercent: 92,
      proteinAdherencePercent: 95,
      chart: {
        id: "chart-nutrition",
        title: "Calorie Adherence",
        type: "bar",
        unit: "%",
        category: "nutrition",
        points: [
          { label: "Mon", value: 98, secondaryValue: null },
          { label: "Tue", value: 90, secondaryValue: null },
          { label: "Wed", value: 95, secondaryValue: null },
          { label: "Thu", value: 88, secondaryValue: null },
          { label: "Fri", value: 94, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/nutrition",
    },
    recoveryStatistics: {
      averageScore: 78,
      trend: "stable",
      readinessLabel: "Ready",
      restingHeartRate: 54,
      hrvAverage: 68,
      chart: {
        id: "chart-recovery",
        title: "Recovery Score",
        type: "area",
        unit: "score",
        category: "recovery",
        points: [
          { label: "Mon", value: 72, secondaryValue: null },
          { label: "Tue", value: 80, secondaryValue: null },
          { label: "Wed", value: 75, secondaryValue: null },
          { label: "Thu", value: 82, secondaryValue: null },
          { label: "Fri", value: 78, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/recovery",
    },
    sleepStatistics: {
      averageHours: 7.4,
      averageQualityScore: 82,
      consistencyPercent: 88,
      chart: {
        id: "chart-sleep",
        title: "Sleep Duration",
        type: "bar",
        unit: "hours",
        category: "sleep",
        points: [
          { label: "Mon", value: 7.2, secondaryValue: null },
          { label: "Tue", value: 7.8, secondaryValue: null },
          { label: "Wed", value: 6.9, secondaryValue: null },
          { label: "Thu", value: 7.5, secondaryValue: null },
          { label: "Fri", value: 7.6, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/sleep",
    },
    performanceTrends: [
      {
        id: "pt-001",
        category: "strength",
        label: "Squat 1RM",
        direction: "up",
        changePercent: 3.2,
        chart: null,
        destination: "/(app)/progress/analytics/trends/pt-001",
      },
      {
        id: "pt-002",
        category: "hypertrophy",
        label: "Weekly Volume",
        direction: "up",
        changePercent: 8.5,
        chart: null,
        destination: "/(app)/progress/analytics/trends/pt-002",
      },
      {
        id: "pt-003",
        category: "recovery",
        label: "Recovery Score",
        direction: "flat",
        changePercent: 0.5,
        chart: null,
        destination: "/(app)/progress/analytics/trends/pt-003",
      },
    ],
    goalProgress: [
      {
        id: "gp-001",
        title: "Squat 150 kg",
        category: "strength",
        currentValue: 142,
        targetValue: 150,
        unit: "kg",
        completionPercent: 94.7,
        status: "on_track",
        destination: "/(app)/progress/analytics/goals/gp-001",
      },
      {
        id: "gp-002",
        title: "Body Weight 78 kg",
        category: "body_weight",
        currentValue: 79.8,
        targetValue: 78,
        unit: "kg",
        completionPercent: 72,
        status: "on_track",
        destination: "/(app)/progress/analytics/goals/gp-002",
      },
    ],
    personalRecords: [
      {
        id: "pr-001",
        exerciseName: "Back Squat",
        weightKg: 140,
        reps: 3,
        estimatedOneRepMaxKg: 148,
        achievedAt: "2026-07-26T08:20:00Z",
        destination: "/(app)/progress/analytics/records/pr-001",
      },
      {
        id: "pr-002",
        exerciseName: "Bench Press",
        weightKg: 100,
        reps: 5,
        estimatedOneRepMaxKg: 116,
        achievedAt: "2026-07-28T07:45:00Z",
        destination: "/(app)/progress/analytics/records/pr-002",
      },
    ],
    trainingConsistency: {
      currentStreakDays: 12,
      bestStreakDays: 21,
      adherencePercent: 85,
      completedSessions: 4,
      plannedSessions: 5,
      chart: {
        id: "chart-consistency",
        title: "Session Adherence",
        type: "radar",
        unit: "%",
        category: "consistency",
        points: [
          { label: "Mon", value: 100, secondaryValue: null },
          { label: "Tue", value: 0, secondaryValue: null },
          { label: "Wed", value: 100, secondaryValue: null },
          { label: "Thu", value: 0, secondaryValue: null },
          { label: "Fri", value: 100, secondaryValue: null },
          { label: "Sat", value: 100, secondaryValue: null },
          { label: "Sun", value: 0, secondaryValue: null },
        ],
        series: [],
      },
      destination: "/(app)/progress/analytics/consistency",
    },
    charts: [
      {
        id: "chart-overview",
        title: "Performance Overview",
        type: "radar",
        unit: "score",
        category: "workout",
        points: [
          { label: "Strength", value: 82, secondaryValue: null },
          { label: "Volume", value: 88, secondaryValue: null },
          { label: "Recovery", value: 78, secondaryValue: null },
          { label: "Nutrition", value: 92, secondaryValue: null },
          { label: "Consistency", value: 85, secondaryValue: null },
        ],
        series: [],
      },
      {
        id: "chart-scatter-load",
        title: "Load vs RPE",
        type: "scatter",
        unit: "kg",
        category: "workout",
        points: [
          { label: "Set 1", value: 100, secondaryValue: 6 },
          { label: "Set 2", value: 110, secondaryValue: 7 },
          { label: "Set 3", value: 120, secondaryValue: 8 },
          { label: "Set 4", value: 125, secondaryValue: 9 },
        ],
        series: [],
      },
    ],
    snapshot: {
      id: "snap-001",
      capturedAt: "2026-07-29T12:00:00Z",
      period: defaultPeriod,
      summary: {
        headline: "Strong week",
        summary: "You completed 4 of 5 planned sessions with rising strength and solid recovery.",
        workoutsCompleted: 4,
        adherencePercent: 80,
        strengthChangePercent: 3.2,
        bodyWeightChangeKg: -0.4,
        recoveryScore: 78,
        consistencyPercent: 85,
      },
      notes: "Prepared for AI Coach and future engine providers.",
      destination: "/(app)/progress/analytics/snapshot/snap-001",
    },
  };
}

function emptyData(): ProgressAnalyticsDataDto {
  const emptyPeriod = { ...defaultPeriod };
  return {
    period: emptyPeriod,
    filter: { period: emptyPeriod, categories: [], includeCharts: false },
    summary: {
      headline: "No progress yet",
      summary: "Complete workouts to unlock analytics.",
      workoutsCompleted: 0,
      adherencePercent: 0,
      strengthChangePercent: 0,
      bodyWeightChangeKg: 0,
      recoveryScore: 0,
      consistencyPercent: 0,
    },
    workoutHistory: { entries: [], totalCount: 0, destination: null },
    workoutStatistics: {
      totalWorkouts: 0,
      totalVolumeKg: 0,
      averageDurationMinutes: 0,
      averageRpe: null,
      completionRatePercent: 0,
      chart: null,
      destination: null,
    },
    strengthProgress: {
      estimatedOneRepMaxKg: 0,
      changePercent: 0,
      strongestLift: "—",
      personalRecordsCount: 0,
      chart: null,
      destination: null,
    },
    volumeProgress: {
      totalVolumeKg: 0,
      changePercent: 0,
      weeklyAverageKg: 0,
      chart: null,
      destination: null,
    },
    bodyMeasurements: [],
    bodyComposition: {
      bodyFatPercent: null,
      leanMassKg: null,
      fatMassKg: null,
      muscleMassKg: null,
      measuredAt: null,
      destination: null,
    },
    bodyWeightHistory: {
      entries: [],
      currentKg: null,
      changeKg: null,
      chart: null,
      destination: null,
    },
    nutritionStatistics: {
      averageCalories: 0,
      averageProteinGrams: 0,
      averageCarbohydrateGrams: 0,
      averageFatGrams: 0,
      calorieAdherencePercent: 0,
      proteinAdherencePercent: 0,
      chart: null,
      destination: null,
    },
    recoveryStatistics: {
      averageScore: 0,
      trend: "stable",
      readinessLabel: "Unknown",
      restingHeartRate: null,
      hrvAverage: null,
      chart: null,
      destination: null,
    },
    sleepStatistics: {
      averageHours: 0,
      averageQualityScore: null,
      consistencyPercent: 0,
      chart: null,
      destination: null,
    },
    performanceTrends: [],
    goalProgress: [],
    personalRecords: [],
    trainingConsistency: {
      currentStreakDays: 0,
      bestStreakDays: 0,
      adherencePercent: 0,
      completedSessions: 0,
      plannedSessions: 0,
      chart: null,
      destination: null,
    },
    charts: [],
    snapshot: null,
  };
}

let currentData: ProgressAnalyticsDataDto = buildDefaultData();

export const mockProgressAnalyticsService: ProgressAnalyticsService = {
  providerId: "mock",

  async getAnalytics(filter?: AnalyticsFilterDto) {
    if (filter) {
      return { ...currentData, filter, period: filter.period };
    }
    return currentData;
  },

  async getWorkoutHistory(_period?: AnalyticsPeriodDto) {
    return currentData.workoutHistory;
  },

  async getBodyMeasurements(_period?: AnalyticsPeriodDto) {
    return currentData.bodyMeasurements;
  },

  async getStrengthProgress(_period?: AnalyticsPeriodDto) {
    return currentData.strengthProgress;
  },

  async getNutritionStatistics(_period?: AnalyticsPeriodDto) {
    return currentData.nutritionStatistics;
  },

  async getRecoveryStatistics(_period?: AnalyticsPeriodDto) {
    return currentData.recoveryStatistics;
  },

  async getGoalProgress(_period?: AnalyticsPeriodDto) {
    return currentData.goalProgress;
  },

  async getPersonalRecords(_period?: AnalyticsPeriodDto) {
    return currentData.personalRecords;
  },

  async getAnalyticsSnapshot(_period?: AnalyticsPeriodDto) {
    if (!currentData.snapshot) {
      return {
        id: "snap-empty",
        capturedAt: "2026-07-29T00:00:00Z",
        period: currentData.period,
        summary: currentData.summary,
        notes: null,
        destination: null,
      };
    }
    return currentData.snapshot;
  },
};

export const emptyMockProgressAnalyticsService: ProgressAnalyticsService = {
  providerId: "mock",

  async getAnalytics() {
    return emptyData();
  },
  async getWorkoutHistory() {
    return emptyData().workoutHistory;
  },
  async getBodyMeasurements() {
    return [];
  },
  async getStrengthProgress() {
    return emptyData().strengthProgress;
  },
  async getNutritionStatistics() {
    return emptyData().nutritionStatistics;
  },
  async getRecoveryStatistics() {
    return emptyData().recoveryStatistics;
  },
  async getGoalProgress() {
    return [];
  },
  async getPersonalRecords() {
    return [];
  },
  async getAnalyticsSnapshot() {
    return {
      id: "snap-empty",
      capturedAt: "2026-07-29T00:00:00Z",
      period: defaultPeriod,
      summary: emptyData().summary,
      notes: null,
      destination: null,
    };
  },
};

export function resetMockProgressAnalyticsData(): void {
  currentData = buildDefaultData();
}
