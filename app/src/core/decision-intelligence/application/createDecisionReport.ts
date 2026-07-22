import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionReport } from "../models/DecisionReport";
import type { DecisionExplanation } from "../models/DecisionExplanation";
import type { ExecutionReport } from "../models/ExecutionReport";
import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";
import type { WorkoutGenerationResult } from "../../../features/program-generation/models/WorkoutGenerationResult";
import {
  createDecisionIntelligenceService,
  type DecisionIntelligenceService,
} from "../services";

function resolveService(
  service?: DecisionIntelligenceService,
): DecisionIntelligenceService {
  return service ?? createDecisionIntelligenceService();
}

/**
 * Public API — create an immutable DecisionReport from a graph or generation result.
 */
export function createDecisionReport(
  input: DecisionGraph | WorkoutGenerationResult,
  service?: DecisionIntelligenceService,
): DecisionReport {
  const resolved = resolveService(service);
  if ("requestId" in input && "summary" in input && "trace" in input) {
    return resolved.createDecisionReportFromGeneration(input);
  }
  return resolved.createDecisionReport(input);
}

/**
 * Public API — create an immutable ExecutionReport from generation artifacts.
 */
export function createExecutionReport(
  input:
    | WorkoutGenerationResult
    | {
        readonly decisionReport: DecisionReport;
        readonly summary: PipelineExecutionSummary;
        readonly trace: PipelineExecutionTrace;
      },
  service?: DecisionIntelligenceService,
): ExecutionReport {
  const resolved = resolveService(service);
  if ("requestId" in input && "session" in input) {
    return resolved.createExecutionReportFromGeneration(input);
  }
  return resolved.createExecutionReport(input);
}

/**
 * Public API — template-based workout decision explanations (no AI).
 */
export function explainWorkoutDecision(
  input: DecisionGraph | WorkoutGenerationResult,
  decisionId?: string,
  service?: DecisionIntelligenceService,
): readonly DecisionExplanation[] {
  const resolved = resolveService(service);
  const graph =
    "requestId" in input && "summary" in input
      ? resolved.createDecisionReportFromGeneration(input).graph
      : input;
  return resolved.explainWorkoutDecision(graph, decisionId);
}

/**
 * Public API — summarize a decision graph for Coach/debug surfaces.
 */
export function summarizeDecisionGraph(
  input: DecisionGraph | WorkoutGenerationResult,
  service?: DecisionIntelligenceService,
): {
  readonly summaryText: string;
  readonly report: DecisionReport;
  readonly propagatedReasonCodes: Readonly<Record<string, readonly string[]>>;
} {
  const resolved = resolveService(service);
  const graph =
    "requestId" in input && "summary" in input
      ? resolved.createDecisionReportFromGeneration(input).graph
      : input;
  return resolved.summarizeDecisionGraph(graph);
}
