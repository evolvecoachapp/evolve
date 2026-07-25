export interface CoachContextPort {
  loadContextKeys(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
  loadFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockCoachContextPort(): CoachContextPort {
  return {
    loadContextKeys(input) {
      return Object.freeze([
        `context:${input.contextId}`,
        "context:focus:strength",
      ]);
    },
    loadFocusAreas() {
      return Object.freeze(["strength", "recovery"]);
    },
  };
}
