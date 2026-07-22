import { isValidDecisionConfidence } from "../models/DecisionConfidence";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionTimeline } from "../models/DecisionTimeline";

/**
 * Validate decision graph structural consistency.
 */
export function validateDecisionGraph(graph: DecisionGraph): readonly string[] {
  const issues: string[] = [];
  const nodeIds = new Set<string>();

  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push(`duplicate_decision:${node.id}`);
    }
    nodeIds.add(node.id);

    if (!isValidDecisionConfidence(node.confidence)) {
      issues.push(`invalid_confidence:${node.id}:${node.confidence}`);
    }
  }

  for (const node of graph.nodes) {
    for (const parentId of node.parentIds) {
      if (!nodeIds.has(parentId)) {
        issues.push(`missing_parent:${node.id}:${parentId}`);
      }
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push(`duplicate_edge:${edge.id}`);
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.fromId) || !nodeIds.has(edge.toId)) {
      issues.push(`invalid_edge:${edge.id}:${edge.fromId}->${edge.toId}`);
    }
  }

  for (const node of graph.nodes) {
    const hasParent = node.parentIds.length > 0;
    const isRoot = graph.rootIds.includes(node.id);
    const hasIncoming = graph.edges.some((edge) => edge.toId === node.id);

    if (!hasParent && !isRoot && !hasIncoming && graph.nodes.length > 1) {
      issues.push(`orphan_node:${node.id}`);
    }
  }

  for (const rootId of graph.rootIds) {
    if (!nodeIds.has(rootId)) {
      issues.push(`invalid_root:${rootId}`);
    }
  }

  return Object.freeze(Array.from(new Set(issues)));
}

/**
 * Validate timeline consistency against a graph.
 */
export function validateDecisionTimeline(
  timeline: DecisionTimeline,
  graph: DecisionGraph,
): readonly string[] {
  const issues: string[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  if (timeline.generationId !== graph.generationId) {
    issues.push(
      `timeline_generation_mismatch:${timeline.generationId}:${graph.generationId}`,
    );
  }

  let previousSequence = Number.NEGATIVE_INFINITY;
  const seen = new Set<string>();

  for (const entry of timeline.entries) {
    if (!nodeIds.has(entry.decisionId)) {
      issues.push(`timeline_unknown_decision:${entry.decisionId}`);
    }
    if (seen.has(entry.decisionId)) {
      issues.push(`timeline_duplicate:${entry.decisionId}`);
    }
    seen.add(entry.decisionId);

    if (entry.sequence < previousSequence) {
      issues.push(
        `timeline_out_of_order:${entry.decisionId}:${entry.sequence}`,
      );
    }
    previousSequence = entry.sequence;
  }

  for (const node of graph.nodes) {
    if (!seen.has(node.id)) {
      issues.push(`timeline_missing_decision:${node.id}`);
    }
  }

  return Object.freeze(issues);
}

/**
 * Validate confidence values across a graph.
 */
export function validateDecisionConfidence(
  graph: DecisionGraph,
): readonly string[] {
  const issues: string[] = [];
  for (const node of graph.nodes) {
    if (!isValidDecisionConfidence(node.confidence)) {
      issues.push(`invalid_confidence:${node.id}:${node.confidence}`);
    }
  }
  return Object.freeze(issues);
}
