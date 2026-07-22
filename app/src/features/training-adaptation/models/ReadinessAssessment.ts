import type { AdaptationReason } from "./AdaptationReason";
import type { ConstraintAssessment } from "./ConstraintAssessment";
import type { FatigueAssessment } from "./FatigueAssessment";
import type { RecoveryAssessment } from "./RecoveryAssessment";

/**
 * Current execution readiness for a progression plan.
 *
 * Contains recovery status, fatigue level, constraint summary,
 * execution confidence, and overall readiness score.
 *
 * No wearable integrations. No athlete history. No physiological calculations.
 * Domain representation only.
 */
export interface ReadinessAssessment {
  readonly recovery: RecoveryAssessment;
  readonly fatigue: FatigueAssessment;
  readonly constraints: ConstraintAssessment;
  /** Confidence that the plan can be executed as written (0–100). */
  readonly executionConfidence: number;
  /** Overall readiness score (0–100). */
  readonly overallScore: number;
  readonly reasons: readonly AdaptationReason[];
}
