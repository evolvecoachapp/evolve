import type { CoachingExplanation } from "../models/CoachingExplanation";
import { ExplanationEdgeKinds } from "../models/ExplanationEdge";
import { ExplanationNodeKinds } from "../models/ExplanationNode";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEdge, freezeGraph, freezeNode } from "../utils/FreezeExplanationState";

export function buildExplanationGraph(input: {
  readonly id: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly at: string;
}): ExplanationGraph {
  const nodes = [];
  const edges = [];
  for (const e of input.explanations) {
    nodes.push(freezeNode({ id: `node:rec:${e.recommendationId}`, kind: ExplanationNodeKinds.RECOMMENDATION, subjectId: e.recommendationId, labelKey: `recommendation.${e.recommendationLink.category}`, metadata: EMPTY_EXPLANATION_METADATA }));
    nodes.push(freezeNode({ id: `node:dec:${e.decisionId}`, kind: ExplanationNodeKinds.DECISION, subjectId: e.decisionId, labelKey: `decision.${e.decisionLink.category}`, metadata: EMPTY_EXPLANATION_METADATA }));
    edges.push(freezeEdge({ id: `edge:${e.id}:derives`, kind: ExplanationEdgeKinds.DERIVES_FROM, fromNodeId: `node:dec:${e.decisionId}`, toNodeId: `node:rec:${e.recommendationId}`, metadata: EMPTY_EXPLANATION_METADATA }));
    for (const r of e.reasons) {
      nodes.push(freezeNode({ id: `node:reason:${r.id}`, kind: ExplanationNodeKinds.REASON, subjectId: r.subjectId, labelKey: r.statementKey, metadata: EMPTY_EXPLANATION_METADATA }));
      edges.push(freezeEdge({ id: `edge:${r.id}:supports`, kind: ExplanationEdgeKinds.SUPPORTS, fromNodeId: `node:reason:${r.id}`, toNodeId: `node:rec:${e.recommendationId}`, metadata: EMPTY_EXPLANATION_METADATA }));
    }
  }
  return freezeGraph({ id: input.id, nodes: Object.freeze(nodes), edges: Object.freeze(edges), metadata: EMPTY_EXPLANATION_METADATA, createdAt: input.at });
}
