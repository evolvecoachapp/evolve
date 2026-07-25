export interface CoachSupervisorPort {
  loadSupervisorFocusAreas(input: {
    readonly athleteId: string;
    readonly contextId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focusAreas: readonly string[] = ["safety"],
): CoachSupervisorPort {
  return {
    loadSupervisorFocusAreas() {
      return Object.freeze([...focusAreas]);
    },
  };
}
