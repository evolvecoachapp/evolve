import { renderHook, act, waitFor } from "@testing-library/react-native";
import {
  useWorkoutNavigation,
  useWorkoutProgress,
  useWorkoutRuntime,
} from "../../hooks";
import { mockWorkoutRuntimeData } from "../../mocks/workoutRuntimeData";
import type { WorkoutRuntimeExperienceService } from "../../types/workoutRuntimeService";

function createService(): WorkoutRuntimeExperienceService {
  return {
    providerId: "mock",
    async getRuntime() {
      return {
        ...mockWorkoutRuntimeData,
        exercises: mockWorkoutRuntimeData.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set) => ({ ...set })),
        })),
      };
    },
    async finishRuntime() {
      /* no-op */
    },
  };
}

describe("workout runtime experience hooks", () => {
  const service = createService();

  it("useWorkoutRuntime loads runtime and exposes actions", async () => {
    const { result } = renderHook(() => useWorkoutRuntime({ service }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.runtime?.title).toBe("Upper Body Strength");
    expect(result.current.currentExercise?.name).toBe("Barbell Bench Press");

    act(() => {
      result.current.updateWeight(88);
      result.current.completeSet();
    });

    expect(result.current.runtime?.progress.completedSets).toBe(1);
  });

  it("useWorkoutNavigation and useWorkoutProgress project ViewModel state", async () => {
    const { result } = renderHook(() => useWorkoutRuntime({ service }));

    await waitFor(() => {
      expect(result.current.runtime).not.toBeNull();
    });

    const viewModel = result.current.viewModel;
    const navigation = renderHook(() => useWorkoutNavigation({ viewModel }));
    const progress = renderHook(() =>
      useWorkoutProgress({ runtime: result.current.runtime }),
    );

    expect(progress.result.current.completionPercent).toBe(0);
    expect(navigation.result.current.historyDestination).toContain("history");

    act(() => {
      navigation.result.current.nextExercise();
    });

    expect(result.current.runtime?.currentExerciseIndex).toBe(1);
  });

  it("useWorkoutRuntime rest timer pause/resume via ViewModel bindings", async () => {
    const { result } = renderHook(() => useWorkoutRuntime({ service }));

    await waitFor(() => {
      expect(result.current.runtime).not.toBeNull();
    });

    act(() => {
      result.current.startRestTimer(30);
    });
    expect(result.current.runtime?.timer.targetSeconds).toBe(30);

    act(() => {
      result.current.pauseRestTimer();
    });
    expect(result.current.runtime?.timer.status).toBe("paused");

    act(() => {
      result.current.resumeRestTimer();
    });
    expect(result.current.runtime?.timer.status).toBe("running");
  });
});
