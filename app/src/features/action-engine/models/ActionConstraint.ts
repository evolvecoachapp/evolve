/**
 * Immutable planning constraint on an action or plan.
 */
export interface ActionConstraint {
  readonly id: string;
  readonly kind: ActionConstraintKind;
  readonly description: string;
  readonly value: string | number | boolean | null;
}

export type ActionConstraintKind =
  | "max_steps"
  | "requires_target"
  | "requires_dependency"
  | "priority_floor"
  | "safety"
  | "custom";

export const ActionConstraintKinds = Object.freeze({
  MAX_STEPS: "max_steps" as const,
  REQUIRES_TARGET: "requires_target" as const,
  REQUIRES_DEPENDENCY: "requires_dependency" as const,
  PRIORITY_FLOOR: "priority_floor" as const,
  SAFETY: "safety" as const,
  CUSTOM: "custom" as const,
});
