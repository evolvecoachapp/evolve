import type { RecoveryAdaptation } from "./RecoveryAdaptation";
import type { RecoveryComparison } from "./RecoveryComparison";
import type { RecoveryDiagnostics } from "./RecoveryDiagnostics";
import type { RecoveryHistory } from "./RecoveryHistory";
import type { RecoveryMetadata } from "./RecoveryMetadata";
import type { RecoveryRuntimeInput } from "./RecoveryRuntimeInput";
import type { RecoverySnapshot } from "./RecoverySnapshot";
import type { RecoveryStatistics } from "./RecoveryStatistics";
import type { RecoverySummary } from "./RecoverySummary";
import type { RecoveryTimeline } from "./RecoveryTimeline";
import type { UpdatedRecoveryPlan } from "./UpdatedRecoveryPlan";

export interface RecoveryPackage {
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
  readonly diagnostics: RecoveryDiagnostics;
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
