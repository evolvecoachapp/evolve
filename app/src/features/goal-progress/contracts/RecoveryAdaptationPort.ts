export interface RecoveryAdaptationPort {
  loadRecoveryAdaptationKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockRecoveryAdaptationPort(
  keys: readonly string[] = ["recovery:sleep", "recovery:readiness"],
): RecoveryAdaptationPort {
  return {
    loadRecoveryAdaptationKeys() {
      return Object.freeze([...keys]);
    },
  };
}
