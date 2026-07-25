/**
 * Upstream Context Fusion presence / focus contract — no fusion logic.
 */
export interface ContextFusionPort {
  describeFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockContextFusionPort(
  focusAreas: readonly string[] = Object.freeze(["training", "recovery"]),
): ContextFusionPort {
  return {
    describeFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
