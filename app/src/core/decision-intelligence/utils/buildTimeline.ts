import type { DecisionCategory } from "../models/DecisionCategory";
import { DECISION_CATEGORIES } from "../models/DecisionCategory";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionNode } from "../models/DecisionNode";
import type {
  DecisionTimeline,
  DecisionTimelineEntry,
} from "../models/DecisionTimeline";

/**
 * Build a chronological decision timeline from a graph.
 */
export function buildTimeline(graph: DecisionGraph): DecisionTimeline {
  const entries: DecisionTimelineEntry[] = [...graph.nodes]
    .sort((a, b) => {
      if (a.sequence !== b.sequence) {
        return a.sequence - b.sequence;
      }
      return a.id.localeCompare(b.id);
    })
    .map((node) =>
      Object.freeze({
        decisionId: node.id,
        sequence: node.sequence,
        category: node.category,
        summaryCode: node.summaryCode,
        pipelineStep: node.context.pipelineStep,
      }),
    );

  return Object.freeze({
    generationId: graph.generationId,
    entries: Object.freeze(entries),
  });
}

/**
 * Aggregate decision counts and confidence from nodes.
 */
export function aggregateDecisions(nodes: readonly DecisionNode[]): {
  readonly totalDecisions: number;
  readonly byCategory: Readonly<Record<DecisionCategory, number>>;
  readonly averageConfidence: number;
  readonly highSeverityCount: number;
} {
  const byCategory = Object.fromEntries(
    DECISION_CATEGORIES.map((category) => [category, 0]),
  ) as Record<DecisionCategory, number>;

  let confidenceSum = 0;
  let highSeverityCount = 0;

  for (const node of nodes) {
    byCategory[node.category] += 1;
    confidenceSum += node.confidence;
    if (node.severity === "high" || node.severity === "critical") {
      highSeverityCount += 1;
    }
  }

  const totalDecisions = nodes.length;
  const averageConfidence =
    totalDecisions === 0
      ? 0
      : Number((confidenceSum / totalDecisions).toFixed(4));

  return Object.freeze({
    totalDecisions,
    byCategory: Object.freeze({ ...byCategory }),
    averageConfidence,
    highSeverityCount,
  });
}
