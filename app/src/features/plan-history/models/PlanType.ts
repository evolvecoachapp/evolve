/**
 * Plan domain discriminated by restore / history consumers.
 */
export const PlanTypes = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
} as const;

export type PlanType = (typeof PlanTypes)[keyof typeof PlanTypes];

export const ALL_PLAN_TYPES: readonly PlanType[] = Object.freeze(
  Object.values(PlanTypes),
);
