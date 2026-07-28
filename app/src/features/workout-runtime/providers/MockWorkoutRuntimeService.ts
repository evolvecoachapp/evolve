import {
  emptyWorkoutRuntimeData,
  mockWorkoutRuntimeData,
} from "../mocks/workoutRuntimeData";
import type { WorkoutRuntimeDto } from "../types/workoutRuntimeDto";
import type { WorkoutRuntimeExperienceService } from "../types/workoutRuntimeService";

let seed: WorkoutRuntimeDto = mockWorkoutRuntimeData;
let finishedNotes: string | null = null;

/** Test helper — reset mock provider seed. */
export function resetMockWorkoutRuntimeSeed(
  next: WorkoutRuntimeDto = mockWorkoutRuntimeData,
): void {
  seed = next;
  finishedNotes = null;
}

/** Test helper — last finished notes captured by mock provider. */
export function getMockFinishedNotes(): string | null {
  return finishedNotes;
}

export const mockWorkoutRuntimeService: WorkoutRuntimeExperienceService = {
  providerId: "mock",

  async getRuntime(): Promise<WorkoutRuntimeDto> {
    return {
      ...seed,
      exercises: seed.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      })),
    };
  },

  async finishRuntime(input): Promise<void> {
    finishedNotes = input.sessionNotes;
  },
};

export const emptyMockWorkoutRuntimeService: WorkoutRuntimeExperienceService = {
  providerId: "mock",

  async getRuntime(): Promise<WorkoutRuntimeDto> {
    return { ...emptyWorkoutRuntimeData, exercises: [] };
  },

  async finishRuntime(): Promise<void> {
    /* no-op */
  },
};
