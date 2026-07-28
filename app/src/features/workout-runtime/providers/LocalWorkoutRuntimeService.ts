import { mockWorkoutRuntimeData } from "../mocks/workoutRuntimeData";
import type { WorkoutRuntimeExperienceService } from "../types/workoutRuntimeService";

/** Local provider — mirrors mock seed until local persistence is wired. */
export const localWorkoutRuntimeService: WorkoutRuntimeExperienceService = {
  providerId: "local",

  async getRuntime() {
    return {
      ...mockWorkoutRuntimeData,
      exercises: mockWorkoutRuntimeData.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      })),
    };
  },

  async finishRuntime(): Promise<void> {
    /* local finish is in-memory only for Sprint 31.2 */
  },
};
