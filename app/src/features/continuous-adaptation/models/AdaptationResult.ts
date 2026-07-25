import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationDescriptor } from "./AdaptationDescriptor";
import type { AdaptationError } from "./AdaptationError";
import type { AdaptationPackage } from "./AdaptationPackage";
import type { AdaptationSnapshot } from "./AdaptationSnapshot";
import type { AdaptationSummary } from "./AdaptationSummary";
import type { AdaptationValidation } from "./AdaptationValidation";
import type { GoalProgressInput } from "./GoalProgressInput";
import type { NutritionAdaptationInput } from "./NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "./RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "./WorkoutAdaptationInput";

export const AdaptationOperationKinds = {
  EVALUATE: "evaluate",
  DETECT: "detect",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type AdaptationOperationKind =
  (typeof AdaptationOperationKinds)[keyof typeof AdaptationOperationKinds];

export interface AdaptationResult {
  readonly id: string;
  readonly operation: AdaptationOperationKind;
  readonly success: boolean;
  readonly decisions: readonly AdaptationDecision[];
  readonly package: AdaptationPackage | null;
  readonly summary: AdaptationSummary | null;
  readonly snapshot: AdaptationSnapshot | null;
  readonly workoutAdaptationInput: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput: RecoveryAdaptationInput | null;
  readonly goalProgressInput: GoalProgressInput | null;
  readonly validation: AdaptationValidation | null;
  readonly descriptor: AdaptationDescriptor | null;
  readonly errors: readonly AdaptationError[];
  readonly createdAt: string;
}
