import type { RecoveryAssessment } from "./RecoveryAssessment";
import type { RecoverySnapshot } from "./RecoverySnapshot";
import type { RecoverySummary } from "./RecoverySummary";

/**
 * Public result of the Recovery Intelligence Engine.
 */
export interface RecoveryEngineResult {
  readonly snapshot: RecoverySnapshot;
  readonly assessment: RecoveryAssessment;
  readonly summary: RecoverySummary;
  readonly validationIssues: readonly string[];
}
