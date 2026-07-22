import type { RecoveryEvidence } from "./RecoveryEvidence";
import type { RecoveryIndicator } from "./RecoveryIndicator";
import type { RecoveryMetrics } from "./RecoveryMetrics";
import type { RecoveryStatus } from "./RecoveryStatus";

/**
 * Immutable recovery assessment derived from metrics.
 */
export interface RecoveryAssessment {
  readonly status: RecoveryStatus;
  readonly metrics: RecoveryMetrics;
  readonly indicators: readonly RecoveryIndicator[];
  readonly evidence: RecoveryEvidence;
  readonly assessedAt: string;
}
