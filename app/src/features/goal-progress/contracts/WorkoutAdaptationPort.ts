export interface WorkoutAdaptationPort {
  loadWorkoutAdaptationKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockWorkoutAdaptationPort(
  focusAreas: readonly string[] = ["recovery", "training"],
): WorkoutAdaptationPort {
  return {
    loadWorkoutAdaptationKeys() {
      return Object.freeze([...focusAreas]);
    },
  };
}
