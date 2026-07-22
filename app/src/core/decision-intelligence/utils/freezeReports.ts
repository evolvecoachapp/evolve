import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionEdge } from "../models/DecisionEdge";
import type { DecisionEvidence } from "../models/DecisionEvidence";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionMetadata } from "../models/DecisionMetadata";
import type { DecisionNode } from "../models/DecisionNode";
import type { DecisionReason } from "../models/DecisionReason";
import type { DecisionReport } from "../models/DecisionReport";
import type { DecisionSummary } from "../models/DecisionReport";
import type { DecisionTimeline } from "../models/DecisionTimeline";
import type {
  DecisionExplanation,
  ExplanationReport,
} from "../models/DecisionExplanation";
import type { ExecutionReport } from "../models/ExecutionReport";
import type { ExecutionStageSummary } from "../models/ExecutionReport";
import type { PipelineReportSummary } from "../models/ExecutionReport";

function freezeReason(reason: DecisionReason): DecisionReason {
  return Object.freeze({ ...reason });
}

function freezeEvidence(evidence: DecisionEvidence): DecisionEvidence {
  return Object.freeze({ ...evidence });
}

function freezeContext(context: DecisionContext): DecisionContext {
  return Object.freeze({ ...context });
}

function freezeMetadata(metadata: DecisionMetadata): DecisionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeDecisionNode(node: DecisionNode): DecisionNode {
  return Object.freeze({
    ...node,
    reasons: Object.freeze(node.reasons.map(freezeReason)),
    evidence: Object.freeze(node.evidence.map(freezeEvidence)),
    context: freezeContext(node.context),
    metadata: freezeMetadata(node.metadata),
    parentIds: Object.freeze([...node.parentIds]),
  });
}

export function freezeDecisionEdge(edge: DecisionEdge): DecisionEdge {
  return Object.freeze({ ...edge });
}

export function freezeDecisionGraph(graph: DecisionGraph): DecisionGraph {
  return Object.freeze({
    generationId: graph.generationId,
    nodes: Object.freeze(graph.nodes.map(freezeDecisionNode)),
    edges: Object.freeze(graph.edges.map(freezeDecisionEdge)),
    rootIds: Object.freeze([...graph.rootIds]),
  });
}

export function freezeDecisionTimeline(
  timeline: DecisionTimeline,
): DecisionTimeline {
  return Object.freeze({
    generationId: timeline.generationId,
    entries: Object.freeze(
      timeline.entries.map((entry) => Object.freeze({ ...entry })),
    ),
  });
}

function freezeExplanation(
  explanation: DecisionExplanation,
): DecisionExplanation {
  return Object.freeze({
    ...explanation,
    codes: Object.freeze([...explanation.codes]),
  });
}

export function freezeExplanationReport(
  report: ExplanationReport,
): ExplanationReport {
  return Object.freeze({
    generationId: report.generationId,
    human: Object.freeze(report.human.map(freezeExplanation)),
    developer: Object.freeze(report.developer.map(freezeExplanation)),
    compact: Object.freeze(report.compact.map(freezeExplanation)),
    detailed: Object.freeze(report.detailed.map(freezeExplanation)),
    summaryText: report.summaryText,
  });
}

export function freezeDecisionSummary(
  summary: DecisionSummary,
): DecisionSummary {
  return Object.freeze({
    ...summary,
    byCategory: Object.freeze({ ...summary.byCategory }),
  });
}

export function freezeDecisionReport(report: DecisionReport): DecisionReport {
  return Object.freeze({
    reportId: report.reportId,
    generationId: report.generationId,
    graph: freezeDecisionGraph(report.graph),
    timeline: freezeDecisionTimeline(report.timeline),
    summary: freezeDecisionSummary(report.summary),
    explanations: freezeExplanationReport(report.explanations),
    validationIssues: Object.freeze([...report.validationIssues]),
    createdAt: report.createdAt,
  });
}

function freezeStage(stage: ExecutionStageSummary): ExecutionStageSummary {
  return Object.freeze({ ...stage });
}

function freezePipelineSummary(
  summary: PipelineReportSummary,
): PipelineReportSummary {
  return Object.freeze({
    ...summary,
    completedSteps: Object.freeze([...summary.completedSteps]),
    metrics: Object.freeze({ ...summary.metrics }),
  });
}

export function freezeExecutionReport(
  report: ExecutionReport,
): ExecutionReport {
  return Object.freeze({
    reportId: report.reportId,
    generationId: report.generationId,
    pipeline: freezePipelineSummary(report.pipeline),
    stages: Object.freeze(report.stages.map(freezeStage)),
    decisionSummary: freezeDecisionSummary(report.decisionSummary),
    timeline: freezeDecisionTimeline(report.timeline),
    graph: freezeDecisionGraph(report.graph),
    explanations: freezeExplanationReport(report.explanations),
    decisionReport: freezeDecisionReport(report.decisionReport),
    metricsReference: Object.freeze({
      summary: report.metricsReference.summary,
      trace: report.metricsReference.trace,
    }),
    validationIssues: Object.freeze([...report.validationIssues]),
    createdAt: report.createdAt,
  });
}
