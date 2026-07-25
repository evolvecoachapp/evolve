export interface NutritionPlanPort {
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
  loadMealKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadMacroKeys(input: {
    readonly athleteId: string;
    readonly planId: string;
    readonly at: string;
  }): readonly string[];
  loadTimingKeys(input: {
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

export function createMockNutritionPlanPort(present = true): NutritionPlanPort {
  return {
    isPlanPresent: () => present,
    loadPlanKeys(input) {
      return Object.freeze([
        `plan:${input.planId}`,
        "plan:structure",
        "plan:meal:breakfast",
      ]);
    },
    loadMealKeys(input) {
      return Object.freeze([
        `meal:${input.planId}:breakfast`,
        `meal:${input.planId}:lunch`,
        `meal:${input.planId}:dinner`,
      ]);
    },
    loadMacroKeys(input) {
      return Object.freeze([
        `macro:${input.planId}:protein`,
        `macro:${input.planId}:carbohydrate`,
        `macro:${input.planId}:fat`,
      ]);
    },
    loadTimingKeys(input) {
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
