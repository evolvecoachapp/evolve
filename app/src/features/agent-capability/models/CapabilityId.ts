/**
 * Capability identifier — Coach reasons in capabilities, not concrete agents.
 */
export type CapabilityId = string;

/**
 * Well-known capability identifiers (foundation catalog; not exhaustive).
 */
export const WellKnownCapabilityIds = {
  GENERATE_WORKOUT: "GenerateWorkout",
  ANALYZE_NUTRITION: "AnalyzeNutrition",
  EVALUATE_RECOVERY: "EvaluateRecovery",
} as const;

export type WellKnownCapabilityId =
  (typeof WellKnownCapabilityIds)[keyof typeof WellKnownCapabilityIds];

export const ALL_WELL_KNOWN_CAPABILITY_IDS: readonly WellKnownCapabilityId[] =
  Object.freeze(Object.values(WellKnownCapabilityIds));
