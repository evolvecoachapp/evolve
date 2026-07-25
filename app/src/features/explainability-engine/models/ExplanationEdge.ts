import type { ExplanationMetadata } from "./ExplanationMetadata";

export const ExplanationEdgeKinds = {
  DERIVES_FROM: "derives_from",
  SUPPORTS: "supports",
  REFERENCES: "references",
  DEPENDS_ON: "depends_on",
} as const;

export type ExplanationEdgeKind =
  (typeof ExplanationEdgeKinds)[keyof typeof ExplanationEdgeKinds];

export interface ExplanationEdge {
  readonly id: string;
  readonly kind: ExplanationEdgeKind;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly metadata: ExplanationMetadata;
}
