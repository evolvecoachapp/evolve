import { DecisionReportBuilder, ExecutionReportBuilder } from "../builders";
import { DecisionRecorder } from "../recorder";
import {
  validateDecisionReport,
  validateDecisionTimeline,
  validateExecutionReport,
} from "../validators";
import { buildTimeline, mergeReports } from "../utils";
import type { DecisionContext } from "../models";
import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";

function context(generationId: string): DecisionContext {
  return Object.freeze({
    generationId,
    stage: "assembly",
    pipelineStep: "workout_assembly",
    athleteId: "athlete-1",
    dayId: "day-1",
    weekNumber: 1,
    subjectId: "session-1",
  });
}

function summary(generationId: string): PipelineExecutionSummary {
  return Object.freeze({
    generationId,
    status: "succeeded",
    completedSteps: Object.freeze(["blueprint", "selection"] as const),
    failedStep: null,
    metrics: Object.freeze({
      stepCount: 2,
      succeededStepCount: 2,
      failedStepCount: 0,
      skippedStepCount: 0,
      validationIssueCount: 0,
      explanationCount: 0,
      engineOutputCount: 2,
    }),
    validationIssues: Object.freeze([]),
  });
}

function trace(generationId: string): PipelineExecutionTrace {
  return Object.freeze({
    generationId,
    steps: Object.freeze([
      Object.freeze({
        name: "blueprint" as const,
        order: 0,
        status: "succeeded" as const,
        outputId: "bp-1",
        validationIssues: Object.freeze([]),
        error: null,
      }),
      Object.freeze({
        name: "selection" as const,
        order: 1,
        status: "succeeded" as const,
        outputId: "sel-1",
        validationIssues: Object.freeze([]),
        error: null,
      }),
    ]),
  });
}

describe("validators and reports", () => {
  it("builds and validates decision + execution reports", () => {
    const recorder = new DecisionRecorder("gen-r");
    recorder.record({
      id: "d1",
      category: "assembly",
      summaryCode: "assembled",
      title: "Assembled",
      context: context("gen-r"),
    });
    const graph = recorder.buildGraph();
    const decisionReport = new DecisionReportBuilder().build(graph);
    expect(Object.isFrozen(decisionReport)).toBe(true);
    expect(validateDecisionReport(decisionReport)).toEqual(
      decisionReport.validationIssues,
    );
    expect(
      validateDecisionTimeline(decisionReport.timeline, decisionReport.graph),
    ).toEqual([]);

    const executionReport = new ExecutionReportBuilder().build({
      decisionReport,
      summary: summary("gen-r"),
      trace: trace("gen-r"),
    });
    expect(executionReport.stages).toHaveLength(2);
    expect(executionReport.metricsReference.summary.generationId).toBe("gen-r");
    expect(Object.isFrozen(executionReport)).toBe(true);
    expect(validateExecutionReport(executionReport).length).toBeGreaterThanOrEqual(
      0,
    );
  });

  it("detects timeline inconsistencies", () => {
    const recorder = new DecisionRecorder("gen-t");
    recorder.record({
      id: "d1",
      category: "selection",
      summaryCode: "s",
      title: "S",
      context: context("gen-t"),
    });
    const graph = recorder.buildGraph();
    const timeline = buildTimeline(graph);
    const broken = Object.freeze({
      ...timeline,
      entries: Object.freeze([
        Object.freeze({
          decisionId: "missing",
          sequence: 0,
          category: "selection" as const,
          summaryCode: "x",
          pipelineStep: "selection",
        }),
      ]),
    });
    const issues = validateDecisionTimeline(broken, graph);
    expect(issues.some((issue) => issue.includes("timeline_unknown"))).toBe(
      true,
    );
  });

  it("merges decision reports", () => {
    const a = new DecisionReportBuilder().build(
      new DecisionRecorder("gen-m").buildGraph(),
    );
    const recorder = new DecisionRecorder("gen-m");
    recorder.record({
      id: "only",
      category: "validation",
      summaryCode: "v",
      title: "V",
      context: context("gen-m"),
    });
    const b = new DecisionReportBuilder().build(recorder.buildGraph());
    const merged = mergeReports([a, b], { generationId: "gen-m" });
    expect(merged.summary.totalDecisions).toBe(1);
    expect(merged.reportId).toContain("merged");
  });
});
