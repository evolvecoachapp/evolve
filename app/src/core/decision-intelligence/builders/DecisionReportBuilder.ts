import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionReport } from "../models/DecisionReport";
import { ExplanationBuilder } from "./ExplanationBuilder";
import { aggregateDecisions, buildTimeline } from "../utils/buildTimeline";
import { freezeDecisionReport } from "../utils/freezeReports";
import { normalizeGraph } from "../utils/normalizeGraph";
import {
  validateDecisionConfidence,
  validateDecisionGraph,
  validateDecisionTimeline,
} from "../validators";

export interface BuildDecisionReportOptions {
  readonly reportId?: string;
  readonly createdAt?: string;
  readonly explanationBuilder?: ExplanationBuilder;
}

const FIXED_DECISION_TIMESTAMP = "2026-01-01T00:00:00.000Z";

/**
 * Build an immutable DecisionReport from a DecisionGraph.
 */
export class DecisionReportBuilder {
  constructor(
    private readonly explanationBuilder: ExplanationBuilder = new ExplanationBuilder(),
  ) {}

  build(
    graph: DecisionGraph,
    options: BuildDecisionReportOptions = {},
  ): DecisionReport {
    const normalized = normalizeGraph(graph);
    const timeline = buildTimeline(normalized);
    const aggregates = aggregateDecisions(normalized.nodes);
    const explanations = (
      options.explanationBuilder ?? this.explanationBuilder
    ).buildReport(normalized);

    const validationIssues = Object.freeze([
      ...validateDecisionGraph(normalized),
      ...validateDecisionTimeline(timeline, normalized),
      ...validateDecisionConfidence(normalized),
    ]);

    return freezeDecisionReport({
      reportId:
        options.reportId ?? `decision-report:${normalized.generationId}`,
      generationId: normalized.generationId,
      graph: normalized,
      timeline,
      summary: Object.freeze({
        ...aggregates,
        rootCount: normalized.rootIds.length,
        edgeCount: normalized.edges.length,
      }),
      explanations,
      validationIssues,
      createdAt: options.createdAt ?? FIXED_DECISION_TIMESTAMP,
    });
  }
}
