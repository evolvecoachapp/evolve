import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionDependencyKinds = {
  REQUIRES: "requires",
  BLOCKS: "blocks",
  FOLLOWS: "follows",
  RELATED: "related",
} as const;

export type DecisionDependencyKind =
  (typeof DecisionDependencyKinds)[keyof typeof DecisionDependencyKinds];

/**
 * Immutable dependency edge between decision candidates / steps.
 */
export interface DecisionDependency {
  readonly id: string;
  readonly kind: DecisionDependencyKind;
  readonly fromId: string;
  readonly toId: string;
  readonly required: boolean;
  readonly metadata: DecisionMetadata;
}
