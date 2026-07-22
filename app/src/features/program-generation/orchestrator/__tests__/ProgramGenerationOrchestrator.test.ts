import { ProgramGenerationError } from "../../models/PipelineExecutionError";
import { PIPELINE_STEP_ORDER } from "../../models/PipelineStepName";
import { ProgramGenerationOrchestrator } from "../ProgramGenerationOrchestrator";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../../testSupport/fixtures";
import { createWorkoutBlueprintService } from "../../../workout-blueprint/services";
import { InMemoryWorkoutBlueprintRepository } from "../../../workout-blueprint/repository";
import { createExerciseSelectionService } from "../../../exercise-selection/services";
import { createProgrammingService } from "../../../programming/services";
import { createProgressionService } from "../../../progression/services";
import { createTrainingAdaptationService } from "../../../training-adaptation/services";
import { createWorkoutAssemblyService } from "../../../workout-assembly/services";

describe("ProgramGenerationOrchestrator", () => {
  it("generates an immutable WorkoutGenerationResult through the full pipeline", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );

    expect(result.session.exercises.length).toBeGreaterThan(0);
    expect(result.blueprint.id).toBeTruthy();
    expect(result.selection.requestId).toBeTruthy();
    expect(result.programming.requestId).toBeTruthy();
    expect(result.progression.requestId).toBeTruthy();
    expect(result.adaptation.requestId).toBeTruthy();
    expect(result.assembly.requestId).toBeTruthy();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.generatedAt).toBe("2026-07-22T12:00:00.000Z");
  });

  it("records every canonical pipeline step in order", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );

    expect(result.trace.steps.map((step) => step.name)).toEqual([
      ...PIPELINE_STEP_ORDER,
    ]);
    expect(result.summary.status).toBe("succeeded");
    expect(result.summary.metrics.engineOutputCount).toBe(6);
    expect(result.summary.completedSteps).toEqual([...PIPELINE_STEP_ORDER]);
  });

  it("preview forces explanations", async () => {
    const service = createTestProgramGenerationService();
    const preview = await service.previewWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
    expect(preview.context.includeExplanations).toBe(true);
  });

  it("explain rebuilds explanations when empty", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: false }),
    );
    expect(result.explanations).toEqual([]);
    const explanations = await service.explainWorkoutGeneration(result);
    expect(explanations.length).toBe(result.trace.steps.length);
  });

  it("throws ProgramGenerationError on invalid request", async () => {
    const orchestrator = new ProgramGenerationOrchestrator({
      blueprintService: createWorkoutBlueprintService(
        new InMemoryWorkoutBlueprintRepository(),
      ),
      selectionService: createExerciseSelectionService(),
      programmingService: createProgrammingService(),
      progressionService: createProgressionService(),
      adaptationService: createTrainingAdaptationService(),
      assemblyService: createWorkoutAssemblyService(),
    });

    await expect(
      orchestrator.generate({
        athleteContext: null as never,
        blueprintSource: null,
      }),
    ).rejects.toBeInstanceOf(ProgramGenerationError);
  });
});
