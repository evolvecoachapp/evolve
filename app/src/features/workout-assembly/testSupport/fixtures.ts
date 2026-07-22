import { createProgrammingRequest } from "../../programming/testSupport/fixtures";
import {
  createProgressionRequest,
  createSampleProgrammingResult,
} from "../../progression/testSupport/fixtures";
import { TrainingAdaptationEngine } from "../../training-adaptation/engine/TrainingAdaptationEngine";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import {
  createSampleProgressionPlan,
  createTrainingAdaptationRequest,
} from "../../training-adaptation/testSupport/fixtures";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import { buildAssemblyContext } from "../utils/buildAssemblyContext";

export { FIXED_TIMESTAMP } from "../../programming/testSupport/fixtures";

let cachedAdaptation: {
  readonly progressionRequestId: string;
  readonly result: TrainingAdaptationResult;
} | null = null;

/**
 * Evaluate a sample adaptation once and reuse for assembly fixtures.
 */
export async function createSampleAdaptationResult(): Promise<TrainingAdaptationResult> {
  const adaptationRequest = await createTrainingAdaptationRequest();
  if (
    cachedAdaptation &&
    cachedAdaptation.progressionRequestId ===
      adaptationRequest.progression.requestId
  ) {
    return cachedAdaptation.result;
  }

  const result = await new TrainingAdaptationEngine().evaluate(
    adaptationRequest,
  );
  cachedAdaptation = {
    progressionRequestId: adaptationRequest.progression.requestId,
    result,
  };
  return result;
}

export async function createWorkoutAssemblyRequest(
  overrides: Partial<WorkoutAssemblyRequest> = {},
): Promise<WorkoutAssemblyRequest> {
  const programmingRequest = createProgrammingRequest();
  const progressionRequest = await createProgressionRequest();
  const programming =
    overrides.programming ?? (await createSampleProgrammingResult());
  const progression =
    overrides.progression ?? (await createSampleProgressionPlan());
  const adaptation =
    overrides.adaptation ?? (await createSampleAdaptationResult());

  return Object.freeze({
    blueprint: overrides.blueprint ?? programmingRequest.blueprint,
    selection: overrides.selection ?? programmingRequest.selection,
    programming,
    progression,
    adaptation,
    weekNumber: overrides.weekNumber,
    includeExplanations: overrides.includeExplanations,
  });
}

export async function createTestAssemblyContext(
  overrides: Partial<WorkoutAssemblyRequest> = {},
) {
  return buildAssemblyContext(await createWorkoutAssemblyRequest(overrides));
}
