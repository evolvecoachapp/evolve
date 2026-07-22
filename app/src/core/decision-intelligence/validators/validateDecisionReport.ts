import type { DecisionReport } from "../models/DecisionReport";
import type { ExecutionReport } from "../models/ExecutionReport";
import {
  validateDecisionConfidence,
  validateDecisionGraph,
  validateDecisionTimeline,
} from "./validateDecisionGraph";

/**
 * Validate a full decision report.
 */
export function validateDecisionReport(
  report: DecisionReport,
): readonly string[] {
  return Object.freeze([
    ...validateDecisionGraph(report.graph),
    ...validateDecisionTimeline(report.timeline, report.graph),
    ...validateDecisionConfidence(report.graph),
    ...report.validationIssues,
  ]);
}

/**
 * Validate an execution report (graph + pipeline references).
 */
export function validateExecutionReport(
  report: ExecutionReport,
): readonly string[] {
  const issues: string[] = [
    ...validateDecisionReport(report.decisionReport),
    ...report.validationIssues,
  ];

  if (report.generationId !== report.pipeline.generationId) {
    issues.push(
      `execution_generation_mismatch:${report.generationId}:${report.pipeline.generationId}`,
    );
  }

  if (
    report.metricsReference.summary.generationId !== report.generationId ||
    report.metricsReference.trace.generationId !== report.generationId
  ) {
    issues.push(`execution_metrics_reference_mismatch:${report.generationId}`);
  }

  return Object.freeze(Array.from(new Set(issues)));
}
