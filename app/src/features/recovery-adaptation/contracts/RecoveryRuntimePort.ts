export interface RecoveryRuntimePort {
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

export function createMockRecoveryRuntimePort(present = true): RecoveryRuntimePort {
  return {
    isRuntimePresent: () => present,
    loadRuntimeKeys(input) {
      return Object.freeze([
        `runtime:${input.runtimeId}`,
        "runtime:day",
        "runtime:state",
      ]);
    },
  };
}
