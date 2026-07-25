import type { RecoveryAdaptation } from "./RecoveryAdaptation";
import type { RecoveryComparison } from "./RecoveryComparison";
import type { RecoveryDescriptor } from "./RecoveryDescriptor";
import type { RecoveryError } from "./RecoveryError";
import type { RecoveryPackage } from "./RecoveryPackage";
import type { RecoveryRuntimeInput } from "./RecoveryRuntimeInput";
import type { RecoverySnapshot } from "./RecoverySnapshot";
import type { RecoverySummary } from "./RecoverySummary";
import type { RecoveryValidation } from "./RecoveryValidation";
import type { UpdatedRecoveryPlan } from "./UpdatedRecoveryPlan";

export const RecoveryOperationKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type RecoveryOperationKind =
  (typeof RecoveryOperationKinds)[keyof typeof RecoveryOperationKinds];

export interface RecoveryResult {
  readonly id: string;
  readonly operation: RecoveryOperationKind;
  readonly success: boolean;
  readonly adaptation: RecoveryAdaptation | null;
  readonly updatedPlan: UpdatedRecoveryPlan | null;
  readonly runtimeInput: RecoveryRuntimeInput | null;
  readonly package: RecoveryPackage | null;
  readonly summary: RecoverySummary | null;
  readonly snapshot: RecoverySnapshot | null;
  readonly comparison: RecoveryComparison | null;
  readonly validation: RecoveryValidation | null;
  readonly descriptor: RecoveryDescriptor | null;
  readonly errors: readonly RecoveryError[];
  readonly createdAt: string;
}
