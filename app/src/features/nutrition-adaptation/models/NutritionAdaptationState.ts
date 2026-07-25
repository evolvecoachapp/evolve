import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionPackage } from "./NutritionPackage";

export const NutritionSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type NutritionSessionStatus =
  (typeof NutritionSessionStatuses)[keyof typeof NutritionSessionStatuses];

export interface NutritionAdaptationState {
  readonly status: NutritionSessionStatus;
  readonly package: NutritionPackage | null;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedAt: string;
}
