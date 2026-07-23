import type { RecoveryStatus } from "../../../coach-intelligence/models/RecoveryStatus";

/**
 * Athlete readiness and consistency state derived from coach intelligence.
 *
 * Structured evidence only — never natural language.
 */
export interface AthleteContext {
  readonly recovery: RecoveryStatus;
  /** Training consistency score in `[0, 1]`. */
  readonly consistencyScore: number;
}
