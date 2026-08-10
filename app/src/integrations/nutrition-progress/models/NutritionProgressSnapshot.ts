import type { NutritionProgressEventType } from "../events";

/** Immutable publisher snapshot — represent only. */
export interface NutritionProgressSnapshot {
  readonly publishedEventCount: number;
  readonly lastEventId: string | null;
  readonly lastEventType: NutritionProgressEventType | null;
  readonly capturedAt: string;
}

export function createNutritionProgressSnapshot(
  input: NutritionProgressSnapshot,
): NutritionProgressSnapshot {
  return Object.freeze({ ...input });
}
