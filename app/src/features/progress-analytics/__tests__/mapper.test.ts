import {
  mapAnalyticsSnapshot,
  mapProgressAnalyticsData,
  mapStrengthProgress,
  mapWorkoutHistory,
} from "../mappers";
import type {
  AnalyticsSnapshotDto,
  ProgressAnalyticsDataDto,
  StrengthProgressDto,
  WorkoutHistoryDto,
} from "../services";

describe("progress-analytics mappers", () => {
  it("maps workout history DTO to immutable model", () => {
    const dto: WorkoutHistoryDto = {
      entries: [
        {
          id: "w1",
          title: "Test",
          completedAt: "2026-01-01T00:00:00Z",
          durationMinutes: 60,
          volumeKg: 1000,
          exerciseCount: 5,
        },
      ],
      totalCount: 1,
    };
    const result = mapWorkoutHistory(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.entries[0].destination).toBeNull();
    expect(result.entries[0].rpeAverage).toBeNull();
  });

  it("maps strength progress with null chart", () => {
    const dto: StrengthProgressDto = {
      estimatedOneRepMaxKg: 100,
      changePercent: 2,
      strongestLift: "Squat",
      personalRecordsCount: 1,
    };
    const result = mapStrengthProgress(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.chart).toBeNull();
    expect(result.destination).toBeNull();
  });

  it("maps analytics snapshot", () => {
    const dto: AnalyticsSnapshotDto = {
      id: "s1",
      capturedAt: "2026-01-01T00:00:00Z",
      period: { kind: "week", label: "Week", startDate: null, endDate: null },
      summary: {
        headline: "H",
        summary: "S",
        workoutsCompleted: 0,
        adherencePercent: 0,
        strengthChangePercent: 0,
        bodyWeightChangeKg: 0,
        recoveryScore: 0,
        consistencyPercent: 0,
      },
    };
    const result = mapAnalyticsSnapshot(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.notes).toBeNull();
    expect(result.destination).toBeNull();
  });

  it("maps full analytics data", () => {
    const dto: ProgressAnalyticsDataDto = {
      period: { kind: "week", label: "Week", startDate: null, endDate: null },
      filter: {
        period: { kind: "week", label: "Week", startDate: null, endDate: null },
        categories: ["workout"],
        includeCharts: false,
      },
      summary: {
        headline: "H",
        summary: "S",
        workoutsCompleted: 0,
        adherencePercent: 0,
        strengthChangePercent: 0,
        bodyWeightChangeKg: 0,
        recoveryScore: 0,
        consistencyPercent: 0,
      },
      workoutHistory: { entries: [], totalCount: 0 },
      workoutStatistics: {
        totalWorkouts: 0,
        totalVolumeKg: 0,
        averageDurationMinutes: 0,
        completionRatePercent: 0,
      },
      strengthProgress: {
        estimatedOneRepMaxKg: 0,
        changePercent: 0,
        strongestLift: "—",
        personalRecordsCount: 0,
      },
      volumeProgress: { totalVolumeKg: 0, changePercent: 0, weeklyAverageKg: 0 },
      bodyMeasurements: [],
      bodyComposition: {},
      bodyWeightHistory: { entries: [] },
      nutritionStatistics: {
        averageCalories: 0,
        averageProteinGrams: 0,
        averageCarbohydrateGrams: 0,
        averageFatGrams: 0,
        calorieAdherencePercent: 0,
        proteinAdherencePercent: 0,
        entries: [],
      },
      recoveryStatistics: {
        averageScore: 0,
        trend: "stable",
        readinessLabel: "Unknown",
      },
      sleepStatistics: { averageHours: 0, consistencyPercent: 0 },
      performanceTrends: [],
      goalProgress: [],
      personalRecords: [],
      trainingConsistency: {
        currentStreakDays: 0,
        bestStreakDays: 0,
        adherencePercent: 0,
        completedSessions: 0,
        plannedSessions: 0,
      },
      charts: [],
      snapshot: null,
    };
    const result = mapProgressAnalyticsData(dto);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.filter)).toBe(true);
    expect(result.snapshot).toBeNull();
  });
});
