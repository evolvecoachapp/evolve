/**
 * Deterministic restore validation outcome.
 */
export interface PlanRestoreValidation {
  readonly valid: boolean;
  readonly snapshotExists: boolean;
  readonly snapshotIntegrity: boolean;
  readonly compatiblePlanType: boolean;
  readonly historyConsistency: boolean;
  readonly targetVersionExists: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
