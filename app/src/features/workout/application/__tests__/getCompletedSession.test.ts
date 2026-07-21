import type { CompletedWorkout } from "../../models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../repository";
import { getCompletedSession } from "../getCompletedSession";

function createWorkout(
  overrides: Partial<CompletedWorkout> & Pick<CompletedWorkout, "id" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    title: overrides.title ?? "Upper A",
    programName: overrides.programName ?? "Hypertrophy Block",
    durationSeconds: overrides.durationSeconds ?? 2700,
    completedExercises: overrides.completedExercises ?? 2,
    totalExercises: overrides.totalExercises ?? 3,
    completedSets: overrides.completedSets ?? 8,
    skippedSets: overrides.skippedSets ?? 0,
    totalSets: overrides.totalSets ?? 8,
    completionPercent: overrides.completionPercent ?? 100,
    estimatedVolumeKg: overrides.estimatedVolumeKg ?? 1200,
    averageCompletedReps: overrides.averageCompletedReps ?? 10,
    exercises: overrides.exercises ?? Object.freeze([]),
    ...overrides,
  });
}

describe("getCompletedSession", () => {
  it("returns a workout from the mocked repository", async () => {
    const workout = createWorkout({
      id: "session:1",
      completedAt: "2026-07-21T12:00:00.000Z",
    });
    const repository: WorkoutHistoryRepository = {
      saveCompletedSession: jest.fn(),
      getCompletedSessions: jest.fn(),
      getCompletedSession: jest.fn(async () => workout),
      getRecentSessions: jest.fn(),
      clearHistory: jest.fn(),
    };

    await expect(getCompletedSession("session:1", repository)).resolves.toEqual(workout);
    expect(repository.getCompletedSession).toHaveBeenCalledWith("session:1");
  });

  it("returns null when the repository has no matching workout", async () => {
    const repository: WorkoutHistoryRepository = {
      saveCompletedSession: jest.fn(),
      getCompletedSessions: jest.fn(),
      getCompletedSession: jest.fn(async () => null),
      getRecentSessions: jest.fn(),
      clearHistory: jest.fn(),
    };

    await expect(getCompletedSession("missing", repository)).resolves.toBeNull();
  });
});
