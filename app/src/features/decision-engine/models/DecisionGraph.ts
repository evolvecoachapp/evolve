import type { DecisionMetadata } from "./DecisionMetadata";

export interface DecisionGraphNode {
  readonly id: string;
  readonly kind: "candidate" | "decision" | "step" | "constraint";
  readonly label: string;
  readonly category: string;
}

export interface DecisionGraphEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
}

/**
 * Immutable decision graph — structure only.
 */
export interface DecisionGraph {
  readonly id: string;
  readonly nodes: readonly DecisionGraphNode[];
  readonly edges: readonly DecisionGraphEdge[];
  readonly roots: readonly string[];
  readonly leaves: readonly string[];
  readonly metadata: DecisionMetadata;
}
