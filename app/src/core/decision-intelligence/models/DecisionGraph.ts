import type { DecisionEdge } from "./DecisionEdge";
import type { DecisionNode } from "./DecisionNode";

/**
 * Immutable directed graph of domain decisions for one generation.
 */
export interface DecisionGraph {
  readonly generationId: string;
  readonly nodes: readonly DecisionNode[];
  readonly edges: readonly DecisionEdge[];
  readonly rootIds: readonly string[];
}
