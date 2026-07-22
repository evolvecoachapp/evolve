/**
 * Directed relationship between two decision nodes.
 */
export type DecisionEdgeKind =
  | "depends_on"
  | "derived_from"
  | "supports"
  | "overrides"
  | "sequence";

export interface DecisionEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: DecisionEdgeKind;
  readonly reasonCode: string | null;
}
