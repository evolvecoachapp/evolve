export interface NutritionDayRuntimeState {
  readonly toggledMealIds: readonly string[];
  readonly hydrationMl: number;
}

/**
 * Persisted in-session nutrition runtime overlays keyed by ISO date (Sprint 35.4).
 */
export interface NutritionRuntimePersistenceState {
  readonly athleteId: string;
  readonly days: Readonly<Record<string, NutritionDayRuntimeState>>;
}

export function createNutritionDayRuntimeState(
  input: NutritionDayRuntimeState,
): NutritionDayRuntimeState {
  return Object.freeze({
    toggledMealIds: Object.freeze([...input.toggledMealIds]),
    hydrationMl: input.hydrationMl,
  });
}

export function createNutritionRuntimePersistenceState(
  input: NutritionRuntimePersistenceState,
): NutritionRuntimePersistenceState {
  return Object.freeze({
    athleteId: input.athleteId,
    days: Object.freeze({ ...input.days }),
  });
}
