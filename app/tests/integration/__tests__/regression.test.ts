import { expectWorkout } from "../assertions";
import { buildWorkoutRequest } from "../builders";
import { IntermediatePowerbuildingAthlete } from "../fixtures";
import { matchGolden } from "../golden";
import { normalizeWorkoutSnapshot } from "../snapshots";
import { executePipeline } from "../utils";
import {
  validateExecutionOrder,
  validatePipelineConsistency,
  validatePipelineDependencies,
  validatePipelineIntegrity,
  validateRequiredOutputs,
} from "../../../src/features/program-generation/validators";

describe("integration regression validation", () => {
  it("verifies execution order, required outputs, integrity, immutability, and summary/trace consistency", async () => {
    const result = await executePipeline(
      buildWorkoutRequest()
        .withAthlete(IntermediatePowerbuildingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withExplanations(true)
        .build(),
    );

    expect(validatePipelineIntegrity(result.trace.steps)).toEqual([]);
    expect(validateExecutionOrder(result.trace.steps)).toEqual([]);
    expect(validateRequiredOutputs(result)).toEqual([]);
    expect(validatePipelineDependencies(result)).toEqual([]);
    expect(validatePipelineConsistency(result)).toEqual([]);

    expect(result.summary.generationId).toBe(result.trace.generationId);
    expect(result.summary.completedSteps).toEqual(
      result.trace.steps.map((step) => step.name),
    );

    expectWorkout(result).toPassPipelineValidation();

    const snapshot = normalizeWorkoutSnapshot(result, {
      scenarioId: "regression-powerbuilding",
    });
    expect(snapshot.status).toBe("succeeded");
    expect(snapshot.failedStep).toBeNull();
  });

  it("detects golden regressions for the powerbuilding scenario", async () => {
    const result = await executePipeline(
      buildWorkoutRequest()
        .withAthlete(IntermediatePowerbuildingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withExplanations(true)
        .build(),
    );
    matchGolden("powerbuilding", result);
  });
});
