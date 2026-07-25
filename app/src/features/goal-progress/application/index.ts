import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { GoalResult } from "../models/GoalResult";
import {
  createGoalProgressEngineService,
  type GoalProgressEngineService,
  type GoalProgressEngineServiceDeps,
} from "../services/GoalProgressEngineService";

function resolveService(
  service?: GoalProgressEngineService,
  deps?: GoalProgressEngineServiceDeps,
): GoalProgressEngineService {
  return service ?? createGoalProgressEngineService(deps);
}

/** Public API — evaluate adaptation signals into GoalProgress package. */
export function evaluateGoalProgress(options: {
  readonly input: GoalProgressInput;
  readonly service?: GoalProgressEngineService;
  readonly deps?: GoalProgressEngineServiceDeps;
}): GoalResult {
  return resolveService(options.service, options.deps).evaluateGoalProgress(options.input);
}

/** Public API — detect adaptation signal presence only. */
export function trackGoalProgress(options: {
  readonly input: GoalProgressInput;
  readonly service?: GoalProgressEngineService;
  readonly deps?: GoalProgressEngineServiceDeps;
}): GoalResult {
  return resolveService(options.service, options.deps).trackGoalProgress(options.input);
}

/** Public API — describe Goal Progress Engine capabilities. */
export function describeGoalProgress(options: {
  readonly service?: GoalProgressEngineService;
  readonly deps?: GoalProgressEngineServiceDeps;
} = {}): GoalDescriptor {
  return resolveService(options.service, options.deps).describeGoalProgress();
}

/** Public API — create adaptation snapshot. */
export function createGoalSnapshot(options: {
  readonly input: GoalProgressInput;
  readonly service?: GoalProgressEngineService;
  readonly deps?: GoalProgressEngineServiceDeps;
}): GoalResult {
  return resolveService(options.service, options.deps).createGoalSnapshot(options.input);
}

/** Public API — validate adaptation package integrity. */
export function validateGoalProgress(options: {
  readonly input: GoalProgressInput;
  readonly service?: GoalProgressEngineService;
  readonly deps?: GoalProgressEngineServiceDeps;
}): GoalResult {
  return resolveService(options.service, options.deps).validateGoalProgress(options.input);
}

export type { GoalProgressEngineServiceDeps };
