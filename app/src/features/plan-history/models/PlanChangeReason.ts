/**
 * Why a plan version was published into immutable history.
 */
export const PlanChangeReasons = {
  INITIAL: "initial",
  GENERATED: "generated",
  MODIFIED: "modified",
  RESTORED: "restored",
  ADAPTED: "adapted",
  MANUAL: "manual",
} as const;

export type PlanChangeReason =
  (typeof PlanChangeReasons)[keyof typeof PlanChangeReasons];

export const ALL_PLAN_CHANGE_REASONS: readonly PlanChangeReason[] =
  Object.freeze(Object.values(PlanChangeReasons));
