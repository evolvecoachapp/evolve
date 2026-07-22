import { PIPELINE_STEP_ORDER } from "../../models/PipelineStepName";
import type { PipelineExecutionStep } from "../../models/PipelineExecutionStep";
import {
  createSucceededStep,
  createFailedStep,
} from "../../utils/normalizePipeline";
import {
  validateExecutionOrder,
  validateMissingDependencies,
  validatePipelineConsistency,
  validatePipelineDependencies,
  validatePipelineIntegrity,
  validateRequiredOutputs,
  validateWorkoutGenerationRequest,
} from "../index";
import {
  createAthleteContext,
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../../testSupport/fixtures";

function buildFullSteps(): readonly PipelineExecutionStep[] {
  return Object.freeze(
    PIPELINE_STEP_ORDER.map((name, order) =>
      createSucceededStep(name, order, { outputId: `out-${name}` }),
    ),
  );
}

describe("program-generation validators", () => {
  it("validateMissingDependencies flags absent athlete and blueprint source", () => {
    const issues = validateMissingDependencies({
      athleteContext: null as never,
      blueprintSource: null,
    });
    expect(issues).toEqual(
      expect.arrayContaining([
        "missing_athlete_context",
        "missing_blueprint_source",
      ]),
    );
  });

  it("validateWorkoutGenerationRequest accepts a valid request", () => {
    expect(
      validateWorkoutGenerationRequest(createWorkoutGenerationRequest()),
    ).toEqual([]);
  });

  it("validateMissingDependencies flags missing athlete id", () => {
    const athleteContext = createAthleteContext({
      profile: { id: "" },
    });
    expect(
      validateMissingDependencies(
        createWorkoutGenerationRequest({ athleteContext }),
      ),
    ).toContain("missing_athlete_id");
  });

  it("validatePipelineIntegrity requires all canonical steps", () => {
    const incomplete = buildFullSteps().slice(0, 3);
    const issues = validatePipelineIntegrity(incomplete);
    expect(issues).toEqual(
      expect.arrayContaining([
        "missing_step:selection",
        "missing_step:freeze_result",
      ]),
    );
  });

  it("validatePipelineIntegrity flags failed steps", () => {
    const steps = [
      ...buildFullSteps().slice(0, 2),
      createFailedStep("blueprint", 2, {
        code: "boom",
        message: "failed",
        step: "blueprint",
        details: {},
      }),
    ];
    expect(validatePipelineIntegrity(steps)).toContain("failed_step:blueprint");
  });

  it("validateExecutionOrder detects out-of-order steps", () => {
    const steps = Object.freeze([
      createSucceededStep("blueprint", 0),
      createSucceededStep("validate", 1),
    ]);
    expect(validateExecutionOrder(steps)).toContain("out_of_order:validate");
  });

  it("validateExecutionOrder accepts canonical order", () => {
    expect(validateExecutionOrder(buildFullSteps())).toEqual([]);
  });

  it("validateRequiredOutputs and consistency pass for a real pipeline result", async () => {
    const service = createTestProgramGenerationService();
    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );

    expect(validateRequiredOutputs(result)).toEqual([]);
    expect(validatePipelineDependencies(result)).toEqual([]);
    expect(validatePipelineConsistency(result)).toEqual([]);
    expect(validatePipelineIntegrity(result.trace.steps)).toEqual([]);
    expect(validateExecutionOrder(result.trace.steps)).toEqual([]);
  });
});
