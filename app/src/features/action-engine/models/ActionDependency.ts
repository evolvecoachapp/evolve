/**
 * Immutable dependency edge between action steps.
 */
export interface ActionDependency {
  readonly id: string;
  readonly fromStepId: string;
  readonly toStepId: string;
  readonly kind: ActionDependencyKind;
}

export type ActionDependencyKind =
  | "requires"
  | "blocks"
  | "sequence"
  | "optional";

export const ActionDependencyKinds = Object.freeze({
  REQUIRES: "requires" as const,
  BLOCKS: "blocks" as const,
  SEQUENCE: "sequence" as const,
  OPTIONAL: "optional" as const,
});
