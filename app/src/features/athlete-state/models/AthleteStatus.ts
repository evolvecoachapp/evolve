export const AthleteStatusKinds = {
  UNKNOWN: "unknown",
  ACTIVE: "active",
  INACTIVE: "inactive",
  RECOVERING: "recovering",
  CONSTRAINED: "constrained",
} as const;

export type AthleteStatusKind =
  (typeof AthleteStatusKinds)[keyof typeof AthleteStatusKinds];

/**
 * Immutable high-level athlete status (representation only).
 */
export interface AthleteStatus {
  readonly kind: AthleteStatusKind;
  readonly label: string | null;
  readonly notes: readonly string[];
}
