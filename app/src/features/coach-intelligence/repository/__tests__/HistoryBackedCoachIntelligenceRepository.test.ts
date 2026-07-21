import type { WorkoutAnalytics } from "../../../analytics/models/WorkoutAnalytics";
import type { WorkoutTrend } from "../../../analytics/models/WorkoutTrend";
import type { WorkoutAnalyticsRepository } from "../../../analytics/repository";
import type { AthleteContextRepository } from "../../../athlete-context/repository";
import { createAthleteProfile } from "../../../athlete-context/testSupport/fixtures";
import type { ExerciseRecord } from "../../../records/models/ExerciseRecord";
import type { WorkoutRecord } from "../../../records/models/WorkoutRecord";
import type { WorkoutRecordsRepository } from "../../../records/repository";
import type { CompletedWorkout } from "../../../workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../../workout/repository";
import { HistoryBackedCoachIntelligenceRepository } from "../HistoryBackedCoachIntelligenceRepository";
import {
  createExercise,
  createSet,
  createTrend,
  createWorkout,
} from "../../testSupport/fixtures";

function createAthleteContext(
  profile = createAthleteProfile(),
): AthleteContextRepository {
  return {
    getProfile: jest.fn(async () => profile),
    getSnapshot: jest.fn(async (referenceDate?: Date) =>
      Object.freeze({
        profile,
        trainingAgeYears: profile.experience.yearsTraining,
        validation: Object.freeze({
          valid: true,
          issues: Object.freeze([]),
        }),
        capturedAt: (referenceDate ?? new Date()).toISOString(),
      }),
    ),
    updateProfile: jest.fn(async (next) => next),
    validateProfile: jest.fn(() =>
      Object.freeze({
        valid: true,
        issues: Object.freeze([]),
      }),
    ),
  };
}

