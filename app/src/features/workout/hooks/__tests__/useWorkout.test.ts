import { renderHook, waitFor } from "@testing-library/react-native";
import { useWorkout } from "../useWorkout";
import type { WorkoutService } from "../../types/workoutService";
import { WorkoutServiceError } from "../../types/workoutService";
import { mockWorkoutService } from "../../providers/MockWorkoutService";

function createFailingService(message: string): WorkoutService {
  return {
    providerId: "backend",
    getTodayWorkout: () => Promise.reject(new WorkoutServiceError(message, "backend")),
    getWorkout: () => Promise.resolve(null),
    startWorkout: () => Promise.reject(new Error("not implemented")),
    finishWorkout: () => Promise.reject(new Error("not implemented")),
    saveSet: () => Promise.reject(new Error("not implemented")),
    skipExercise: () => Promise.reject(new Error("not implemented")),
    getHistory: () => Promise.resolve([]),
  };
}

describe("useWorkout", () => {
  it("loads today's workout from the given service", async () => {
    const { result } = renderHook(() => useWorkout({ service: mockWorkoutService }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.workout).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("surfaces a WorkoutServiceError message and stops loading without a workout", async () => {
    const service = createFailingService("Today is a scheduled rest day.");
    const { result } = renderHook(() => useWorkout({ service }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.workout).toBeNull();
    expect(result.current.error).toBe("Today is a scheduled rest day.");
  });
});
