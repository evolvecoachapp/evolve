export interface WorkoutBlueprintPort {
  isBlueprintPresent(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): boolean;
  loadBlueprintKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadExerciseKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadSessionKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadWeekKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
  loadDayKeys(input: {
    readonly athleteId: string;
    readonly blueprintId: string;
    readonly at: string;
  }): readonly string[];
}

export function createMockWorkoutBlueprintPort(present = true): WorkoutBlueprintPort {
  return {
    isBlueprintPresent: () => present,
    loadBlueprintKeys(input) {
      return Object.freeze([
        `blueprint:${input.blueprintId}`,
        "blueprint:structure",
        "blueprint:session:a",
      ]);
    },
    loadExerciseKeys(input) {
      return Object.freeze([
        `exercise:${input.blueprintId}:squat`,
        `exercise:${input.blueprintId}:bench`,
      ]);
    },
    loadSessionKeys(input) {
      return Object.freeze([`session:${input.blueprintId}:a`, `session:${input.blueprintId}:b`]);
    },
    loadWeekKeys(input) {
      return Object.freeze([`week:${input.blueprintId}:1`, `week:${input.blueprintId}:2`]);
    },
    loadDayKeys(input) {
      return Object.freeze([`day:${input.blueprintId}:1`, `day:${input.blueprintId}:2`]);
    },
  };
}
