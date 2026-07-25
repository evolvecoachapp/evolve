export interface NutritionRuntimePort {
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

export function createMockNutritionRuntimePort(present = true): NutritionRuntimePort {
  return {
    isRuntimePresent: () => present,
    loadRuntimeKeys(input) {
      return Object.freeze([
        `runtime:${input.runtimeId}`,
        "runtime:meal",
        "runtime:state",
      ]);
    },
  };
}
