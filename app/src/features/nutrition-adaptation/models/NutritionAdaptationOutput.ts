import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionPackage } from "./NutritionPackage";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionSummary } from "./NutritionSummary";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export interface NutritionAdaptationOutput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly package: NutritionPackage | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly createdAt: string;
}
