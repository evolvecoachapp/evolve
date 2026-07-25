import type { RecoveryAdaptation } from "./RecoveryAdaptation";
import type { RecoveryPackage } from "./RecoveryPackage";
import type { RecoveryRuntimeInput } from "./RecoveryRuntimeInput";
import type { RecoverySnapshot } from "./RecoverySnapshot";
import type { RecoverySummary } from "./RecoverySummary";
import type { UpdatedRecoveryPlan } from "./UpdatedRecoveryPlan";

export interface RecoveryAdaptationOutput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly adaptation: RecoveryAdaptation | null;
  readonly updatedPlan: UpdatedRecoveryPlan | null;
  readonly runtimeInput: RecoveryRuntimeInput | null;
  readonly package: RecoveryPackage | null;
  readonly summary: RecoverySummary | null;
  readonly snapshot: RecoverySnapshot | null;
  readonly createdAt: string;
}
