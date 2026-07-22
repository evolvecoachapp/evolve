import type { AdaptationReason } from "./AdaptationReason";

export type RecoveryStatus = "adequate" | "limited" | "insufficient";

export const RECOVERY_STATUSES = Object.freeze([
  "adequate",
  "limited",
  "insufficient",
] as const satisfies readonly RecoveryStatus[]);

/**
 * Immutable recovery readiness signal derived from plan structure.
 * No wearables. No sleep. No HRV. Domain representation only.
 */
export interface RecoveryAssessment {
  readonly status: RecoveryStatus;
  /** Higher is better recovery capacity (0–100). */
  readonly score: number;
  readonly reasons: readonly AdaptationReason[];
}
