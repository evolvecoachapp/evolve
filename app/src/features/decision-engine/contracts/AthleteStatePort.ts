/**
 * Upstream Athlete State Engine contract — facts presence only.
 */
export interface AthleteStatePort {
  hasAthleteState(input: {
    readonly athleteId: string;
  }): boolean;
}

export function createMockAthleteStatePort(
  present = true,
): AthleteStatePort {
  return {
    hasAthleteState() {
      return present;
    },
  };
}
