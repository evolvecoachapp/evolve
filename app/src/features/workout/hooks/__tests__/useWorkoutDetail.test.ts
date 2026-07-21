import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { CompletedWorkout } from "../../models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../repository";
import { useWorkoutDetail } from "../useWorkoutDetail";

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
    exercises: overrides.exercises ?? Object.freeze([]),
    ...overrides,
  });
}

function createRepository(
  workout: CompletedWorkout | null = null,
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(),
    getCompletedSession: jest.fn(async () => workout),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

describe("useWorkoutDetail", () => {
  it("loads a completed workout through the mocked repository", async () => {
    const workout = createWorkout({
      id: "session:1",
      completedAt: "2026-07-21T12:00:00.000Z",
    });
    const repository = createRepository(workout);

    const { result } = renderHook(() =>
      useWorkoutDetail({ sessionId: "session:1", repository }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workout).toEqual(workout);
    expect(result.current.notFound).toBe(false);
    expect(result.current.error).toBeNull();
    expect(repository.getCompletedSession).toHaveBeenCalledWith("session:1");
  });

  it("marks missing workouts as notFound", async () => {
    const repository = createRepository(null);

    const { result } = renderHook(() =>
      useWorkoutDetail({ sessionId: "missing", repository }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workout).toBeNull();
    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("treats an empty sessionId as not found without calling the repository", async () => {
    const repository = createRepository(null);

    const { result } = renderHook(() =>
      useWorkoutDetail({ sessionId: undefined, repository }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notFound).toBe(true);
    expect(repository.getCompletedSession).not.toHaveBeenCalled();
  });

  it("surfaces repository errors", async () => {
    const repository = createRepository(null);
    (repository.getCompletedSession as jest.Mock).mockRejectedValue(
      new Error("storage failed"),
    );

    const { result } = renderHook(() =>
      useWorkoutDetail({ sessionId: "session:1", repository }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("storage failed");
    expect(result.current.workout).toBeNull();
    expect(result.current.notFound).toBe(false);
  });

  it("ignores late responses after unmount", async () => {
    let resolveWorkout: (value: CompletedWorkout | null) => void = () => undefined;
    const repository = createRepository(null);
    (repository.getCompletedSession as jest.Mock).mockImplementation(
      () =>
        new Promise<CompletedWorkout | null>((resolve) => {
          resolveWorkout = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useWorkoutDetail({ sessionId: "session:late", repository }),
    );

    expect(result.current.loading).toBe(true);
    unmount();

    await act(async () => {
      resolveWorkout(
        createWorkout({ id: "session:late", completedAt: "2026-07-21T12:00:00.000Z" }),
      );
    });
  });
});
