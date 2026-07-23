import type { RecoveryAssessment } from "./RecoveryAssessment";
import type { RecoveryIndicators } from "./RecoveryIndicators";
import type { RecoveryPlan } from "./RecoveryPlan";

/**
 * Thin immutable recovery snapshot for handoff / shared context.
 */
export interface RecoverySnapshot {
  readonly id: string;
  readonly assessment: RecoveryAssessment;
  readonly plan: RecoveryPlan | null;
  readonly indicators: RecoveryIndicators;
  readonly frozenAt: string;
}
