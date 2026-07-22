import {
  createDecisionReport,
  createExecutionReport,
  explainWorkoutDecision,
  recordPipelineDecisions,
  summarizeDecisionGraph,
  toPipelineDecisionSource,
} from "../index";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../../../features/program-generation/testSupport/fixtures";

describe("pipeline integration", () => {
  it("records domain decisions from a real WorkoutGenerationResult", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.previewWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: true }),
    );

    const source = toPipelineDecisionSource(result);
    const graph = recordPipelineDecisions(source);

    expect(graph.generationId).toBe(result.requestId);
    expect(graph.nodes.some((node) => node.category === "blueprint")).toBe(
      true,
    );
    expect(graph.nodes.some((node) => node.category === "selection")).toBe(
      true,
    );
    expect(graph.nodes.some((node) => node.category === "programming")).toBe(
      true,
    );
    expect(graph.nodes.some((node) => node.category === "progression")).toBe(
      true,
    );
    expect(graph.nodes.some((node) => node.category === "adaptation")).toBe(
      true,
    );
    expect(graph.nodes.some((node) => node.category === "assembly")).toBe(
      true,
    );
    expect(graph.edges.some((edge) => edge.kind === "sequence")).toBe(true);

    const decisionReport = createDecisionReport(result);
    const executionReport = createExecutionReport(result);

    expect(decisionReport.summary.totalDecisions).toBeGreaterThan(0);
    expect(executionReport.pipeline.generationId).toBe(result.requestId);
    expect(executionReport.metricsReference.trace.steps.length).toBe(
      result.trace.steps.length,
    );
    expect(executionReport.explanations.human.length).toBeGreaterThan(0);

    const explanations = explainWorkoutDecision(result);
    expect(explanations.length).toBeGreaterThan(0);

    const summary = summarizeDecisionGraph(result);
    expect(summary.report.graph.nodes.length).toBe(
      decisionReport.graph.nodes.length,
    );

    const orchestratorReport = service.buildDecisionIntelligence(result);
    expect(orchestratorReport.generationId).toBe(result.requestId);
    expect(Object.isFrozen(orchestratorReport)).toBe(true);
  });

  it("does not change generation business outputs", async () => {
    const service = createTestProgramGenerationService();
    const request = createWorkoutGenerationRequest({
      includeExplanations: true,
    });
    const first = await service.generateWorkoutProgram(request);
    const second = await service.generateWorkoutProgram(request);

    expect(first.session.exercises.map((e) => e.exerciseId)).toEqual(
      second.session.exercises.map((e) => e.exerciseId),
    );
    expect(first.summary.status).toBe("succeeded");
    expect(first.trace.steps.map((step) => step.name)).toEqual(
      second.trace.steps.map((step) => step.name),
    );
  });
});
