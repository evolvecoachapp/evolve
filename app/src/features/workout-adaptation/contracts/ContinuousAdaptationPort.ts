export interface ContinuousAdaptationPort {
  loadDecisionKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadDecisionIds(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContinuousAdaptationPort(): ContinuousAdaptationPort {
  return {
    loadDecisionKeys(input) {
      return Object.freeze([
        `decision:key:${input.athleteId}:volume`,
        `decision:key:${input.athleteId}:intensity`,
        "decision:key:progression",
      ]);
    },
    loadDecisionIds(input) {
      return Object.freeze([
        `adaptation:${input.athleteId}:1`,
        `adaptation:${input.athleteId}:2`,
      ]);
    },
  };
}
