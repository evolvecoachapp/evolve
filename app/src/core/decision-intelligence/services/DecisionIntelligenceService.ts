import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";
import type { WorkoutGenerationResult } from "../../../features/program-generation/models/WorkoutGenerationResult";
import {
  DecisionReportBuilder,
  ExecutionReportBuilder,
  ExplanationBuilder,
} from "../builders";
import { DecisionGraphService } from "../graph";
import type { DecisionExplanation } from "../models/DecisionExplanation";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionReport } from "../models/DecisionReport";
import type { ExecutionReport } from "../models/ExecutionReport";
import { DecisionRecorder } from "../recorder";
import {
  recordPipelineDecisions,
  toPipelineDecisionSource,
} from "../integration/recordPipelineDecisions";

/**
 * Decision Intelligence service — structured domain explanation only.
 * No AI, networking, persistence, telemetry, or logging framework.
 */
export class DecisionIntelligenceService {
  constructor(
    private readonly explanationBuilder: ExplanationBuilder = new ExplanationBuilder(),
    private readonly decisionReportBuilder: DecisionReportBuilder = new DecisionReportBuilder(),
    private readonly executionReportBuilder: ExecutionReportBuilder = new ExecutionReportBuilder(),
    private readonly graphService: DecisionGraphService = new DecisionGraphService(),
  ) {}

  createRecorder(generationId: string): DecisionRecorder {
    return new DecisionRecorder(generationId);
  }

  createDecisionReport(graph: DecisionGraph): DecisionReport {
    return this.decisionReportBuilder.build(graph);
  }

  createExecutionReport(input: {
    readonly decisionReport: DecisionReport;
    readonly summary: PipelineExecutionSummary;
    readonly trace: PipelineExecutionTrace;
  }): ExecutionReport {
    return this.executionReportBuilder.build(input);
  }

  /**
   * Build full execution report from a completed WorkoutGenerationResult.
   * Reads structured engine decisions — does not alter engine logic.
   */
  createExecutionReportFromGeneration(
    result: WorkoutGenerationResult,
  ): ExecutionReport {
    const graph = recordPipelineDecisions(toPipelineDecisionSource(result));
    const decisionReport = this.createDecisionReport(graph);
    return this.createExecutionReport({
      decisionReport,
      summary: result.summary,
      trace: result.trace,
    });
  }

  createDecisionReportFromGeneration(
    result: WorkoutGenerationResult,
  ): DecisionReport {
    return this.createExecutionReportFromGeneration(result).decisionReport;
  }

  explainWorkoutDecision(
    graph: DecisionGraph,
    decisionId?: string,
  ): readonly DecisionExplanation[] {
    if (decisionId) {
      const node = graph.nodes.find((item) => item.id === decisionId);
      if (!node) {
        return Object.freeze([]);
      }
      return Object.freeze([
        this.explanationBuilder.explainDecision(node, "human"),
        this.explanationBuilder.explainDecision(node, "developer"),
        this.explanationBuilder.explainDecision(node, "compact"),
        this.explanationBuilder.explainDecision(node, "detailed"),
      ]);
    }
    return this.explanationBuilder.buildReport(graph).human;
  }

  summarizeDecisionGraph(graph: DecisionGraph): {
    readonly summaryText: string;
    readonly report: DecisionReport;
    readonly propagatedReasonCodes: Readonly<Record<string, readonly string[]>>;
  } {
    const report = this.createDecisionReport(graph);
    const propagatedReasonCodes = Object.freeze(
      Object.fromEntries(
        graph.nodes.map((node) => [
          node.id,
          this.graphService.propagateReasons(graph, node.id),
        ]),
      ),
    );
    return Object.freeze({
      summaryText: report.explanations.summaryText,
      report,
      propagatedReasonCodes,
    });
  }
}

export function createDecisionIntelligenceService(): DecisionIntelligenceService {
  return new DecisionIntelligenceService();
}
