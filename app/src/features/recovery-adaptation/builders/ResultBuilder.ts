import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryComparison } from "../models/RecoveryComparison";
import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryPackage } from "../models/RecoveryPackage";
import type {
  RecoveryOperationKind,
  RecoveryResult,
} from "../models/RecoveryResult";
import type { RecoveryRuntimeInput } from "../models/RecoveryRuntimeInput";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoverySummary } from "../models/RecoverySummary";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";
import { freezeResult } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoveryResult(input: {
  readonly id: string;
  readonly operation: RecoveryOperationKind;
  readonly success: boolean;
  readonly adaptation?: RecoveryAdaptation | null;
  readonly updatedPlan?: UpdatedRecoveryPlan | null;
  readonly runtimeInput?: RecoveryRuntimeInput | null;
  readonly package?: RecoveryPackage | null;
  readonly summary?: RecoverySummary | null;
  readonly snapshot?: RecoverySnapshot | null;
  readonly comparison?: RecoveryComparison | null;
  readonly validation?: RecoveryValidation | null;
  readonly descriptor?: RecoveryDescriptor | null;
  readonly errors?: readonly RecoveryError[];
  readonly createdAt: string;
}): RecoveryResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    adaptation: input.adaptation ?? null,
    updatedPlan: input.updatedPlan ?? null,
    runtimeInput: input.runtimeInput ?? null,
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    comparison: input.comparison ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
