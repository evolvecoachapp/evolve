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
        `decision:key:${input.athleteId}:calorie`,
        `decision:key:${input.athleteId}:macro`,
        "decision:key:hydration",
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
