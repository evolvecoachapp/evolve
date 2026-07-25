/**
 * Upstream Coach Supervisor focus contract — no orchestration.
 */
export interface CoachSupervisorPort {
  describeSupervisorFocus(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focusAreas: readonly string[] = Object.freeze(["safety"]),
): CoachSupervisorPort {
  return {
    describeSupervisorFocus() {
      return Object.freeze([...focusAreas]);
    },
  };
}
