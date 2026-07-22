import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionNode } from "../models/DecisionNode";
import type {
  DecisionExplanation,
  DecisionExplanationStyle,
  ExplanationReport,
} from "../models/DecisionExplanation";
import { freezeExplanationReport } from "../utils/freezeReports";

function reasonCodes(node: DecisionNode): readonly string[] {
  return Object.freeze([
    node.summaryCode,
    ...node.reasons.map((reason) => reason.code),
  ]);
}

function formatReasons(node: DecisionNode): string {
  if (node.reasons.length === 0) {
    return "no explicit reasons";
  }
  return node.reasons
    .map((reason) =>
      reason.detail ? `${reason.code}(${reason.detail})` : reason.code,
    )
    .join(", ");
}

function formatEvidence(node: DecisionNode): string {
  if (node.evidence.length === 0) {
    return "none";
  }
  return node.evidence
    .map((item) => `${item.code}=${String(item.value)}`)
    .join(", ");
}

function buildText(
  node: DecisionNode,
  style: DecisionExplanationStyle,
): string {
  switch (style) {
    case "human":
      return `${node.title}: ${formatReasons(node)} (confidence ${(node.confidence * 100).toFixed(0)}%).`;
    case "developer":
      return `[${node.category}/${node.severity}] ${node.id} summary=${node.summaryCode} parents=[${node.parentIds.join("|") || "-"}] reasons=[${formatReasons(node)}] evidence=[${formatEvidence(node)}] confidence=${node.confidence}`;
    case "compact":
      return `${node.summaryCode}@${node.category}`;
    case "detailed":
      return [
        `Decision ${node.id}`,
        `Category: ${node.category}`,
        `Title: ${node.title}`,
        `Summary: ${node.summaryCode}`,
        `Severity: ${node.severity}`,
        `Confidence: ${node.confidence}`,
        `Stage: ${node.context.stage}`,
        `Pipeline step: ${node.context.pipelineStep ?? "n/a"}`,
        `Parents: ${node.parentIds.join(", ") || "none"}`,
        `Reasons: ${formatReasons(node)}`,
        `Evidence: ${formatEvidence(node)}`,
        `Tags: ${node.metadata.tags.join(", ") || "none"}`,
      ].join("\n");
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

function explainNode(
  node: DecisionNode,
  style: DecisionExplanationStyle,
): DecisionExplanation {
  return Object.freeze({
    decisionId: node.id,
    style,
    text: buildText(node, style),
    codes: reasonCodes(node),
  });
}

/**
 * Template-based explanation builder — no AI.
 */
export class ExplanationBuilder {
  explainDecision(
    node: DecisionNode,
    style: DecisionExplanationStyle = "human",
  ): DecisionExplanation {
    return explainNode(node, style);
  }

  explainAll(
    graph: DecisionGraph,
    style: DecisionExplanationStyle = "human",
  ): readonly DecisionExplanation[] {
    return Object.freeze(
      graph.nodes.map((node) => explainNode(node, style)),
    );
  }

  buildReport(graph: DecisionGraph): ExplanationReport {
    const human = this.explainAll(graph, "human");
    const developer = this.explainAll(graph, "developer");
    const compact = this.explainAll(graph, "compact");
    const detailed = this.explainAll(graph, "detailed");

    const byCategory = new Map<string, number>();
    for (const node of graph.nodes) {
      byCategory.set(node.category, (byCategory.get(node.category) ?? 0) + 1);
    }
    const categorySummary = Array.from(byCategory.entries())
      .map(([category, count]) => `${category}:${count}`)
      .join(", ");

    const summaryText =
      graph.nodes.length === 0
        ? `No domain decisions recorded for ${graph.generationId}.`
        : `Recorded ${graph.nodes.length} domain decisions for ${graph.generationId} (${categorySummary}).`;

    return freezeExplanationReport({
      generationId: graph.generationId,
      human,
      developer,
      compact,
      detailed,
      summaryText,
    });
  }
}
