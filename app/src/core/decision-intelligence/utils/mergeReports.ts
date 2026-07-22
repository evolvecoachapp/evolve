import type { DecisionReport } from "../models/DecisionReport";
import type { DecisionSummary } from "../models/DecisionReport";
import type { ExplanationReport } from "../models/DecisionExplanation";
import { DECISION_CATEGORIES } from "../models/DecisionCategory";
import type { DecisionCategory } from "../models/DecisionCategory";
import { normalizeGraph } from "./normalizeGraph";
import { freezeDecisionReport } from "./freezeReports";

function emptyByCategory(): Record<DecisionCategory, number> {
  return Object.fromEntries(
    DECISION_CATEGORIES.map((category) => [category, 0]),
  ) as Record<DecisionCategory, number>;
}

function mergeSummaries(
  summaries: readonly DecisionSummary[],
): DecisionSummary {
  const byCategory = emptyByCategory();
  let totalDecisions = 0;
  let confidenceWeighted = 0;
  let highSeverityCount = 0;
  let rootCount = 0;
  let edgeCount = 0;

  for (const summary of summaries) {
    totalDecisions += summary.totalDecisions;
    confidenceWeighted += summary.averageConfidence * summary.totalDecisions;
    highSeverityCount += summary.highSeverityCount;
    rootCount += summary.rootCount;
    edgeCount += summary.edgeCount;
    for (const category of DECISION_CATEGORIES) {
      byCategory[category] += summary.byCategory[category];
    }
  }

  return Object.freeze({
    totalDecisions,
    byCategory: Object.freeze({ ...byCategory }),
    averageConfidence:
      totalDecisions === 0
        ? 0
        : Number((confidenceWeighted / totalDecisions).toFixed(4)),
    highSeverityCount,
    rootCount,
    edgeCount,
  });
}

function mergeExplanations(
  generationId: string,
  reports: readonly ExplanationReport[],
): ExplanationReport {
  return Object.freeze({
    generationId,
    human: Object.freeze(reports.flatMap((report) => report.human)),
    developer: Object.freeze(reports.flatMap((report) => report.developer)),
    compact: Object.freeze(reports.flatMap((report) => report.compact)),
    detailed: Object.freeze(reports.flatMap((report) => report.detailed)),
    summaryText: reports.map((report) => report.summaryText).join(" | "),
  });
}

/**
 * Merge multiple decision reports into one structural aggregate.
 * Nodes/edges are concatenated; ids are assumed unique by caller.
 */
export function mergeReports(
  reports: readonly DecisionReport[],
  options?: { readonly generationId?: string; readonly createdAt?: string },
): DecisionReport {
  if (reports.length === 0) {
    throw new Error("mergeReports requires at least one DecisionReport");
  }

  const generationId =
    options?.generationId ?? reports[0]!.generationId;
  const createdAt = options?.createdAt ?? reports[0]!.createdAt;

  const nodes = Object.freeze(reports.flatMap((report) => report.graph.nodes));
  const edges = Object.freeze(reports.flatMap((report) => report.graph.edges));
  const graph = normalizeGraph({
    generationId,
    nodes,
    edges,
    rootIds: Object.freeze([]),
  });

  return freezeDecisionReport({
    reportId: `decision-report:merged:${generationId}`,
    generationId,
    graph,
    timeline: Object.freeze({
      generationId,
      entries: Object.freeze(
        reports.flatMap((report) => report.timeline.entries),
      ),
    }),
    summary: mergeSummaries(reports.map((report) => report.summary)),
    explanations: mergeExplanations(
      generationId,
      reports.map((report) => report.explanations),
    ),
    validationIssues: Object.freeze(
      Array.from(
        new Set(reports.flatMap((report) => report.validationIssues)),
      ),
    ),
    createdAt,
  });
}
