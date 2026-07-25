export interface RecoveryPlanPort {
  isPlanPresent(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): boolean;
  loadPlanKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadSleepKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadProtocolKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadMobilityKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadWeekKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadDayKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockRecoveryPlanPort(present = true): RecoveryPlanPort {
  return {
    isPlanPresent: () => present,
    loadPlanKeys(input) {
      return Object.freeze([
        `plan:${input.planId}`,
        "plan:structure",
        "plan:day:breakfast",
      ]);
    },
    loadSleepKeys(input) {
      return Object.freeze([
        `day:${input.planId}:breakfast`,
        `day:${input.planId}:lunch`,
        `day:${input.planId}:dinner`,
      ]);
    },
    loadProtocolKeys(input) {
      return Object.freeze([
        `protocol:${input.planId}:fatigue`,
        `protocol:${input.planId}:readiness`,
        `protocol:${input.planId}:fat`,
      ]);
    },
    loadMobilityKeys(input) {
      return Object.freeze([
        `timing:${input.planId}:pre`,
        `timing:${input.planId}:post`,
      ]);
    },
    loadWeekKeys(input) {
      return Object.freeze([`week:${input.planId}:1`, `week:${input.planId}:2`]);
    },
    loadDayKeys(input) {
      return Object.freeze([`day:${input.planId}:1`, `day:${input.planId}:2`]);
    },
  };
}
