import {
  aggregateSummaries,
  buildExecutionContext,
  buildExecutionTrace,
  buildGenerationId,
  createSucceededStep,
  FIXED_GENERATION_TIMESTAMP,
  freezeWorkoutGenerationResult,
  measureExecutionMetrics,
  normalizePipelineSteps,
  resolveAvailableEquipment,
} from "../index";
import { PIPELINE_STEP_ORDER } from "../../models/PipelineStepName";
import {
  createAthleteContext,
  createConversationContext,
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
  createWorkflowContext,
} from "../../testSupport/fixtures";

describe("program-generation utilities", () => {
  it("buildGenerationId is stable from athlete and conversation", () => {
    const athlete = createAthleteContext();
    const conversation = createConversationContext({
      conversationId: "c-99",
    });
    expect(buildGenerationId(athlete, conversation)).toBe(
      "generation:athlete-1:c-99",
    );
  });

  it("buildExecutionContext captures request identifiers", () => {
    const request = createWorkoutGenerationRequest({
      dayId: "day-upper",
      weekNumber: 2,
      includeExplanations: true,
      workflowContext: createWorkflowContext({ now: FIXED_GENERATION_TIMESTAMP }),
    });
    const context = buildExecutionContext(request, "generation:test");
    expect(context.athleteId).toBe("athlete-1");
    expect(context.dayId).toBe("day-upper");
    expect(context.weekNumber).toBe(2);
    expect(context.includeExplanations).toBe(true);
    expect(context.blueprintId).toBeNull();
  });

  it("resolveAvailableEquipment prefers explicit request equipment", () => {
    const request = createWorkoutGenerationRequest({
      availableEquipment: ["dumbbell"],
    });
    expect(resolveAvailableEquipment(request)).toEqual(["dumbbell"]);
  });

  it("resolveAvailableEquipment maps athlete inventory when unset", () => {
    const request = createWorkoutGenerationRequest({
      availableEquipment: undefined,
      athleteContext: createAthleteContext({
        profile: {
          equipment: {
            available: ["barbell", "resistance_band", "specialty_bar"],
            hasFullGymAccess: false,
          },
        },
      }),
    });
    expect(resolveAvailableEquipment(request)).toEqual(
      expect.arrayContaining(["barbell", "band", "other"]),
    );
  });

  it("normalizePipelineSteps freezes and reindexes", () => {
    const steps = normalizePipelineSteps([
      createSucceededStep("validate", 99),
      createSucceededStep("create_context", 42, { outputId: "ctx" }),
    ]);
    expect(steps[0].order).toBe(0);
    expect(steps[1].order).toBe(1);
    expect(Object.isFrozen(steps)).toBe(true);
    expect(Object.isFrozen(steps[0])).toBe(true);
  });

  it("buildExecutionTrace and measureExecutionMetrics are structural only", () => {
    const steps = PIPELINE_STEP_ORDER.map((name, order) =>
      createSucceededStep(name, order),
    );
    const trace = buildExecutionTrace("generation:test", steps);
    expect(trace.steps).toHaveLength(PIPELINE_STEP_ORDER.length);

    const metrics = measureExecutionMetrics({
      steps: trace.steps,
      validationIssueCount: 2,
      explanationCount: 3,
      engineOutputCount: 6,
    });
    expect(metrics.succeededStepCount).toBe(PIPELINE_STEP_ORDER.length);
    expect(metrics.failedStepCount).toBe(0);
    expect(metrics.validationIssueCount).toBe(2);
    expect(metrics.engineOutputCount).toBe(6);
  });

  it("aggregateSummaries marks succeeded runs", () => {
    const steps = PIPELINE_STEP_ORDER.map((name, order) =>
      createSucceededStep(name, order),
    );
    const summary = aggregateSummaries({
      generationId: "generation:test",
      steps,
      validationIssues: [],
      explanationCount: 0,
      engineOutputCount: 6,
    });
    expect(summary.status).toBe("succeeded");
    expect(summary.failedStep).toBeNull();
    expect(summary.completedSteps).toEqual([...PIPELINE_STEP_ORDER]);
  });

  it("freezeWorkoutGenerationResult deep-freezes the result", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: true }),
    );
    const frozen = freezeWorkoutGenerationResult(result);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.summary)).toBe(true);
    expect(Object.isFrozen(frozen.trace)).toBe(true);
    expect(Object.isFrozen(frozen.explanations)).toBe(true);
  });
});
