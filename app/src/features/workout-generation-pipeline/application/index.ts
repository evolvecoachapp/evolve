import type { WorkoutPipelineRequest } from "../models/WorkoutPipelineRequest";
import type { WorkoutPlan } from "../models/WorkoutPlan";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutPlanValidation } from "../models/WorkoutPlanValidation";
import { validateWorkoutPlanIntegrity } from "../validators/validateWorkoutPlanIntegrity";
import {
  createWorkoutGenerationPipelineService,
  type WorkoutGenerationPipelineService,
  type WorkoutGenerationPipelineServiceDeps,
} from "../services/WorkoutGenerationPipelineService";

function resolveService(
  service: WorkoutGenerationPipelineService | undefined,
  deps: WorkoutGenerationPipelineServiceDeps | undefined,
): WorkoutGenerationPipelineService {
  if (service) return service;
  if (!deps) {
    throw new Error(
      "WorkoutGenerationPipelineService requires Composition Root wiring or explicit deps",
    );
  }
  return createWorkoutGenerationPipelineService(deps);
}

/**
 * Public API — run the full Workout Generation Pipeline → WorkoutPlan.
 */
export async function generateWorkoutPlan(options: {
  readonly request: WorkoutPipelineRequest;
  readonly service?: WorkoutGenerationPipelineService;
  readonly deps?: WorkoutGenerationPipelineServiceDeps;
}): Promise<WorkoutResult> {
  return resolveService(options.service, options.deps).generateWorkoutPlan(
    options.request,
  );
}

/**
 * Public API — validate an existing WorkoutPlan.
 */
export function validateGeneratedWorkoutPlan(options: {
  readonly plan: WorkoutPlan;
}): WorkoutPlanValidation {
  return validateWorkoutPlanIntegrity(
    options.plan,
    options.plan.recommendationPackage,
  );
}

export type { WorkoutGenerationPipelineServiceDeps };
