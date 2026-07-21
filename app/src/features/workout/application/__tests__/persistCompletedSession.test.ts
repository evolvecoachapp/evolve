import type { WorkoutSessionSummary } from "../../types/workoutSessionSummary";
import { toCompletedWorkout } from "../toCompletedWorkout";
import { persistCompletedSession } from "../persistCompletedSession";
import type { WorkoutHistoryRepository } from "../../repository";
import type { CompletedWorkout } from "../../models/CompletedWorkout";

function createSummary(
  overrides: Partial<WorkoutSessionSummary> = {},
): WorkoutSessionSummary {
  return Object.freeze({
    sessionId: "session:day:1",
    title: "Upper A",
    programName: "Hypertrophy Block",
    durationSeconds: 2700,
    completedExercises: 2,
    totalExercises: 3,
    completedSets: 7,
    skippedSets: 1,
    totalSets: 8,
    completionPercent: 100,
    estimatedVolumeKg: 980.5,
    averageCompletedReps: 9.2,
    completedAt: "2026-07-21T12:00:00.000Z",
    ...overrides,
  });
}

describe("toCompletedWorkout", () => {
  it("maps summary fields onto the domain model with id = sessionId", () => {
    const summary = createSummary();
    const completed = toCompletedWorkout(summary);

    expect(completed).toEqual({
      id: "session:day:1",
      sessionId: "session:day:1",
      title: "Upper A",
      programName: "Hypertrophy Block",
      durationSeconds: 2700,
      completedExercises: 2,
      totalExercises: 3,
      completedSets: 7,
      skippedSets: 1,
      totalSets: 8,
      completionPercent: 100,
      estimatedVolumeKg: 980.5,
      averageCompletedReps: 9.2,
      completedAt: "2026-07-21T12:00:00.000Z",
    });
    expect(Object.isFrozen(completed)).toBe(true);
  });
});

describe("persistCompletedSession", () => {
  it("saves through the repository and returns the domain model", async () => {
    const saved: CompletedWorkout[] = [];
    const repository: WorkoutHistoryRepository = {
      saveCompletedSession: jest.fn(async (session) => {
        saved.push(session);
      }),
      getCompletedSessions: jest.fn(async () => saved),
      getCompletedSession: jest.fn(async (id) => saved.find((s) => s.id === id) ?? null),
      getRecentSessions: jest.fn(async (limit) => saved.slice(0, limit)),
      clearHistory: jest.fn(async () => {
        saved.length = 0;
      }),
    };

    const summary = createSummary({ averageCompletedReps: null });
    const result = await persistCompletedSession(summary, repository);

    expect(repository.saveCompletedSession).toHaveBeenCalledTimes(1);
    expect(result.id).toBe(summary.sessionId);
    expect(result.averageCompletedReps).toBeNull();
    expect(saved).toHaveLength(1);
  });
});
