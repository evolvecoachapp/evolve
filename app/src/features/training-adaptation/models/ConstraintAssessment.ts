import type { AdaptationReason } from "./AdaptationReason";

/**
 * Immutable summary of training constraints affecting adaptation.
 */
export interface ConstraintAssessment {
  readonly hardCount: number;
  readonly softCount: number;
  readonly blockingCodes: readonly string[];
  /** Higher means freer constraint space (0–100). */
  readonly score: number;
  readonly reasons: readonly AdaptationReason[];
}