function createHistory(
  sessions: readonly CompletedWorkout[],
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(async () => sessions),
    getCompletedSession: jest.fn(),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

function createAnalytics(
  volumeTrend: WorkoutTrend,
  frequencyTrend: WorkoutTrend,
): WorkoutAnalyticsRepository {
  const emptyAnalytics: WorkoutAnalytics = Object.freeze({
    totalWorkouts: 0,
    totalVolumeKg: 0,
    totalSets: 0,
    totalReps: 0,
    averageDurationSeconds: null,
    averageVolumeKg: null,
  });

  return {
    getWorkoutAnalytics: jest.fn(async () => emptyAnalytics),
    getExerciseAnalytics: jest.fn(async () => Object.freeze([])),
    getWeeklyAnalytics: jest.fn(),
    getVolumeTrend: jest.fn(async () => volumeTrend),
    getWorkoutFrequency: jest.fn(async () => frequencyTrend),
    getExerciseFrequency: jest.fn(),
  };
}

function createRecords(
  workoutRecord: WorkoutRecord,
  exerciseRecords: readonly ExerciseRecord[],
): WorkoutRecordsRepository {
  return {
    getWorkoutRecord: jest.fn(async () => workoutRecord),
    getExerciseRecords: jest.fn(async () => exerciseRecords),
    getRecordSummary: jest.fn(),
  };
}

describe("HistoryBackedCoachIntelligenceRepository", () => {
  const referenceDate = new Date("2026-07-21T12:00:00.000Z");

  const sessions = [
    createWorkout({
      id: "a",
      completedAt: "2026-07-01T12:00:00.000Z",
      estimatedVolumeKg: 900,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([
            createSet({ id: "s1", weightKg: 80, reps: 5 }),
          ]),
        }),
      ]),
    }),
    createWorkout({
      id: "b",
      completedAt: "2026-07-18T12:00:00.000Z",
      estimatedVolumeKg: 1300,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([
            createSet({ id: "s2", weightKg: 90, reps: 5 }),
          ]),
        }),
      ]),
    }),
  ];

  const workoutRecord: WorkoutRecord = Object.freeze({
    bestWeightKg: 90,
    bestEstimatedOneRMKg: 105,
    bestSessionVolumeKg: 1300,
    bestSingleSetVolumeKg: 450,
    bestReps: 5,
    lastRecordAt: "2026-07-18T12:00:00.000Z",
  });

  const exerciseRecords: readonly ExerciseRecord[] = Object.freeze([
    Object.freeze({
      exerciseId: "bench",
      exerciseName: "Bench",
      bestWeightKg: 90,
      bestEstimatedOneRM: null,
      bestSingleSetVolumeKg: 450,
      bestReps: 5,
      lastRecordAt: "2026-07-18T12:00:00.000Z",
    }),
  ]);

  it("builds a structured snapshot from analytics, records, history, and athlete context", async () => {
    const volumeTrend = createTrend("volume", [800, 900, 1100, 1300]);
    const frequencyTrend = createTrend("workout_frequency", [2, 2, 3, 3]);
    const athleteContext = createAthleteContext();
    const repository = new HistoryBackedCoachIntelligenceRepository(
      createAnalytics(volumeTrend, frequencyTrend),
      createRecords(workoutRecord, exerciseRecords),
      createHistory(sessions),
      athleteContext,
    );

    const snapshot = await repository.getSnapshot(referenceDate);

    expect(athleteContext.getSnapshot).toHaveBeenCalledWith(referenceDate);
    expect(snapshot.summary.volumeTrend.direction).toBe("increasing");
    expect(snapshot.summary.frequencyTrend.direction).toBe("increasing");
    expect(snapshot.summary.consistencyScore).toBeGreaterThan(0);
    expect(snapshot.summary.insightCount).toBeGreaterThan(0);
    expect(snapshot.summary.athleteGoal?.primary).toBe("hypertrophy");
    expect(snapshot.summary.trainingExperience?.level).toBe("intermediate");
    expect(snapshot.insights.some((insight) => insight.kind === "recent_pr")).toBe(
      true,
    );
    expect(snapshot.insights.some((insight) => insight.kind === "volume_trend")).toBe(
      true,
    );
    expect(Array.isArray(snapshot.riskFlags)).toBe(true);
    expect(Array.isArray(snapshot.recommendations)).toBe(true);
  });

  it("exposes the same summary through getCoachSummary", async () => {
    const repository = new HistoryBackedCoachIntelligenceRepository(
      createAnalytics(
        createTrend("volume", [1000, 1000, 1000, 1000]),
        createTrend("workout_frequency", [3, 3, 3, 3]),
      ),
      createRecords(workoutRecord, exerciseRecords),
      createHistory(sessions),
      createAthleteContext(),
    );

    const summary = await repository.getCoachSummary(referenceDate);
    expect(summary.volumeTrend.direction).toBe("stable");
    expect(summary.athleteGoal?.primary).toBe("hypertrophy");
    expect(summary.generatedAt).toBe(referenceDate.toISOString());
  });

  it("returns empty-adjacent signals when history is empty", async () => {
    const emptyRecord: WorkoutRecord = Object.freeze({
      bestWeightKg: null,
      bestEstimatedOneRMKg: null,
      bestSessionVolumeKg: null,
      bestSingleSetVolumeKg: null,
      bestReps: null,
      lastRecordAt: null,
    });
    const repository = new HistoryBackedCoachIntelligenceRepository(
      createAnalytics(
        createTrend("volume", [0, 0, 0, 0]),
        createTrend("workout_frequency", [0, 0, 0, 0]),
      ),
      createRecords(emptyRecord, Object.freeze([])),
      createHistory([]),
      createAthleteContext(),
    );

    const snapshot = await repository.getSnapshot(referenceDate);
    expect(snapshot.summary.recovery.level).toBe("unknown");
    expect(snapshot.summary.progress.level).toBe("unknown");
    expect(snapshot.insights.some((insight) => insight.kind === "inactivity")).toBe(
      false,
    );
  });

  it("flags long inactivity from history gaps", async () => {
    const staleSessions = [
      createWorkout({
        id: "old",
        completedAt: "2026-06-01T12:00:00.000Z",
        exercises: Object.freeze([
          createExercise({
            id: "squat",
            name: "Squat",
            sets: Object.freeze([
              createSet({ id: "s1", weightKg: 100, reps: 5 }),
            ]),
          }),
        ]),
      }),
    ];
    const repository = new HistoryBackedCoachIntelligenceRepository(
      createAnalytics(
        createTrend("volume", [1200, 0, 0, 0]),
        createTrend("workout_frequency", [2, 0, 0, 0]),
      ),
      createRecords(
        Object.freeze({
          ...workoutRecord,
          lastRecordAt: "2026-06-01T12:00:00.000Z",
        }),
        Object.freeze([]),
      ),
      createHistory(staleSessions),
      createAthleteContext(),
    );

    const risks = await repository.getRiskFlags(referenceDate);
    expect(risks.some((risk) => risk.code === "long_inactivity")).toBe(true);

    const recommendations = await repository.getRecommendations(referenceDate);
    expect(
      recommendations.some((item) => item.code === "return_to_training"),
    ).toBe(true);
  });
});
