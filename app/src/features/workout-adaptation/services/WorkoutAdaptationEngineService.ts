import {
  createWorkoutAdaptationEngine,
  type WorkoutAdaptationEngine,
  type WorkoutAdaptationEngineDeps,
} from "../adaptation/WorkoutAdaptationEngine";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutResult } from "../models/WorkoutResult";

export type WorkoutAdaptationEngineServiceDeps = WorkoutAdaptationEngineDeps;

/**
 * Workout Adaptation Engine Service — orchestration facade.
 *
 * Workout Blueprint + Workout Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   → Workout Adaptation Engine
 *   → Updated Workout Blueprint → Workout Runtime
 */
export class WorkoutAdaptationEngineService {
  private readonly engine: WorkoutAdaptationEngine;

  constructor(deps: WorkoutAdaptationEngineServiceDeps = {}) {
    this.engine = createWorkoutAdaptationEngine(deps);
  }

  adaptWorkout(input: WorkoutAdaptationInput): WorkoutResult {
    return this.engine.adaptWorkout(input);
  }

  compareWorkout(input: WorkoutAdaptationInput): WorkoutResult {
    return this.engine.compareWorkout(input);
  }

  describeWorkoutAdaptation(): WorkoutDescriptor {
    return this.engine.describeWorkoutAdaptation();
  }

  createWorkoutSnapshot(input: WorkoutAdaptationInput): WorkoutResult {
    return this.engine.createWorkoutSnapshot(input);
  }

  validateWorkoutAdaptation(input: WorkoutAdaptationInput): WorkoutResult {
    return this.engine.validateWorkoutAdaptation(input);
  }
}

export function createWorkoutAdaptationEngineService(
  deps: WorkoutAdaptationEngineServiceDeps = {},
): WorkoutAdaptationEngineService {
  return new WorkoutAdaptationEngineService(deps);
}
