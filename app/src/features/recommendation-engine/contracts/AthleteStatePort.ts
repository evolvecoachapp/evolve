/**
 * Upstream Athlete State presence contract — no domain calculations.
 */
export interface AthleteStatePort {
  isAthletePresent(input: {
    readonly athleteId: string;
    readonly at: string;
  }): boolean;
}

export function createMockAthleteStatePort(
  present = true,
): AthleteStatePort {
  return {
    isAthletePresent() {
      return present;
    },
  };
}
