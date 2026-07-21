import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { CompletedWorkout } from "../../models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../repository";
import { useWorkoutHistory } from "../useWorkoutHistory";

function createWorkout(
  overrides: Partial<CompletedWorkout> & Pick<CompletedWorkout, "id" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    title: overrides.title ?? "Upper A",
    programName: overrides.programName ?? null,
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

function createRepository(
  sessions: readonly CompletedWorkout[] = [],
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(async () => sessions),
    getCompletedSession: jest.fn(),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

describe("useWorkoutHistory", () => {
  it("loads sessions through the injected repository", async () => {
    const sessions = [
      createWorkout({ id: "a", completedAt: "2026-07-21T12:00:00.000Z" }),
    ];
    const repository = createRepository(sessions);

    const { result } = renderHook(() => useWorkoutHistory({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual(sessions);
    expect(result.current.error).toBeNull();
    expect(repository.getCompletedSessions).toHaveBeenCalledTimes(1);
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getCompletedSessions as jest.Mock).mockRejectedValue(
      new Error("storage failed"),
    );

    const { result } = renderHook(() => useWorkoutHistory({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBe("storage failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveSessions: (value: readonly CompletedWorkout[]) => void = () => undefined;
    const repository = createRepository();
    (repository.getCompletedSessions as jest.Mock).mockImplementation(
      () =>
        new Promise<readonly CompletedWorkout[]>((resolve) => {
          resolveSessions = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useWorkoutHistory({ repository }));
    unmount();

    await act(async () => {
      resolveSessions([
        createWorkout({ id: "late", completedAt: "2026-07-21T12:00:00.000Z" }),
      ]);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.sessions).toEqual([]);
  });
});
