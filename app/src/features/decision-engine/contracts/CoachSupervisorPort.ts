/**
 * Coach Supervisor contract — coordination flags only (no orchestration here).
 */
export interface CoachSupervisorPort {
  describeSupervisorFocus(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
  }): readonly string[];
}

export function createMockCoachSupervisorPort(
  focus: readonly string[] = Object.freeze(["orchestration"]),
): CoachSupervisorPort {
  return {
    describeSupervisorFocus() {
      return Object.freeze([...focus]);
    },
  };
}
