import type { WorkoutModificationRequest } from "../models/WorkoutModificationRequest";
import type { WorkoutModificationResult } from "../models/WorkoutModificationResult";
import type { WorkoutPipelineRequest } from "../models/WorkoutPipelineRequest";
import type { WorkoutPlan } from "../models/WorkoutPlan";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutPlanValidation } from "../models/WorkoutPlanValidation";
import { validateModifiedWorkoutPlan } from "../modification/validateModifiedWorkoutPlan";
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
 * Public API — surgically modify an existing WorkoutPlan (adaptive path).
 */
export function modifyWorkoutPlan(options: {
  readonly request: WorkoutModificationRequest;
  readonly service?: WorkoutGenerationPipelineService;
  readonly deps?: WorkoutGenerationPipelineServiceDeps;
}): WorkoutModificationResult {
  return resolveService(options.service, options.deps).modifyWorkoutPlan(
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

/**
 * Public API — validate an adaptively modified WorkoutPlan against its source.
 */
export function validateAdaptedWorkoutPlan(options: {
  readonly plan: WorkoutPlan;
  readonly previous: WorkoutPlan;
}): WorkoutPlanValidation {
  return validateModifiedWorkoutPlan(options.plan, options.previous);
}

export type { WorkoutGenerationPipelineServiceDeps };
