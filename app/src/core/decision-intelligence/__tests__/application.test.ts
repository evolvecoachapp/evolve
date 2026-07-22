import {
  createDecisionReport,
  createExecutionReport,
  explainWorkoutDecision,
  summarizeDecisionGraph,
} from "../application";
import { DecisionRecorder } from "../recorder";
import type { DecisionContext } from "../models";

function context(generationId: string): DecisionContext {
  return Object.freeze({
    generationId,
    stage: "selection",
    pipelineStep: "selection",
    athleteId: "athlete-1",
    dayId: "day-1",
    weekNumber: 1,
    subjectId: "ex-1",
  });
}

describe("decision-intelligence application API", () => {
  it("exposes createDecisionReport / explain / summarize without internals", () => {
    const recorder = new DecisionRecorder("gen-app");
    recorder.record({
      id: "d1",
      category: "selection",
      summaryCode: "selected",
      title: "Selected",
      reasons: [{ code: "pattern_match", weight: 1 }],
      context: context("gen-app"),
    });
    const graph = recorder.buildGraph();

    const report = createDecisionReport(graph);
    expect(report.summary.totalDecisions).toBe(1);
    expect(report.explanations.human[0]?.text).toContain("Selected");

    const explanations = explainWorkoutDecision(graph, "d1");
    expect(explanations.length).toBe(4);
    expect(explanations.map((item) => item.style).sort()).toEqual([
      "compact",
      "detailed",
      "developer",
      "human",
    ]);

    const summary = summarizeDecisionGraph(graph);
    expect(summary.summaryText).toContain("1 domain decisions");
    expect(summary.propagatedReasonCodes.d1).toEqual([
      "pattern_match",
      "selected",
    ]);
  });

  it("createExecutionReport requires pipeline artifacts with decision report", () => {
    const recorder = new DecisionRecorder("gen-exec");
    recorder.record({
      id: "d1",
      category: "orchestration",
      summaryCode: "pipe",
      title: "Pipe",
      context: context("gen-exec"),
    });
    const decisionReport = createDecisionReport(recorder.buildGraph());
    const executionReport = createExecutionReport({
      decisionReport,
      summary: Object.freeze({
        generationId: "gen-exec",
        status: "succeeded",
        completedSteps: Object.freeze([]),
        failedStep: null,
        metrics: Object.freeze({
          stepCount: 0,
          succeededStepCount: 0,
          failedStepCount: 0,
          skippedStepCount: 0,
          validationIssueCount: 0,
          explanationCount: 0,
          engineOutputCount: 0,
        }),
        validationIssues: Object.freeze([]),
      }),
      trace: Object.freeze({
        generationId: "gen-exec",
        steps: Object.freeze([]),
      }),
    });

    expect(executionReport.decisionReport.reportId).toBe(
      decisionReport.reportId,
    );
    expect(executionReport.graph.nodes).toHaveLength(1);
  });
});
