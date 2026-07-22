import type { RecoveryAssessment } from "./RecoveryAssessment";
import type { RecoveryContext } from "./RecoveryContext";
import type { RecoveryMetrics } from "./RecoveryMetrics";
import type { RecoverySummary } from "./RecoverySummary";

/**
 * Immutable recovery snapshot — frozen analysis artifact.
 * No persistence. No recommendations. Deterministic metrics only.
 */
export interface RecoverySnapshot {
  readonly id: string;
  readonly context: RecoveryContext;
  readonly metrics: RecoveryMetrics;
  readonly assessment: RecoveryAssessment;
  readonly summary: RecoverySummary;
  readonly frozenAt: string;
}
