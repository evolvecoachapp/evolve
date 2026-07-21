import type { CompletedWorkout } from "../../models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../repository";
import { listCompletedSessions } from "../listCompletedSessions";

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
    ...overrides,
  });
}

describe("listCompletedSessions", () => {
  it("returns sessions from the injected repository", async () => {
    const sessions = [
      createWorkout({ id: "newer", completedAt: "2026-07-21T12:00:00.000Z" }),
      createWorkout({ id: "older", completedAt: "2026-07-20T12:00:00.000Z" }),
    ];
    const repository: WorkoutHistoryRepository = {
      saveCompletedSession: jest.fn(),
      getCompletedSessions: jest.fn(async () => sessions),
      getCompletedSession: jest.fn(),
      getRecentSessions: jest.fn(),
      clearHistory: jest.fn(),
    };

    await expect(listCompletedSessions(repository)).resolves.toEqual(sessions);
    expect(repository.getCompletedSessions).toHaveBeenCalledTimes(1);
  });
});
