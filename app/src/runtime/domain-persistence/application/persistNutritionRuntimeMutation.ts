import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  createNutritionDayRuntimeState,
  createNutritionRuntimePersistenceState,
  type NutritionDayRuntimeState,
  type NutritionRuntimePersistenceState,
} from "../models/NutritionRuntimePersistenceState";

export interface PersistNutritionRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly isoDate: string;
  readonly toggledMealIds: ReadonlySet<string>;
  readonly hydrationMl: number;
}

function mergeNutritionDayState(
  current: NutritionRuntimePersistenceState | null,
  athleteId: string,
  isoDate: string,
  dayState: NutritionDayRuntimeState,
): NutritionRuntimePersistenceState {
  return createNutritionRuntimePersistenceState({
    athleteId,
    days: Object.freeze({
      ...(current?.days ?? {}),
      [isoDate]: createNutritionDayRuntimeState(dayState),
    }),
  });
}

/**
 * Persists in-session nutrition runtime overlays through NutritionRuntimePersistenceService.build().
 */
export function persistNutritionRuntimeMutation(
  input: PersistNutritionRuntimeMutationInput,
): void {
  const service = getCompositionRoot().resolve("NutritionRuntimePersistenceService");
  const current = service.getState(input.athleteId);
  const next = mergeNutritionDayState(current, input.athleteId, input.isoDate, {
    toggledMealIds: Object.freeze([...input.toggledMealIds]),
    hydrationMl: input.hydrationMl,
  });

  service.build({
    athleteId: input.athleteId,
    requestId: input.requestId,
    state: next,
  });
}

export function readPersistedNutritionDayState(
  athleteId: string,
  isoDate: string,
): NutritionDayRuntimeState | null {
  const state = getCompositionRoot()
    .resolve("NutritionRuntimePersistenceService")
    .getState(athleteId);
  return state?.days[isoDate] ?? null;
}
