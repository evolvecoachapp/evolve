import type { ContinuousAdaptationInput } from "./ContinuousAdaptationInput";
import type { GoalDescriptor } from "./GoalDescriptor";
import type { GoalError } from "./GoalError";
import type { GoalPackage } from "./GoalPackage";
import type { GoalProgress } from "./GoalProgress";
import type { GoalSnapshot } from "./GoalSnapshot";
import type { GoalSummary } from "./GoalSummary";
import type { GoalValidation } from "./GoalValidation";

export const GoalOperationKinds = {
  EVALUATE: "evaluate",
  TRACK: "track",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type GoalOperationKind =
  (typeof GoalOperationKinds)[keyof typeof GoalOperationKinds];

export interface GoalResult {
  readonly id: string;
  readonly operation: GoalOperationKind;
  readonly success: boolean;
  readonly decisions: readonly GoalProgress[];
  readonly package: GoalPackage | null;
  readonly summary: GoalSummary | null;
  readonly snapshot: GoalSnapshot | null;
  readonly continuousAdaptationInput: ContinuousAdaptationInput | null;
  readonly validation: GoalValidation | null;
  readonly descriptor: GoalDescriptor | null;
  readonly errors: readonly GoalError[];
  readonly createdAt: string;
}
