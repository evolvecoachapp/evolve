import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";
import type { DecisionReport } from "../models/DecisionReport";
import type { ExecutionReport } from "../models/ExecutionReport";
import type { ExecutionStageSummary } from "../models/ExecutionReport";
import { DecisionReportBuilder } from "./DecisionReportBuilder";
import { freezeExecutionReport } from "../utils/freezeReports";
import { validateExecutionReport } from "../validators";

export interface BuildExecutionReportOptions {
  readonly reportId?: string;
  readonly createdAt?: string;
}

const FIXED_EXECUTION_TIMESTAMP = "2026-01-01T00:00:00.000Z";

/**
 * Build an immutable ExecutionReport from pipeline artifacts + decision report.
 */
export class ExecutionReportBuilder {
  constructor(
    private readonly decisionReportBuilder: DecisionReportBuilder = new DecisionReportBuilder(),
  ) {}

  build(input: {
    readonly decisionReport: DecisionReport;
    readonly summary: PipelineExecutionSummary;
    readonly trace: PipelineExecutionTrace;
    readonly options?: BuildExecutionReportOptions;
  }): ExecutionReport {
    const { decisionReport, summary, trace, options = {} } = input;
    const generationId = decisionReport.generationId;

    const decisionCountByStep = new Map<string, number>();
    for (const node of decisionReport.graph.nodes) {
      const step = node.context.pipelineStep ?? node.category;
      decisionCountByStep.set(step, (decisionCountByStep.get(step) ?? 0) + 1);
    }

    const stages: ExecutionStageSummary[] = Object.freeze(
      trace.steps.map((step) =>
        Object.freeze({
          name: step.name,
          order: step.order,
          status: step.status,
          outputId: step.outputId,
          decisionCount: decisionCountByStep.get(step.name) ?? 0,
          validationIssueCount: step.validationIssues.length,
        }),
      ),
    ) as ExecutionStageSummary[];

    const draft: ExecutionReport = {
      reportId: options.reportId ?? `execution-report:${generationId}`,
      generationId,
      pipeline: Object.freeze({
        generationId: summary.generationId,
        status: summary.status,
        completedSteps: Object.freeze([...summary.completedSteps]),
        failedStep: summary.failedStep,
        stageCount: trace.steps.length,
        metrics: Object.freeze({ ...summary.metrics }),
      }),
      stages,
      decisionSummary: decisionReport.summary,
      timeline: decisionReport.timeline,
      graph: decisionReport.graph,
      explanations: decisionReport.explanations,
      decisionReport,
      metricsReference: Object.freeze({ summary, trace }),
      validationIssues: Object.freeze([
        ...decisionReport.validationIssues,
        ...summary.validationIssues,
      ]),
      createdAt: options.createdAt ?? FIXED_EXECUTION_TIMESTAMP,
    };

    const frozen = freezeExecutionReport(draft);
    const extraIssues = validateExecutionReport(frozen).filter(
      (issue) => !frozen.validationIssues.includes(issue),
    );

    if (extraIssues.length === 0) {
      return frozen;
    }

    return freezeExecutionReport({
      ...frozen,
      validationIssues: Object.freeze([
        ...frozen.validationIssues,
        ...extraIssues,
      ]),
    });
  }

  buildFromGraph(input: {
    readonly graph: DecisionReport["graph"];
    readonly summary: PipelineExecutionSummary;
    readonly trace: PipelineExecutionTrace;
    readonly options?: BuildExecutionReportOptions;
  }): ExecutionReport {
    const decisionReport = this.decisionReportBuilder.build(input.graph);
    return this.build({
      decisionReport,
      summary: input.summary,
      trace: input.trace,
      options: input.options,
    });
  }
}
