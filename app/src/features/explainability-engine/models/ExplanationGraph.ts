import type { ExplanationEdge } from "./ExplanationEdge";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationNode } from "./ExplanationNode";

export interface ExplanationGraph {
  readonly id: string;
  readonly nodes: readonly ExplanationNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
