import type { NutritionAdaptation } from "./NutritionAdaptation";
import type { NutritionComparison } from "./NutritionComparison";
import type { NutritionDescriptor } from "./NutritionDescriptor";
import type { NutritionError } from "./NutritionError";
import type { NutritionPackage } from "./NutritionPackage";
import type { NutritionRuntimeInput } from "./NutritionRuntimeInput";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { NutritionSummary } from "./NutritionSummary";
import type { NutritionValidation } from "./NutritionValidation";
import type { UpdatedNutritionPlan } from "./UpdatedNutritionPlan";

export const NutritionOperationKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type NutritionOperationKind =
  (typeof NutritionOperationKinds)[keyof typeof NutritionOperationKinds];

export interface NutritionResult {
  readonly id: string;
  readonly operation: NutritionOperationKind;
  readonly success: boolean;
  readonly adaptation: NutritionAdaptation | null;
  readonly updatedPlan: UpdatedNutritionPlan | null;
  readonly runtimeInput: NutritionRuntimeInput | null;
  readonly package: NutritionPackage | null;
  readonly summary: NutritionSummary | null;
  readonly snapshot: NutritionSnapshot | null;
  readonly comparison: NutritionComparison | null;
  readonly validation: NutritionValidation | null;
  readonly descriptor: NutritionDescriptor | null;
  readonly errors: readonly NutritionError[];
  readonly createdAt: string;
}
