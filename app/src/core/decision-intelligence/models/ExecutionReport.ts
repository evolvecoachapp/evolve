import type { PipelineExecutionMetrics } from "../../../features/program-generation/models/PipelineExecutionMetrics";
import type { PipelineExecutionStatus } from "../../../features/program-generation/models/PipelineExecutionStatus";
import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";
import type { DecisionGraph } from "./DecisionGraph";
import type { DecisionReport } from "./DecisionReport";
import type { DecisionTimeline } from "./DecisionTimeline";
import type { ExplanationReport } from "./DecisionExplanation";

/**
 * Pipeline stage snapshot for an execution report.
 */
export interface ExecutionStageSummary {
  readonly name: string;
  readonly order: number;
  readonly status: PipelineExecutionStatus;
  readonly outputId: string | null;
  readonly decisionCount: number;
  readonly validationIssueCount: number;
}

/**
 * High-level pipeline summary embedded in an execution report.
 */
export interface PipelineReportSummary {
  readonly generationId: string;
  readonly status: PipelineExecutionStatus;
  readonly completedSteps: readonly string[];
  readonly failedStep: string | null;
  readonly stageCount: number;
  readonly metrics: PipelineExecutionMetrics;
}

/**
 * Immutable execution report combining pipeline structure with decision intelligence.
 */
export interface ExecutionReport {
  readonly reportId: string;
  readonly generationId: string;
  readonly pipeline: PipelineReportSummary;
  readonly stages: readonly ExecutionStageSummary[];
  readonly decisionSummary: DecisionReport["summary"];
  readonly timeline: DecisionTimeline;
  readonly graph: DecisionGraph;
  readonly explanations: ExplanationReport;
  readonly decisionReport: DecisionReport;
  /** Reference to pipeline summary/trace inputs (structural, not cloned deep). */
  readonly metricsReference: {
    readonly summary: PipelineExecutionSummary;
    readonly trace: PipelineExecutionTrace;
  };
  readonly validationIssues: readonly string[];
  readonly createdAt: string;
}
