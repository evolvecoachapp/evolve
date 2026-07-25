import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutResult } from "../models/WorkoutResult";
import {
  createWorkoutAdaptationEngineService,
  type WorkoutAdaptationEngineService,
  type WorkoutAdaptationEngineServiceDeps,
} from "../services/WorkoutAdaptationEngineService";

function resolveService(
  service?: WorkoutAdaptationEngineService,
  deps?: WorkoutAdaptationEngineServiceDeps,
): WorkoutAdaptationEngineService {
  return service ?? createWorkoutAdaptationEngineService(deps);
}

/** Public API — adapt existing workout blueprint from continuous adaptation decisions. */
export function adaptWorkout(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).adaptWorkout(options.input);
}

/** Public API — compare blueprint / snapshot keys. */
export function compareWorkout(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).compareWorkout(options.input);
}

/** Public API — describe Workout Adaptation Engine capabilities. */
export function describeWorkoutAdaptation(options: {
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
} = {}): WorkoutDescriptor {
  return resolveService(options.service, options.deps).describeWorkoutAdaptation();
}

/** Public API — create workout adaptation snapshot. */
export function createWorkoutSnapshot(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).createWorkoutSnapshot(options.input);
}

/** Public API — validate workout adaptation package. */
export function validateWorkoutAdaptation(options: {
  readonly input: WorkoutAdaptationInput;
  readonly service?: WorkoutAdaptationEngineService;
  readonly deps?: WorkoutAdaptationEngineServiceDeps;
}): WorkoutResult {
  return resolveService(options.service, options.deps).validateWorkoutAdaptation(options.input);
}

export type { WorkoutAdaptationEngineServiceDeps };
