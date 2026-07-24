/**
 * Immutable constraints slice.
 */
export interface AthleteConstraints {
  readonly injuries: readonly string[];
  readonly equipmentLimits: readonly string[];
  readonly scheduleLimits: readonly string[];
  readonly medicalFlags: readonly string[];
  readonly notes: readonly string[];
}
