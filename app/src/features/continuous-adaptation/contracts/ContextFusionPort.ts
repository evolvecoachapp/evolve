export interface ContextFusionPort {
  loadFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContextFusionPort(
  focusAreas: readonly string[] = ["recovery", "training"],
): ContextFusionPort {
  return {
    loadFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
