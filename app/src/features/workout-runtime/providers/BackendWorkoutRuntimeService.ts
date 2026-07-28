import { WorkoutRuntimeExperienceError } from "../types/workoutRuntimeService";
import type { WorkoutRuntimeExperienceService } from "../types/workoutRuntimeService";

/** Placeholder backend provider — not configured in Sprint 31.2. */
export const backendWorkoutRuntimeService: WorkoutRuntimeExperienceService = {
  providerId: "backend",

  async getRuntime() {
    throw new WorkoutRuntimeExperienceError(
      "Backend workout runtime provider is not configured.",
      "backend",
    );
  },

  async finishRuntime() {
    throw new WorkoutRuntimeExperienceError(
      "Backend workout runtime provider is not configured.",
      "backend",
    );
  },
};
