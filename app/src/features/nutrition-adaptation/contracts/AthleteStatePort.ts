export interface AthleteStatePort {
  isAthletePresent(input: { readonly athleteId: string; readonly at: string }): boolean;
  loadStateKeys(input: {
    readonly athleteId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockAthleteStatePort(present = true): AthleteStatePort {
  return {
    isAthletePresent: () => present,
    loadStateKeys(input) {
      return Object.freeze([
        `state:athlete:${input.athleteId}`,
        "state:adherence",
        "state:hydration",
        "state:recovery",
      ]);
    },
  };
}
