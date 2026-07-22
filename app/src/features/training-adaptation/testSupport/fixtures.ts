import { ProgressionEngine } from "../../progression/engine/ProgressionEngine";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import { createProgressionRequest } from "../../progression/testSupport/fixtures";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import { buildAdaptationContext } from "../utils/buildAdaptationContext";

export { FIXED_TIMESTAMP } from "../../programming/testSupport/fixtures";

let cachedProgression: {
  readonly blueprintId: string;
  readonly plan: ProgressionPlan;
} | null = null;

/**
 * Generate a sample progression plan once and reuse for adaptation fixtures.
 */
export async function createSampleProgressionPlan(): Promise<ProgressionPlan> {
  const progressionRequest = await createProgressionRequest();
  if (
    cachedProgression &&
    cachedProgression.blueprintId === progressionRequest.blueprint.id
  ) {
    return cachedProgression.plan;
  }

  const plan = await new ProgressionEngine().generate(progressionRequest);
  cachedProgression = {
    blueprintId: progressionRequest.blueprint.id,
    plan,
  };
  return plan;
}

export async function createTrainingAdaptationRequest(
  overrides: Partial<TrainingAdaptationRequest> = {},
): Promise<TrainingAdaptationRequest> {
  const progressionRequest = await createProgressionRequest();
  const progression =
    overrides.progression ?? (await createSampleProgressionPlan());

  return Object.freeze({
    blueprint: overrides.blueprint ?? progressionRequest.blueprint,
    progression,
    includeExplanations: overrides.includeExplanations,
  });
}

export async function createTestAdaptationContext(
  overrides: Partial<TrainingAdaptationRequest> = {},
) {
  return buildAdaptationContext(
    await createTrainingAdaptationRequest(overrides),
  );
}
