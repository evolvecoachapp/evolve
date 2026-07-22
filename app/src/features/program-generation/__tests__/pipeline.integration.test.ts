import { PIPELINE_STEP_ORDER } from "../models/PipelineStepName";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../testSupport/fixtures";
import {
  validateExecutionOrder,
  validatePipelineConsistency,
  validatePipelineDependencies,
  validatePipelineIntegrity,
} from "../validators";

describe("program-generation pipeline integration", () => {
  it("orchestrates Blueprint → Selection → Programming → Progression → Adaptation → Assembly", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: true }),
    );

    // Engine outputs present and linked
    expect(result.blueprint.id).toBe(result.selection.context.blueprintId);
    expect(result.selection.requestId).toBe(
      result.programming.context.selectionRequestId,
    );
    expect(result.programming.requestId).toBe(
      result.progression.context.programmingRequestId,
    );
    expect(result.progression.requestId).toBe(
      result.adaptation.context.progressionRequestId,
    );
    expect(result.adaptation.requestId).toBe(
      result.assembly.context.adaptationRequestId,
    );
    expect(result.session.id).toBe(result.assembly.session.id);

    // Trace + summary
    expect(result.trace.steps.map((step) => step.name)).toEqual([
      ...PIPELINE_STEP_ORDER,
    ]);
    expect(result.summary.metrics.succeededStepCount).toBe(
      PIPELINE_STEP_ORDER.length,
    );
    expect(result.explanations.length).toBeGreaterThan(0);

    // Validators
    expect(validatePipelineIntegrity(result.trace.steps)).toEqual([]);
    expect(validateExecutionOrder(result.trace.steps)).toEqual([]);
    expect(validatePipelineDependencies(result)).toEqual([]);
    expect(validatePipelineConsistency(result)).toEqual([]);
  });

  it("produces a deterministic generatedAt timestamp", async () => {
    const service = createTestProgramGenerationService();
    const first = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );
    const second = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );
    expect(first.generatedAt).toBe(second.generatedAt);
    expect(first.generatedAt).toBe("2026-07-22T12:00:00.000Z");
  });
});
