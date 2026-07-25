import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryComparison } from "../models/RecoveryComparison";
import type { RecoveryDiagnostics } from "../models/RecoveryDiagnostics";
import type { RecoveryHistory } from "../models/RecoveryHistory";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import type { RecoveryPackage } from "../models/RecoveryPackage";
import type { RecoveryRuntimeInput } from "../models/RecoveryRuntimeInput";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoveryStatistics } from "../models/RecoveryStatistics";
import type { RecoverySummary } from "../models/RecoverySummary";
import type { RecoveryTimeline } from "../models/RecoveryTimeline";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";
import { freezeDiagnostics, freezePackage } from "../utils/FreezeRecoveryAdaptation";

export function buildRecoveryPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptation: RecoveryAdaptation | null;
  readonly updatedPlan: UpdatedRecoveryPlan | null;
  readonly runtimeInput: RecoveryRuntimeInput | null;
  readonly summary: RecoverySummary | null;
  readonly snapshot: RecoverySnapshot | null;
  readonly comparison: RecoveryComparison | null;
  readonly timeline: RecoveryTimeline | null;
  readonly history: RecoveryHistory | null;
  readonly statistics: RecoveryStatistics;
  readonly processingSteps: readonly string[];
  readonly at: string;
}): RecoveryPackage {
  const diagnostics: RecoveryDiagnostics = freezeDiagnostics({
    notes: Object.freeze(["recovery_adaptation_pipeline"]),
    warnings: Object.freeze([] as string[]),
    processingSteps: Object.freeze([...input.processingSteps]),
  });
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    adaptation: input.adaptation,
    updatedPlan: input.updatedPlan,
    runtimeInput: input.runtimeInput,
    summary: input.summary,
    snapshot: input.snapshot,
    comparison: input.comparison,
    timeline: input.timeline,
    history: input.history,
    statistics: input.statistics,
    diagnostics,
    metadata: EMPTY_RECOVERY_METADATA,
    createdAt: input.at,
  });
}
