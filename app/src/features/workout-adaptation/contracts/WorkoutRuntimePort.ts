export interface WorkoutRuntimePort {
  isRuntimePresent(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): boolean;
  loadRuntimeKeys(input: {
    readonly athleteId: string;
    readonly runtimeId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockWorkoutRuntimePort(present = true): WorkoutRuntimePort {
  return {
    isRuntimePresent: () => present,
    loadRuntimeKeys(input) {
      return Object.freeze([
        `runtime:${input.runtimeId}`,
        "runtime:session",
        "runtime:state",
      ]);
    },
  };
}
